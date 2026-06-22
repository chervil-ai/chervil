'use strict';

// Render a Quiz (lib/quiz.js) to a self-contained, gradeable HTML player.
// Like lessonHtml: pure function, dark theme; grading is local client JS (no
// bridge needed), rendered through Chervil's composed-page path.

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/**
 * @param {import('./quiz')} _  (typedef only)
 * @param {object} quiz
 * @returns {string}
 */
function quizToHtml(quiz) {
  const questions = Array.isArray(quiz.questions) ? quiz.questions : [];
  const total = questions.length;
  const qs = questions.map((q, i) => {
    const opts = q.options.map((o, oi) =>
      `<label class="opt"><input type="radio" name="q${i}" value="${oi}"><span class="dot"></span><span>${esc(o)}</span></label>`
    ).join('');
    return `<section class="q" data-answer="${q.answerIndex}">
      <p class="qt"><span class="num">${i + 1}</span>${esc(q.question)}</p>
      <div class="opts">${opts}</div>
      <p class="exp" hidden>${esc(q.explanation)}</p>
    </section>`;
  }).join('');

  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  :root{--bg:#0b0d12;--fg:#e6e6e6;--muted:#aab2c0;--green:#7be0a3;--line:rgba(255,255,255,.08);--card:rgba(255,255,255,.03)}
  *{box-sizing:border-box} body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.6 system-ui,-apple-system,Segoe UI,Roboto,sans-serif}
  .wrap{max-width:720px;margin:0 auto;padding:28px 20px 160px}
  h1{font-size:30px;line-height:1.2;margin:0 0 4px} .sub{color:var(--muted);margin:0 0 8px}
  .meta{display:flex;gap:8px;flex-wrap:wrap;font-size:13px;color:var(--muted);margin-bottom:8px}.pill{border:1px solid var(--line);border-radius:999px;padding:2px 10px}
  .q{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:20px;margin:16px 0}
  .qt{font-weight:600;margin:0 0 12px;display:flex;gap:10px;align-items:flex-start}
  .num{flex:none;width:24px;height:24px;border-radius:50%;background:var(--green);color:var(--bg);font-size:13px;display:flex;align-items:center;justify-content:center;font-weight:700}
  .opts{display:flex;flex-direction:column;gap:8px}
  .opt{display:flex;align-items:center;gap:10px;background:rgba(255,255,255,.04);border:1px solid var(--line);border-radius:10px;padding:11px 14px;cursor:pointer}
  .opt input{position:absolute;opacity:0;pointer-events:none}
  .opt .dot{flex:none;width:16px;height:16px;border-radius:50%;border:2px solid var(--muted)}
  .opt input:checked ~ .dot{border-color:var(--green);background:var(--green)}
  .opt.correct{border-color:var(--green);background:rgba(123,224,163,.12)} .opt.wrong{border-color:#ff6b6b;background:rgba(255,107,107,.12)}
  .exp{margin-top:12px;color:var(--muted);border-left:2px solid var(--green);padding-left:12px}
  .bar{position:sticky;bottom:0;background:linear-gradient(transparent,rgba(11,13,18,.95) 40%);padding:18px 0;display:flex;align-items:center;gap:16px}
  #submit{background:var(--green);color:var(--bg);border:0;border-radius:10px;padding:11px 22px;font:inherit;font-weight:700;cursor:pointer}
  #submit[disabled]{opacity:.5;cursor:default}
  #score{font-weight:600}
</style></head><body>
  <div class="wrap">
    <h1>${esc(quiz.title)}</h1>
    ${quiz.summary ? `<p class="sub">${esc(quiz.summary)}</p>` : ''}
    <div class="meta"><span class="pill">${esc(quiz.level)}</span><span class="pill">${total} questions</span></div>
    <form id="quiz">${qs}</form>
    <div class="bar"><button id="submit" type="button">Submit answers</button><div id="score"></div></div>
  </div>
<script>(function(){
  var total=${total};
  document.getElementById('submit').addEventListener('click',function(){
    var correct=0, answered=0;
    document.querySelectorAll('.q').forEach(function(q){
      var ans=parseInt(q.getAttribute('data-answer'),10);
      var picked=q.querySelector('input:checked');
      if(picked) answered++;
      q.querySelectorAll('.opt').forEach(function(opt){
        var v=parseInt(opt.querySelector('input').value,10);
        opt.querySelector('input').disabled=true;
        if(v===ans) opt.classList.add('correct');
        else if(picked && parseInt(picked.value,10)===v) opt.classList.add('wrong');
      });
      if(picked && parseInt(picked.value,10)===ans) correct++;
      var exp=q.querySelector('.exp'); if(exp && exp.textContent.trim()) exp.hidden=false;
    });
    var s=document.getElementById('score');
    s.textContent='You scored '+correct+' / '+total+(answered<total?' ('+(total-answered)+' skipped)':'');
    s.style.color = correct/total>=0.7 ? 'var(--green)' : 'var(--fg)';
    this.disabled=true;
  });
})();</script>
</body></html>`;
}

module.exports = { quizToHtml };
