'use strict';

// Render a Lesson (lib/lesson.js) to a self-contained HTML document.
//
// Two layouts, same content + components:
//   - default: the in-app lesson player (a scroll of cards grouped by module),
//     rendered through Chervil's composed-page path (sandbox + CHERVIL_RUNTIME),
//     so applet cards call window.chervil.ask(...) via the bridge.
//   - reader (opts.reader): a one-card-per-screen, swipe/scroll-snap deck for
//     mobile consumption and the published/exported bundle (Phase 2). Standalone
//     (no bridge) → applets degrade gracefully.
//
// Pure function (Lesson -> HTML string). No I/O, no app globals.

const crypto = require('crypto');

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// ---- card components (shared by both layouts) ----
function mediaInner(c) {
  const url = `https://www.youtube.com/watch?v=${esc(c.videoId)}`;
  const thumb = `https://i.ytimg.com/vi/${esc(c.videoId)}/hqdefault.jpg`;
  return `<div class="media"><a class="thumb" href="${url}" title="Watch on YouTube" style="background-image:url('${thumb}')"><span class="play">▶</span></a>${c.caption ? `<p class="cap">${esc(c.caption)}</p>` : ''}</div>`;
}
function checkInner(c) {
  const opts = c.options.map((o, i) => `<button class="opt" data-i="${i}">${esc(o)}</button>`).join('');
  return `<div class="check" data-answer="${c.answerIndex}">${c.question ? `<p class="q">${esc(c.question)}</p>` : ''}<div class="opts">${opts}</div><p class="exp" hidden>${esc(c.explanation)}</p></div>`;
}
function flashInner(c) {
  return `<div class="flash"><div class="front">${esc(c.front)}</div><button class="reveal">Reveal answer</button><div class="back" hidden>${esc(c.back)}</div></div>`;
}
function appletInner(c) {
  return `<div class="applet" data-prompt="${esc(c.prompt)}"><p class="desc">${esc(c.prompt)}</p><button class="run">▶ Try it with Sprig</button><div class="out" hidden></div></div>`;
}

const KIND_LABEL = { concept: 'Concept', media: 'Watch', applet: 'Try it', check: 'Check', flashcard: 'Recall' };

// Return the renderable parts of a card, or null if it shouldn't be shown.
function cardParts(c) {
  let body = '';
  switch (c.kind) {
    case 'concept': if (!c.html) return null; body = `<div class="concept">${c.html}</div>`; break; // model HTML, sandboxed
    case 'media': if (!c.verified) return null; body = mediaInner(c); break; // never show an unverified video
    case 'applet': body = appletInner(c); break;
    case 'check': body = checkInner(c); break;
    case 'flashcard': body = flashInner(c); break;
    default: return null;
  }
  const title = (c.kind === 'flashcard' || !c.title) ? '' : `<h3>${esc(c.title)}</h3>`;
  return { kind: c.kind, label: KIND_LABEL[c.kind] || c.kind, title, body };
}

// Flatten modules → [{ module, card, idx }], skipping cards that shouldn't render.
function flatten(lesson) {
  const out = [];
  let idx = 0;
  for (const m of (lesson.modules || [])) {
    for (const c of (m.cards || [])) {
      const parts = cardParts(c);
      if (parts) out.push({ module: m.title || '', parts, idx: idx++ });
    }
  }
  return out;
}

// Card behaviors (grading, reveal, applet ask). Shared by both layouts; calls
// window.__lessonProgress(idx) when a card is completed.
const INTERACTIVE_JS = `(function(){
  function done(el){ var w=el.closest('[data-idx]'); if(w && window.__lessonProgress) window.__lessonProgress(w.getAttribute('data-idx')); }
  document.querySelectorAll('.check').forEach(function(ch){
    var ans=parseInt(ch.getAttribute('data-answer'),10);
    ch.querySelectorAll('.opt').forEach(function(btn){
      btn.addEventListener('click', function(){
        if(ch.dataset.done) return; ch.dataset.done='1';
        var pick=parseInt(btn.getAttribute('data-i'),10);
        ch.querySelectorAll('.opt').forEach(function(b){ b.disabled=true; var bi=parseInt(b.getAttribute('data-i'),10); if(bi===ans)b.classList.add('correct'); else if(bi===pick)b.classList.add('wrong'); });
        var exp=ch.querySelector('.exp'); if(exp&&exp.textContent.trim())exp.hidden=false; done(ch);
      });
    });
  });
  document.querySelectorAll('.flash').forEach(function(f){ var b=f.querySelector('.reveal'); b&&b.addEventListener('click',function(){ var bk=f.querySelector('.back'); if(bk)bk.hidden=false; b.hidden=true; done(f); }); });
  document.querySelectorAll('.applet').forEach(function(a){ var btn=a.querySelector('.run'), out=a.querySelector('.out'); btn&&btn.addEventListener('click',function(){
    if(!(window.chervil&&window.chervil.ask)){ out.hidden=false; out.classList.add('err'); out.textContent='Interactive features need the Chervil app.'; return; }
    btn.disabled=true; var old=btn.textContent; btn.textContent='Working…'; out.hidden=false; out.classList.remove('err'); out.textContent='';
    window.chervil.ask(a.getAttribute('data-prompt')).then(function(r){ out.textContent=(r&&r.text)?r.text:'No response.'; btn.disabled=false; btn.textContent=old; done(a); }).catch(function(e){ out.classList.add('err'); out.textContent='Error: '+((e&&e.message)||e); btn.disabled=false; btn.textContent=old; });
  }); });
})();`;

// Component styles shared by both layouts.
const COMPONENT_CSS = `
  :root{ --bg:#0b0d12; --fg:#e6e6e6; --muted:#aab2c0; --green:#7be0a3; --line:rgba(255,255,255,.08); --card:rgba(255,255,255,.03); }
  *{box-sizing:border-box}
  .badge{display:inline-block;font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--bg);background:var(--green);border-radius:6px;padding:2px 8px;font-weight:700}
  .badge.check{background:#8b9bff}.badge.flashcard{background:#ffcf6b}.badge.media{background:#ff8fae}.badge.applet{background:#7be0a3}
  h3{margin:10px 0 12px;font-size:20px}
  .concept :where(h2,h3){margin-top:14px} .concept img{max-width:100%;border-radius:10px} .concept code{background:rgba(255,255,255,.07);padding:1px 5px;border-radius:5px}
  .media .thumb{display:block;aspect-ratio:16/9;background-size:cover;background-position:center;border-radius:10px;position:relative}
  .media .play{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:48px;color:#fff;text-shadow:0 2px 12px rgba(0,0,0,.6)}
  .media .cap{color:var(--muted);font-size:14px;margin:10px 2px 0}
  .opts{display:flex;flex-direction:column;gap:8px;margin-top:6px}
  .opt{text-align:left;background:rgba(255,255,255,.04);border:1px solid var(--line);color:var(--fg);padding:13px 14px;border-radius:10px;cursor:pointer;font:inherit}
  .opt:hover{border-color:rgba(255,255,255,.25)}
  .opt.correct{border-color:var(--green);background:rgba(123,224,163,.12)} .opt.wrong{border-color:#ff6b6b;background:rgba(255,107,107,.12)}
  .opt[disabled]{cursor:default;opacity:.85}
  .exp{margin-top:12px;color:var(--muted);border-left:2px solid var(--green);padding-left:12px}
  .flash{text-align:center} .flash .front{font-size:22px;font-weight:600;padding:8px 0 16px}
  .reveal,.run{background:var(--green);color:var(--bg);border:0;border-radius:10px;padding:11px 18px;font:inherit;font-weight:600;cursor:pointer}
  .flash .back{margin-top:16px;color:var(--green);font-size:18px}
  .applet .desc{color:var(--muted);margin:0 0 12px}
  .applet .out{margin-top:14px;white-space:pre-wrap;background:rgba(255,255,255,.04);border:1px solid var(--line);border-radius:10px;padding:14px;min-height:1em}
  .applet .out.err{border-color:#ff6b6b;color:#ffb3b3}
`;

function heroMeta(lesson, total) {
  return `<div class="meta"><span class="pill">${esc(lesson.level)}</span><span class="pill">${esc(lesson.estMinutes)} min</span><span class="pill">${total} cards</span></div>`;
}
function objectivesList(lesson) {
  return (lesson.objectives || []).length
    ? `<ul class="obj">${lesson.objectives.map((o) => `<li>${esc(o)}</li>`).join('')}</ul>` : '';
}
function sourcesList(lesson) {
  return (lesson.sources || []).length
    ? `<ul class="srclist">${lesson.sources.map((s) => `<li><a href="${esc(s.url)}">${esc(s.title || s.url)}</a></li>`).join('')}</ul>` : '';
}

// ---- default layout: scroll of cards grouped by module (in-app player) ----
function defaultDoc(lesson, total) {
  let idx = 0;
  const modulesHtml = (lesson.modules || []).map((m) => {
    const cards = (m.cards || []).map((c) => {
      const p = cardParts(c);
      if (!p) return '';
      const i = idx++;
      return `<section class="card" data-idx="${i}"><span class="badge ${esc(p.kind)}">${p.label}</span>${p.title}${p.body}</section>`;
    }).join('');
    return `<div class="module"><h2>${esc(m.title)}</h2>${m.summary ? `<p class="msum">${esc(m.summary)}</p>` : ''}${cards}</div>`;
  }).join('');
  const sources = sourcesList(lesson) ? `<footer class="sources"><h2>Sources</h2>${sourcesList(lesson)}</footer>` : '';
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>${COMPONENT_CSS}
  body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.6 system-ui,-apple-system,Segoe UI,Roboto,sans-serif}
  .progress{position:sticky;top:0;z-index:5;background:rgba(11,13,18,.9);backdrop-filter:blur(6px);border-bottom:1px solid var(--line);padding:12px 20px}
  .progress .bar{height:4px;background:var(--line);border-radius:3px;overflow:hidden;margin-top:8px}.progress .bar>i{display:block;height:100%;width:0;background:var(--green);transition:width .25s}
  .progress .label{font-size:13px;color:var(--muted)}
  .wrap{max-width:760px;margin:0 auto;padding:28px 20px 160px}
  .hero h1{font-size:32px;line-height:1.2;margin:0 0 6px} .hero .sub{color:var(--muted);margin:0 0 16px}
  .meta{display:flex;gap:8px;flex-wrap:wrap;font-size:13px;color:var(--muted);margin-bottom:14px}.meta .pill{border:1px solid var(--line);border-radius:999px;padding:2px 10px}
  ul.obj{margin:0 0 8px;padding-left:18px} .module{margin-top:40px}
  .module>h2{font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:var(--green);border-bottom:1px solid var(--line);padding-bottom:8px}
  .msum{color:var(--muted);margin-top:6px}
  .card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:20px;margin:16px 0}
  .sources{margin-top:48px;border-top:1px solid var(--line);padding-top:16px;color:var(--muted)}.sources h2{font-size:13px;text-transform:uppercase;letter-spacing:.08em;color:var(--muted)}.sources a{color:#8b9bff}.srclist{padding-left:18px}
</style></head><body>
  <div class="progress"><div class="label" id="plabel">0 / ${total} complete</div><div class="bar"><i id="pbar"></i></div></div>
  <div class="wrap">
    <div class="hero"><h1>${esc(lesson.title)}</h1>${lesson.subtitle ? `<p class="sub">${esc(lesson.subtitle)}</p>` : (lesson.summary ? `<p class="sub">${esc(lesson.summary)}</p>` : '')}${heroMeta(lesson, total)}${objectivesList(lesson)}</div>
    ${modulesHtml}${sources}
  </div>
<script>window.__lessonProgress=(function(){var d={},t=${total};return function(k){d[k]=true;var n=Object.keys(d).length,pb=document.getElementById('pbar'),pl=document.getElementById('plabel');if(pb)pb.style.width=(t?Math.round(n/t*100):0)+'%';if(pl)pl.textContent=n+' / '+t+' complete';};})();
${INTERACTIVE_JS}</script>
</body></html>`;
}

// ---- reader layout: one card per screen, swipe/scroll-snap (mobile/publish) ----
function readerDoc(lesson, total) {
  const flat = flatten(lesson);
  const heroSlide = `<section class="slide" data-idx="hero"><div class="slide-in hero"><h1>${esc(lesson.title)}</h1>${lesson.subtitle ? `<p class="sub">${esc(lesson.subtitle)}</p>` : (lesson.summary ? `<p class="sub">${esc(lesson.summary)}</p>` : '')}${heroMeta(lesson, total)}${objectivesList(lesson)}<p class="swipe-hint">Swipe up to begin ↑</p></div></section>`;
  const cardSlides = flat.map((f) => `<section class="slide" data-idx="${f.idx}"><div class="slide-in"><div class="eyebrow"><span class="badge ${esc(f.parts.kind)}">${f.parts.label}</span>${f.module ? `<span class="mod">${esc(f.module)}</span>` : ''}</div>${f.parts.title}${f.parts.body}</div></section>`).join('');
  const srcSlide = sourcesList(lesson) ? `<section class="slide" data-idx="src"><div class="slide-in"><h3>Sources</h3>${sourcesList(lesson)}</div></section>` : '';
  // The exported reader runs as a standalone file:// document — no app sandbox.
  // Ship a hardening CSP keyed to the SHA-256 of our own inline script, so any
  // model-injected <script>/handler that slipped through sanitization can't run
  // (different hash → blocked), while the reader's own JS still executes.
  const readerScript = `
  var slides=[].slice.call(document.querySelectorAll('.slide')), total=slides.length, deck=document.getElementById('deck'), pbar=document.getElementById('pbar');
  function update(){var i=Math.min(total,Math.round(deck.scrollTop/deck.clientHeight)+1);if(pbar)pbar.style.width=Math.round(i/total*100)+'%';}
  deck.addEventListener('scroll',function(){(window.requestAnimationFrame||window.setTimeout)(update);},{passive:true});
  update();
  function go(d){var h=deck.clientHeight;deck.scrollTo({top:Math.round(deck.scrollTop/h)*h+d*h,behavior:'smooth'});}
  window.addEventListener('keydown',function(e){if(e.key==='ArrowDown'||e.key==='PageDown'||e.key===' '){e.preventDefault();go(1);}else if(e.key==='ArrowUp'||e.key==='PageUp'){e.preventDefault();go(-1);}});
  window.__lessonProgress=function(){};
${INTERACTIVE_JS}`;
  const scriptHash = crypto.createHash('sha256').update(readerScript).digest('base64');
  const csp = `default-src 'none'; img-src https: data:; style-src 'unsafe-inline'; script-src 'sha256-${scriptHash}'; base-uri 'none'; form-action 'none'`;
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta http-equiv="Content-Security-Policy" content="${csp}">
<style>${COMPONENT_CSS}
  html,body{height:100%;margin:0}
  body{background:var(--bg);color:var(--fg);font:17px/1.6 system-ui,-apple-system,Segoe UI,Roboto,sans-serif}
  .topbar{position:fixed;top:0;left:0;right:0;height:4px;background:var(--line);z-index:10}.topbar>i{display:block;height:100%;width:0;background:var(--green);transition:width .2s}
  #deck{height:100dvh;overflow-y:auto;scroll-snap-type:y proximity;scroll-behavior:smooth;-webkit-overflow-scrolling:touch}
  .slide{min-height:100dvh;scroll-snap-align:start;display:flex;flex-direction:column;justify-content:center;padding:56px 22px;border-bottom:1px solid rgba(255,255,255,.04)}
  .slide-in{max-width:640px;margin:0 auto;width:100%}
  .hero h1{font-size:30px;line-height:1.18;margin:0 0 8px}.hero .sub{color:var(--muted);margin:0 0 16px}
  .meta{display:flex;gap:8px;flex-wrap:wrap;font-size:13px;color:var(--muted);margin-bottom:16px}.meta .pill{border:1px solid var(--line);border-radius:999px;padding:2px 10px}
  ul.obj{margin:0;padding-left:18px}.swipe-hint{color:var(--green);margin-top:28px;font-size:14px}
  .eyebrow{display:flex;align-items:center;gap:10px;margin-bottom:14px}.eyebrow .mod{font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
  .srclist{padding-left:18px}.srclist a{color:#8b9bff}
  .navhint{position:fixed;bottom:14px;left:0;right:0;text-align:center;color:var(--muted);font-size:12px;pointer-events:none}
</style></head><body>
  <div class="topbar"><i id="pbar"></i></div>
  <div id="deck">${heroSlide}${cardSlides}${srcSlide}</div>
  <div class="navhint">↑ / ↓ or swipe</div>
<script>${readerScript}</script>
</body></html>`;
}

/**
 * Render a Lesson to a full HTML document.
 * @param {import('./lesson').Lesson} lesson
 * @param {{reader?: boolean}} [opts] reader:true → swipe/scroll-snap deck.
 * @returns {string}
 */
function lessonToHtml(lesson, opts = {}) {
  // Denominator = cards that actually render (cardParts skips empties/unverified
  // media), not cardCount, so the progress bar can always reach 100%.
  const total = flatten(lesson).length;
  return opts && opts.reader ? readerDoc(lesson, total) : defaultDoc(lesson, total);
}

module.exports = { lessonToHtml };
