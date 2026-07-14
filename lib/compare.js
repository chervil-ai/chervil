'use strict';

// The Compare artifact — Chervil's third skill (RFC 0003). A Compare turns a
// "X vs Y" request into a sourced, side-by-side comparison: a set of items
// (columns) scored across dimensions (rows), plus a verdict ("bottom line" +
// "best for…"). Pure data + normalize + validate, like lib/lesson.js / lib/quiz.js.
//
// Unlike Lessons and Quizzes, a Compare is built on the WEB-SEARCH path (see
// runBuildCompare) so its cells are grounded in live sources, not model memory —
// the whole point of the "eliminate the blue links" comparison page.

const { slugify } = require('./lesson');

const SCHEMA_VERSION = 1;
const MAX_ITEMS = 5;
const MAX_DIMENSIONS = 14;

function str(v, max = 0) {
  let s = v == null ? '' : String(v);
  if (max > 0 && s.length > max) s = s.slice(0, max);
  return s;
}
function clampInt(v, lo, hi, dflt) {
  const n = Math.round(Number(v));
  if (!Number.isFinite(n)) return dflt;
  return Math.max(lo, Math.min(hi, n));
}
function normalizeSources(v) {
  if (!Array.isArray(v)) return [];
  const seen = new Set();
  return v
    .map((s) => ({ title: str(s && s.title, 300), url: str(s && s.url, 1000) }))
    .filter((s) => s.url && !seen.has(s.url) && seen.add(s.url))
    .slice(0, 30);
}

// One row: a labelled dimension with one cell value per item (same order/length
// as items) and an optional "best" index. Cells that don't line up are padded
// with '—' / truncated so the table stays rectangular.
function normalizeDimension(raw, itemCount) {
  if (!raw || typeof raw !== 'object') return null;
  const label = str(raw.label, 120);
  if (!label) return null;
  let values = Array.isArray(raw.values) ? raw.values.map((x) => str(x, 400)) : [];
  if (values.length < itemCount) values = values.concat(Array(itemCount - values.length).fill('—'));
  values = values.slice(0, itemCount).map((v) => v || '—');
  return {
    label,
    values,
    // -1 = no single winner (tie / not applicable, e.g. "Price" where lower is
    // subjective). Otherwise the index of the item that wins this row.
    best: clampInt(raw.best, -1, itemCount - 1, -1),
    note: str(raw.note, 300),
  };
}

function normalizeVerdict(raw, items) {
  const o = raw && typeof raw === 'object' ? raw : {};
  const bestFor = (Array.isArray(o.bestFor) ? o.bestFor : [])
    .map((b) => ({ item: str(b && b.item, 120), scenario: str(b && b.scenario, 240) }))
    .filter((b) => b.item && b.scenario)
    .slice(0, MAX_ITEMS);
  return {
    winner: str(o.winner, 120),
    summary: str(o.summary, 800),
    bestFor,
  };
}

/** Coerce raw (model) data into a valid Compare; keeps the table rectangular. */
function normalizeCompare(raw, meta = {}) {
  const o = raw && typeof raw === 'object' ? raw : {};
  const id = str(meta.id) || `compare_${Date.now().toString(36)}`;
  const items = (Array.isArray(o.items) ? o.items : [])
    .map((x) => (x && typeof x === 'object' ? str(x.name, 120) : str(x, 120)))
    .filter(Boolean)
    .slice(0, MAX_ITEMS);
  const dimensions = (Array.isArray(o.dimensions) ? o.dimensions : [])
    .map((d) => normalizeDimension(d, items.length))
    .filter(Boolean)
    .slice(0, MAX_DIMENSIONS);
  const title = str(o.title, 200) || (items.length ? items.join(' vs ') : 'Comparison');
  const createdAt = str(meta.createdAt) || null;
  return {
    schemaVersion: SCHEMA_VERSION,
    kind: 'compare',
    id,
    slug: slugify(title),
    title,
    topic: str(o.topic, 500),
    summary: str(o.summary, 1000),
    items,
    dimensions,
    verdict: normalizeVerdict(o.verdict, items),
    sources: normalizeSources(o.sources),
    authorModel: str(meta.authorModel) || null,
    createdAt,
    updatedAt: str(meta.updatedAt) || createdAt,
  };
}

/** Validate a Compare's structure. Returns { ok, errors }. */
function validateCompare(cmp) {
  const errors = [];
  if (!cmp || typeof cmp !== 'object') return { ok: false, errors: ['not an object'] };
  if (cmp.schemaVersion !== SCHEMA_VERSION) errors.push(`schemaVersion must be ${SCHEMA_VERSION}`);
  if (!cmp.title) errors.push('missing title');
  if (!Array.isArray(cmp.items) || cmp.items.length < 2) errors.push('needs at least 2 items to compare');
  if (!Array.isArray(cmp.dimensions) || !cmp.dimensions.length) errors.push('needs at least one dimension');
  for (const d of cmp.dimensions || []) {
    if (!d || !d.label) { errors.push('dimension missing label'); continue; }
    if (!Array.isArray(d.values) || d.values.length !== (cmp.items || []).length) {
      errors.push(`dimension "${d.label}" has the wrong number of cells`);
    }
  }
  return { ok: errors.length === 0, errors };
}

function dimensionCount(cmp) {
  return Array.isArray(cmp.dimensions) ? cmp.dimensions.length : 0;
}

module.exports = {
  SCHEMA_VERSION, MAX_ITEMS, MAX_DIMENSIONS,
  normalizeCompare, normalizeDimension, normalizeVerdict, validateCompare, dimensionCount,
};
