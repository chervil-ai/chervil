'use strict';

// The Quiz artifact — Chervil's second skill (RFC 0003), validating that the
// Skill framework generalizes beyond Lessons. A Quiz is a graded multiple-choice
// assessment on a topic: pure data, normalize + validate, like lib/lesson.js.

const { slugify } = require('./lesson');

const SCHEMA_VERSION = 1;
const LEVELS = ['beginner', 'intermediate', 'advanced'];

function str(v, max = 0) {
  let s = v == null ? '' : String(v);
  if (max > 0 && s.length > max) s = s.slice(0, max);
  return s;
}
function strArr(v, maxItems, maxLen) {
  if (!Array.isArray(v)) return [];
  let a = v.map((x) => str(x, maxLen)).filter(Boolean);
  if (maxItems > 0) a = a.slice(0, maxItems);
  return a;
}
function clampInt(v, lo, hi, dflt) {
  const n = Math.round(Number(v));
  if (!Number.isFinite(n)) return dflt;
  return Math.max(lo, Math.min(hi, n));
}

let _seq = 0;
function rid(p) { _seq += 1; return `${p}_${_seq.toString(36)}`; }

function normalizeQuestion(raw, id) {
  if (!raw || typeof raw !== 'object') return null;
  const question = str(raw.question, 1000);
  const options = strArr(raw.options, 6, 300);
  if (!question || options.length < 2) return null;
  return {
    id: id || rid('q'),
    question,
    options,
    answerIndex: clampInt(raw.answerIndex, 0, options.length - 1, 0),
    explanation: str(raw.explanation, 1000),
  };
}

/** Coerce raw (model) data into a valid Quiz; drops malformed questions. */
function normalizeQuiz(raw, meta = {}) {
  const o = raw && typeof raw === 'object' ? raw : {};
  const id = str(meta.id) || rid('quiz');
  const level = LEVELS.includes(str(o.level).toLowerCase()) ? str(o.level).toLowerCase() : 'beginner';
  const questions = (Array.isArray(o.questions) ? o.questions : [])
    .map((q, i) => normalizeQuestion(q, `${id}-q${i}`))
    .filter(Boolean);
  const title = str(o.title, 200) || str(o.topic, 200) || 'Quiz';
  const createdAt = str(meta.createdAt) || null;
  return {
    schemaVersion: SCHEMA_VERSION,
    kind: 'quiz',
    id,
    slug: slugify(title),
    title,
    topic: str(o.topic, 500),
    level,
    summary: str(o.summary, 1000),
    questions,
    authorModel: str(meta.authorModel) || null,
    createdAt,
    updatedAt: str(meta.updatedAt) || createdAt,
  };
}

function questionShapeError(q) {
  if (!q || typeof q !== 'object') return 'question not an object';
  if (!q.question) return 'missing question text';
  if (!Array.isArray(q.options) || q.options.length < 2) return 'needs >=2 options';
  if (!Number.isInteger(q.answerIndex) || q.answerIndex < 0 || q.answerIndex >= q.options.length) return 'answerIndex out of range';
  return '';
}

/** Validate a Quiz's structure + each question's shape. Returns { ok, errors }. */
function validateQuiz(quiz) {
  const errors = [];
  if (!quiz || typeof quiz !== 'object') return { ok: false, errors: ['not an object'] };
  if (quiz.schemaVersion !== SCHEMA_VERSION) errors.push(`schemaVersion must be ${SCHEMA_VERSION}`);
  if (!quiz.title) errors.push('missing title');
  if (!LEVELS.includes(quiz.level)) errors.push('invalid level');
  if (!Array.isArray(quiz.questions) || !quiz.questions.length) errors.push('needs at least one question');
  for (const q of quiz.questions || []) {
    const e = questionShapeError(q);
    if (e) errors.push(e);
  }
  return { ok: errors.length === 0, errors };
}

function questionCount(quiz) {
  return Array.isArray(quiz.questions) ? quiz.questions.length : 0;
}

module.exports = { SCHEMA_VERSION, LEVELS, normalizeQuiz, normalizeQuestion, validateQuiz, questionShapeError, questionCount };
