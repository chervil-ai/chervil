'use strict';

// Render a Lesson (lib/lesson.js) to a self-contained HTML document — the
// in-app lesson player. It is rendered through Chervil's normal composed-page
// path (srcdoc sandbox + injected CHERVIL_RUNTIME), so:
//   - applet cards call window.chervil.ask(...) via the existing bridge,
//   - <a href> clicks are intercepted by the runtime and opened by the app
//     (used by media cards to open the video).
// Being a pure function (Lesson -> HTML string) it is also the basis for the
// Phase 2 publish/mobile bundle. No I/O, no app globals.

const { cardCount } = require('./lesson');

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// A media card opens its video via a normal link, which CHERVIL_RUNTIME routes
// back to the app (Phase 0.5 will swap this for an oEmbed-verified facade that
// plays in the webview pane). Thumbnail comes straight from YouTube's CDN.
function mediaCard(c) {
  const url = `https://www.youtube.com/watch?v=${esc(c.videoId)}`;
  const thumb = `https://i.ytimg.com/vi/${esc(c.videoId)}/hqdefault.jpg`;
  return `<div class="media">
    <a class="thumb" href="${url}" title="Watch on YouTube" style="background-image:url('${thumb}')">
      <span class="play">▶</span>
    </a>
    ${c.caption ? `<p class="cap">${esc(c.caption)}</p>` : ''}
  </div>`;
}

function checkCard(c, idx) {
  const opts = c.options
    .map((o, i) => `<button class="opt" data-i="${i}">${esc(o)}</button>`)
    .join('');
  return `<div class="check" data-answer="${c.answerIndex}" data-idx="${idx}">
    ${c.question ? `<p class="q">${esc(c.question)}</p>` : ''}
    <div class="opts">${opts}</div>
    <p class="exp" hidden>${esc(c.explanation)}</p>
  </div>`;
}

function flashcard(c) {
  return `<div class="flash">
    <div class="front">${esc(c.front)}</div>
    <button class="reveal">Reveal answer</button>
    <div class="back" hidden>${esc(c.back)}</div>
  </div>`;
}

function appletCard(c) {
  // The prompt is the spec for an interactive moment. It runs live against the
  // bridge: "Try it" sends the prompt to Sprig and shows the result.
  return `<div class="applet" data-prompt="${esc(c.prompt)}">
    <p class="desc">${esc(c.prompt)}</p>
    <button class="run">▶ Try it with Sprig</button>
    <div class="out" hidden></div>
  </div>`;
}

const KIND_LABEL = { concept: 'Concept', media: 'Watch', applet: 'Try it', check: 'Check', flashcard: 'Recall' };

function renderCard(c, idx) {
  let inner = '';
  switch (c.kind) {
    case 'concept': inner = `<div class="concept">${c.html || ''}</div>`; break; // model HTML, sandboxed
    case 'media': inner = mediaCard(c); break;
    case 'applet': inner = appletCard(c); break;
    case 'check': inner = checkCard(c, idx); break;
    case 'flashcard': inner = flashcard(c); break;
    default: return '';
  }
  const title = c.kind === 'flashcard' ? '' : (c.title ? `<h3>${esc(c.title)}</h3>` : '');
  return `<section class="card" data-idx="${idx}">
    <span class="badge ${esc(c.kind)}">${KIND_LABEL[c.kind] || c.kind}</span>
    ${title}${inner}
  </section>`;
}

/**
 * Render a Lesson to a full HTML document.
 * @param {import('./lesson').Lesson} lesson
 * @returns {string}
 */
function lessonToHtml(lesson) {
  const total = cardCount(lesson);
  let idx = 0;
  const modulesHtml = (lesson.modules || []).map((m) => {
    const cards = (m.cards || []).map((c) => renderCard(c, idx++)).join('');
    return `<div class="module">
      <h2>${esc(m.title)}</h2>
      ${m.summary ? `<p class="msum">${esc(m.summary)}</p>` : ''}
      ${cards}
    </div>`;
  }).join('');

  const objectives = (lesson.objectives || []).length
    ? `<ul class="obj">${lesson.objectives.map((o) => `<li>${esc(o)}</li>`).join('')}</ul>`
    : '';
  const sources = (lesson.sources || []).length
    ? `<footer class="sources"><h2>Sources</h2><ul>${lesson.sources
        .map((s) => `<li><a href="${esc(s.url)}">${esc(s.title || s.url)}</a></li>`).join('')}</ul></footer>`
    : '';

  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">
<style>
  :root{ --bg:#0b0d12; --fg:#e6e6e6; --muted:#aab2c0; --green:#7be0a3; --line:rgba(255,255,255,.08); --card:rgba(255,255,255,.03); }
  *{box-sizing:border-box}
  body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.6 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;}
  .progress{position:sticky;top:0;z-index:5;background:rgba(11,13,18,.9);backdrop-filter:blur(6px);border-bottom:1px solid var(--line);padding:12px 20px;}
  .progress .bar{height:4px;background:var(--line);border-radius:3px;overflow:hidden;margin-top:8px}
  .progress .bar > i{display:block;height:100%;width:0;background:var(--green);transition:width .25s}
  .progress .label{font-size:13px;color:var(--muted)}
  .wrap{max-width:760px;margin:0 auto;padding:28px 20px 160px}
  .hero h1{font-size:32px;line-height:1.2;margin:0 0 6px}
  .hero .sub{color:var(--muted);margin:0 0 16px}
  .hero .meta{display:flex;gap:8px;flex-wrap:wrap;font-size:13px;color:var(--muted);margin-bottom:14px}
  .hero .meta .pill{border:1px solid var(--line);border-radius:999px;padding:2px 10px}
  ul.obj{margin:0 0 8px;padding-left:18px;color:var(--fg)}
  .module{margin-top:40px}
  .module > h2{font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:var(--green);border-bottom:1px solid var(--line);padding-bottom:8px}
  .msum{color:var(--muted);margin-top:6px}
  .card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:20px;margin:16px 0;}
  .card h3{margin:6px 0 12px;font-size:20px}
  .badge{display:inline-block;font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--bg);background:var(--green);border-radius:6px;padding:2px 8px;font-weight:700}
  .badge.check{background:#8b9bff}.badge.flashcard{background:#ffcf6b}.badge.media{background:#ff8fae}.badge.applet{background:#7be0a3}
  .concept :where(h2,h3){margin-top:14px} .concept img{max-width:100%;border-radius:10px} .concept code{background:rgba(255,255,255,.07);padding:1px 5px;border-radius:5px}
  .media .thumb{display:block;aspect-ratio:16/9;background-size:cover;background-position:center;border-radius:10px;position:relative}
  .media .play{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:48px;color:#fff;text-shadow:0 2px 12px rgba(0,0,0,.6)}
  .media .cap{color:var(--muted);font-size:14px;margin:10px 2px 0}
  .opts{display:flex;flex-direction:column;gap:8px;margin-top:6px}
  .opt{text-align:left;background:rgba(255,255,255,.04);border:1px solid var(--line);color:var(--fg);padding:11px 14px;border-radius:10px;cursor:pointer;font:inherit}
  .opt:hover{border-color:rgba(255,255,255,.25)}
  .opt.correct{border-color:var(--green);background:rgba(123,224,163,.12)} .opt.wrong{border-color:#ff6b6b;background:rgba(255,107,107,.12)}
  .opt[disabled]{cursor:default;opacity:.85}
  .exp{margin-top:12px;color:var(--muted);border-left:2px solid var(--green);padding-left:12px}
  .flash{text-align:center} .flash .front{font-size:20px;font-weight:600;padding:8px 0 14px}
  .reveal,.run{background:var(--green);color:var(--bg);border:0;border-radius:10px;padding:10px 16px;font:inherit;font-weight:600;cursor:pointer}
  .flash .back{margin-top:14px;color:var(--green);font-size:18px}
  .applet .desc{color:var(--muted);margin:0 0 12px}
  .applet .out{margin-top:14px;white-space:pre-wrap;background:rgba(255,255,255,.04);border:1px solid var(--line);border-radius:10px;padding:14px;min-height:1em}
  .applet .out.err{border-color:#ff6b6b;color:#ffb3b3}
  .sources{margin-top:48px;border-top:1px solid var(--line);padding-top:16px;color:var(--muted)} .sources h2{font-size:13px;text-transform:uppercase;letter-spacing:.08em;color:var(--muted)} .sources a{color:#8b9bff}
</style></head><body>
  <div class="progress"><div class="label" id="plabel">0 / ${total} complete</div><div class="bar"><i id="pbar"></i></div></div>
  <div class="wrap">
    <div class="hero">
      <h1>${esc(lesson.title)}</h1>
      ${lesson.subtitle ? `<p class="sub">${esc(lesson.subtitle)}</p>` : (lesson.summary ? `<p class="sub">${esc(lesson.summary)}</p>` : '')}
      <div class="meta"><span class="pill">${esc(lesson.level)}</span><span class="pill">${esc(lesson.estMinutes)} min</span><span class="pill">${total} cards</span></div>
      ${objectives}
    </div>
    ${modulesHtml}
    ${sources}
  </div>
<script>(function(){
  var total = ${total}, done = {};
  function mark(i){ done[i]=true; var n=Object.keys(done).length;
    var pb=document.getElementById('pbar'), pl=document.getElementById('plabel');
    if(pb) pb.style.width = (total? Math.round(n/total*100):0)+'%';
    if(pl) pl.textContent = n+' / '+total+' complete';
  }
  // Checks
  document.querySelectorAll('.check').forEach(function(ch){
    var ans = parseInt(ch.getAttribute('data-answer'),10), idx=ch.getAttribute('data-idx');
    ch.querySelectorAll('.opt').forEach(function(btn){
      btn.addEventListener('click', function(){
        if(ch.dataset.done) return; ch.dataset.done='1';
        var pick = parseInt(btn.getAttribute('data-i'),10);
        ch.querySelectorAll('.opt').forEach(function(b){ b.disabled=true;
          var bi=parseInt(b.getAttribute('data-i'),10);
          if(bi===ans) b.classList.add('correct'); else if(bi===pick) b.classList.add('wrong');
        });
        var exp=ch.querySelector('.exp'); if(exp && exp.textContent.trim()) exp.hidden=false;
        mark('card'+idx);
      });
    });
  });
  // Flashcards
  document.querySelectorAll('.flash').forEach(function(f){
    var b=f.querySelector('.reveal');
    b && b.addEventListener('click', function(){ var back=f.querySelector('.back'); if(back){back.hidden=false;} b.hidden=true;
      var card=f.closest('.card'); if(card) mark('card'+card.getAttribute('data-idx')); });
  });
  // Applets — live via the Chervil bridge.
  document.querySelectorAll('.applet').forEach(function(a){
    var btn=a.querySelector('.run'), out=a.querySelector('.out');
    btn && btn.addEventListener('click', function(){
      if(!(window.chervil && window.chervil.ask)){ out.hidden=false; out.classList.add('err'); out.textContent='Interactive features need the Chervil app.'; return; }
      btn.disabled=true; var old=btn.textContent; btn.textContent='Working…'; out.hidden=false; out.classList.remove('err'); out.textContent='';
      window.chervil.ask(a.getAttribute('data-prompt')).then(function(r){
        out.textContent=(r && r.text) ? r.text : 'No response.';
        btn.disabled=false; btn.textContent=old;
        var card=a.closest('.card'); if(card) mark('card'+card.getAttribute('data-idx'));
      }).catch(function(e){ out.classList.add('err'); out.textContent='Error: '+((e&&e.message)||e); btn.disabled=false; btn.textContent=old; });
    });
  });
})();</script>
</body></html>`;
}

module.exports = { lessonToHtml };
