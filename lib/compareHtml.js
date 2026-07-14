'use strict';

// Render a Compare (lib/compare.js) to a self-contained comparison page: a
// sourced side-by-side table (items = columns, dimensions = rows), a verdict
// banner, "best for…" chips, and a numbered source list. Like quizHtml/lessonHtml
// this is a pure function returning one dark-theme HTML document; all interactivity
// (highlight winners, differences-only, focus a column) is local client JS — no
// bridge, so it exports/publishes self-contained.

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function hostOf(url) {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return ''; }
}

/**
 * @param {object} cmp  a normalized Compare artifact
 * @returns {string}
 */
function compareToHtml(cmp) {
  const items = Array.isArray(cmp.items) ? cmp.items : [];
  const dims = Array.isArray(cmp.dimensions) ? cmp.dimensions : [];
  const verdict = cmp.verdict || {};
  const sources = Array.isArray(cmp.sources) ? cmp.sources : [];

  // Header cells — one per item, plus a leading empty corner for the row labels.
  const heads = items.map((name, i) =>
    `<th class="item" data-col="${i}" title="Click to focus this column"><span class="itag">${esc(name)}</span></th>`
  ).join('');

  // Body rows — each dimension is a row; its winning cell (best) gets a ✓ badge.
  const rows = dims.map((d) => {
    const cells = (d.values || []).map((v, i) => {
      const win = d.best === i;
      return `<td class="cell${win ? ' win' : ''}" data-col="${i}">${win ? '<span class="chk">✓</span>' : ''}${esc(v)}</td>`;
    }).join('');
    const note = d.note ? `<span class="dnote">${esc(d.note)}</span>` : '';
    return `<tr>
      <th class="dim" scope="row">${esc(d.label)}${note}</th>
      ${cells}
    </tr>`;
  }).join('');

  const chips = (verdict.bestFor || []).map((b) =>
    `<div class="chip"><span class="chip-item">${esc(b.item)}</span><span class="chip-for">${esc(b.scenario)}</span></div>`
  ).join('');

  const srcList = sources.map((s, i) => {
    const h = hostOf(s.url);
    return `<li><a href="${esc(s.url)}" target="_blank" rel="noreferrer noopener"><span class="snum">${i + 1}</span><span class="stitle">${esc(s.title || s.url)}</span>${h ? `<span class="shost">${esc(h)}</span>` : ''}</a></li>`;
  }).join('');

  const verdictBlock = (verdict.winner || verdict.summary || chips) ? `
    <div class="verdict">
      <div class="vhead">${verdict.winner ? `<span class="trophy">🏆</span><span class="vwin">${esc(verdict.winner)}</span>` : '<span class="vwin">Bottom line</span>'}</div>
      ${verdict.summary ? `<p class="vsum">${esc(verdict.summary)}</p>` : ''}
      ${chips ? `<div class="chips">${chips}</div>` : ''}
    </div>` : '';

  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  :root{--bg:#0b0d12;--fg:#e6e6e6;--muted:#aab2c0;--green:#7be0a3;--line:rgba(255,255,255,.08);--card:rgba(255,255,255,.03);--win:rgba(123,224,163,.14)}
  *{box-sizing:border-box} body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.6 system-ui,-apple-system,Segoe UI,Roboto,sans-serif}
  .wrap{max-width:1000px;margin:0 auto;padding:28px 20px 120px}
  h1{font-size:30px;line-height:1.2;margin:0 0 6px} .sub{color:var(--muted);margin:0 0 12px}
  .meta{display:flex;gap:8px;flex-wrap:wrap;font-size:13px;color:var(--muted);margin-bottom:16px}
  .pill{border:1px solid var(--line);border-radius:999px;padding:2px 10px}
  .verdict{background:linear-gradient(180deg,rgba(123,224,163,.10),var(--card));border:1px solid rgba(123,224,163,.28);border-radius:16px;padding:18px 20px;margin:0 0 20px}
  .vhead{display:flex;align-items:center;gap:10px;font-size:19px;font-weight:700}
  .trophy{font-size:22px} .vwin{color:var(--green)}
  .vsum{margin:8px 0 0;color:var(--fg)}
  .chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}
  .chip{display:flex;flex-direction:column;background:rgba(255,255,255,.04);border:1px solid var(--line);border-radius:10px;padding:8px 12px;min-width:150px}
  .chip-item{font-weight:600;color:var(--green);font-size:13px} .chip-for{font-size:13px;color:var(--muted)}
  .controls{display:flex;gap:16px;flex-wrap:wrap;align-items:center;margin:0 0 12px;font-size:13px;color:var(--muted)}
  .controls label{display:flex;align-items:center;gap:7px;cursor:pointer;user-select:none}
  .controls input{accent-color:var(--green);width:15px;height:15px}
  .tscroll{overflow-x:auto;border:1px solid var(--line);border-radius:14px}
  table{border-collapse:collapse;width:100%;min-width:520px}
  th,td{text-align:left;padding:13px 16px;border-bottom:1px solid var(--line);vertical-align:top}
  thead th{position:sticky;top:0;background:#12151c;z-index:2;font-size:14px}
  th.item{cursor:pointer;white-space:nowrap} .itag{display:inline-block}
  thead th.item:hover .itag{color:var(--green)}
  th.dim{font-weight:600;color:var(--fg);background:var(--card);position:sticky;left:0;z-index:1;min-width:150px}
  .dnote{display:block;font-weight:400;font-size:12px;color:var(--muted);margin-top:2px}
  td.cell{color:var(--fg);font-size:15px}
  tbody tr:hover td,tbody tr:hover th.dim{background:rgba(255,255,255,.02)}
  td.win.hl{background:var(--win);box-shadow:inset 3px 0 0 var(--green)}
  .chk{display:inline-flex;align-items:center;justify-content:center;width:17px;height:17px;border-radius:50%;background:var(--green);color:var(--bg);font-size:11px;font-weight:800;margin-right:7px;vertical-align:1px}
  .dim.dim-hidden,.cell.col-dim{opacity:.32}
  .sources{margin-top:28px} .sources h2{font-size:15px;text-transform:uppercase;letter-spacing:.05em;color:var(--muted);margin:0 0 10px}
  .sources ol{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:6px}
  .sources a{display:flex;align-items:center;gap:10px;color:var(--fg);text-decoration:none;padding:8px 10px;border:1px solid var(--line);border-radius:9px}
  .sources a:hover{border-color:var(--green)}
  .snum{flex:none;width:20px;height:20px;border-radius:50%;background:var(--card);border:1px solid var(--line);display:flex;align-items:center;justify-content:center;font-size:11px;color:var(--muted)}
  .stitle{flex:1;font-size:14px} .shost{color:var(--muted);font-size:12px}
  .footnote{color:var(--muted);font-size:12px;margin-top:22px}
</style></head><body>
  <div class="wrap">
    <h1>${esc(cmp.title)}</h1>
    ${cmp.summary ? `<p class="sub">${esc(cmp.summary)}</p>` : ''}
    <div class="meta"><span class="pill">${items.length} options</span><span class="pill">${dims.length} factors</span><span class="pill">🌐 web-sourced</span></div>
    ${verdictBlock}
    <div class="controls">
      <label><input type="checkbox" id="hl" checked> Highlight winners</label>
      <label><input type="checkbox" id="diff"> Differences only</label>
      <span id="focusnote"></span>
    </div>
    <div class="tscroll">
      <table id="ct">
        <thead><tr><th class="dim"></th>${heads}</tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    ${srcList ? `<div class="sources"><h2>Sources</h2><ol>${srcList}</ol></div>` : ''}
    <p class="footnote">Built by Sprig from live web sources. Double-check anything decision-critical against the linked sources.</p>
  </div>
<script>(function(){
  var table=document.getElementById('ct');
  var hl=document.getElementById('hl'), diff=document.getElementById('diff'), note=document.getElementById('focusnote');
  var focus=null; // focused column index, or null

  function applyHighlight(){ table.querySelectorAll('td.win').forEach(function(c){ c.classList.toggle('hl', hl.checked); }); }

  function applyDiff(){
    table.querySelectorAll('tbody tr').forEach(function(tr){
      var cells=[].map.call(tr.querySelectorAll('td.cell'), function(c){ return c.textContent.replace(/^\\s*✓\\s*/,'').trim().toLowerCase(); });
      var allSame = cells.length>1 && cells.every(function(v){ return v===cells[0]; });
      tr.style.display = (diff.checked && allSame) ? 'none' : '';
    });
  }

  function applyFocus(){
    var cells=table.querySelectorAll('td.cell, th.item');
    cells.forEach(function(c){
      var col=parseInt(c.getAttribute('data-col'),10);
      c.classList.toggle('col-dim', focus!==null && col!==focus);
    });
    note.textContent = focus!==null ? 'Focusing “'+table.querySelectorAll('th.item .itag')[focus].textContent+'” — click its header again to clear' : '';
  }

  hl.addEventListener('change', applyHighlight);
  diff.addEventListener('change', applyDiff);
  table.querySelectorAll('th.item').forEach(function(h){
    h.addEventListener('click', function(){
      var col=parseInt(h.getAttribute('data-col'),10);
      focus = (focus===col) ? null : col;
      applyFocus();
    });
  });
  applyHighlight();
})();</script>
</body></html>`;
}

module.exports = { compareToHtml };
