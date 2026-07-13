'use strict';

// Preload injected into every <webview> (real sites) — RFC 0008, Phase 8.3.
// Its ONLY job is to notice when the user submits a login form so Chervil can
// offer to save it. It runs in the isolated preload world: it exposes NOTHING to
// the page (no contextBridge), and talks to the host app only via sendToHost.
// The captured password is handed to the host renderer, which prompts to save it
// to the encrypted vault — nothing is stored without the user confirming.

const { ipcRenderer } = require('electron');

// --- Hide the (broken) Web Push API from real sites --------------------------
// Electron ships NO web-push service (no FCM/GCM — electron/electron#6697), so
// PushManager.subscribe() ALWAYS fails ("push service not available"). But Chromium
// still EXPOSES PushManager, so sites feature-detect push as supported and render
// broken "Enable notifications / Push" buttons that error when clicked. We remove
// the push surface from the page's MAIN world so those sites hide that UI.
// Notes: this preload runs in an isolated world (contextIsolation), so we inject a
// tiny inline <script> to reach the page realm; it runs at document-start, before
// the page's own feature detection. Chervil's own file:// UI isn't a webview, so
// it's untouched, and the Notification API is left intact (site notification
// permission prompts still work — only Web Push is removed).
(function hideWebPush() {
  const code =
    '(function(){' +
    "try{delete window.PushManager;}catch(e){try{Object.defineProperty(window,'PushManager',{configurable:true,get:function(){return undefined;}});}catch(_){}}" +
    'try{if(window.ServiceWorkerRegistration&&ServiceWorkerRegistration.prototype){delete ServiceWorkerRegistration.prototype.pushManager;}}catch(e){}' +
    'try{delete window.PushSubscription;}catch(e){}' +
    'try{delete window.PushSubscriptionOptions;}catch(e){}' +
    '})();';
  let done = false; // inject exactly once — the observer and readystatechange both race to it
  function inject() {
    if (done) return true;
    try {
      const root = document.documentElement || document.head || document.body;
      if (!root) return false;
      const s = document.createElement('script');
      s.textContent = code;
      root.appendChild(s);
      s.remove();
      done = true;
      return true;
    } catch (e) { return false; }
  }
  // documentElement usually exists at document-start; if not, inject the moment it does.
  // NOTE: under a strict page CSP (script-src without 'unsafe-inline') the browser
  // blocks this inline <script>, so push isn't hidden on those hardened sites — known
  // Electron limitation (a preload can't reach the page's main world any other way).
  if (!inject()) {
    try {
      const obs = new MutationObserver(() => { if (inject()) obs.disconnect(); }); // childList only — we await <html>
      obs.observe(document, { childList: true });
    } catch (e) { /* fall back to readystatechange */ }
    document.addEventListener('readystatechange', inject, { once: true });
  }
})();

(function () {
  function visible(el) { return el && el.offsetParent !== null && !el.disabled && !el.readOnly; }

  function findUsername(scope, pw) {
    const inputs = Array.prototype.slice.call((scope || document).querySelectorAll('input'));
    const pwIdx = inputs.indexOf(pw);
    // Prefer a visible text/email field just before the password.
    for (let i = pwIdx - 1; i >= 0; i--) {
      const el = inputs[i]; const t = (el.type || '').toLowerCase();
      if (!visible(el)) continue;
      if (t === 'email' || t === 'text' || t === 'tel' || t === '') return el.value || '';
    }
    // Fallback: any visible username-ish field anywhere.
    for (const el of inputs) {
      const t = (el.type || '').toLowerCase();
      const hay = ((el.name || '') + (el.id || '') + (el.getAttribute('autocomplete') || '')).toLowerCase();
      if (visible(el) && (t === 'email' || t === 'text') && /user|email|login|account/.test(hay)) return el.value || '';
    }
    return '';
  }

  function capture(scope, pwEl) {
    try {
      const pw = pwEl || (scope && scope.querySelector && scope.querySelector('input[type=password]'));
      if (!pw || !pw.value) return;
      ipcRenderer.sendToHost('chervil:login-submit', {
        href: location.href,
        username: findUsername(scope, pw),
        password: pw.value,
      });
    } catch (e) { /* never break the page */ }
  }

  // 1) Classic form submit containing a password field.
  document.addEventListener('submit', function (e) {
    try {
      const form = e.target;
      if (form && form.querySelector && form.querySelector('input[type=password]')) capture(form, null);
    } catch (e2) { /* ignore */ }
  }, true);

  // 2) Enter pressed inside a filled password field (SPA logins without a submit).
  document.addEventListener('keydown', function (e) {
    try {
      const el = e.target;
      if (e.key === 'Enter' && el && (el.type || '').toLowerCase() === 'password' && el.value) {
        capture(el.form || document, el);
      }
    } catch (e2) { /* ignore */ }
  }, true);

  // 4) mailto: links — hand them to the host so Chervil can open the user's
  // registered webmail compose (Your places) instead of dropping the click.
  document.addEventListener('click', function (e) {
    try {
      if (e.button !== 0) return;
      const t = e.target;
      const a = t && t.closest && t.closest('a[href^="mailto:" i]');
      if (!a) return;
      e.preventDefault();
      e.stopPropagation();
      ipcRenderer.sendToHost('chervil:mailto', { href: a.href });
    } catch (e2) { /* never break the page */ }
  }, true);

  // 3) Click on a likely login/submit button while a password field is filled.
  document.addEventListener('click', function (e) {
    try {
      const t = e.target;
      const btn = t && t.closest && t.closest('button, input[type=submit], [role=button], a');
      if (!btn) return;
      const pw = document.querySelector('input[type=password]');
      if (!pw || !pw.value || !visible(pw)) return;
      const label = ((btn.textContent || '') + ' ' + (btn.value || '') + ' ' + (btn.getAttribute('aria-label') || '')).toLowerCase();
      if (btn.type === 'submit' || /log\s?in|sign\s?in|sign\s?on|continue|submit|next|enter|access/.test(label)) {
        capture(pw.form || document, pw);
      }
    } catch (e2) { /* ignore */ }
  }, true);
})();
