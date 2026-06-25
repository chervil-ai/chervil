'use strict';

// Preload injected into every <webview> (real sites) — RFC 0008, Phase 8.3.
// Its ONLY job is to notice when the user submits a login form so Chervil can
// offer to save it. It runs in the isolated preload world: it exposes NOTHING to
// the page (no contextBridge), and talks to the host app only via sendToHost.
// The captured password is handed to the host renderer, which prompts to save it
// to the encrypted vault — nothing is stored without the user confirming.

const { ipcRenderer } = require('electron');

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
