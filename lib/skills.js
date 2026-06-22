'use strict';

// The Skill framework — extracted from the learning vertical (RFC 0003).
//
// A Skill turns a user request into a structured, renderable artifact. The
// learning vertical established the shape: request → build (provider.complete →
// JSON → normalize → validate) → a self-contained HTML artifact (default +
// reader layouts) that can be rendered in-app, exported, and published. This
// module factors that into a contract + registry so new skills plug into the
// same pipeline (composer command, build, render, publish) by adding one entry.
//
// Learning is registered as the first skill, wrapping the existing functions —
// behavior is unchanged; this just routes the flow through the registry.

const { runBuildLesson } = require('./agent');
const { lessonToHtml } = require('./lessonHtml');
const { cardCount } = require('./lesson');

/**
 * @typedef {Object} Skill
 * @property {string} id            machine id, e.g. 'learn'
 * @property {string} name          display name, e.g. 'Learn'
 * @property {string} emoji
 * @property {string} description
 * @property {string} command       composer trigger, e.g. '/learn'
 * @property {(opts:{input:string, level?:string, goals?:string, config?:object})=>Promise<object>} build
 *           Produce a validated artifact from the user's request.
 * @property {(artifact:object, opts?:{reader?:boolean})=>string} toHtml
 *           Render the artifact to a self-contained HTML document.
 * @property {(artifact:object)=>{title:string, summary:string, count:number}} summarize
 *           Lightweight metadata for tab titles / publish previews.
 */

/** @type {Skill} */
const learnSkill = {
  id: 'learn',
  name: 'Learn',
  emoji: '🎓',
  description: 'Build an interactive, swipeable lesson on any topic.',
  command: '/learn',
  build({ input, level = 'beginner', goals = '', config = {} }) {
    return runBuildLesson({ topic: input, level, goals, config });
  },
  toHtml(lesson, opts = {}) {
    return lessonToHtml(lesson, opts);
  },
  summarize(lesson) {
    return {
      title: lesson.title || 'Lesson',
      summary: lesson.summary || lesson.subtitle || '',
      count: cardCount(lesson),
    };
  },
};

const SKILLS = [learnSkill];

/** A skill by id, or null. */
function getSkill(id) {
  return SKILLS.find((s) => s.id === id) || null;
}

/**
 * If `text` starts with a skill's command (e.g. "/learn photosynthesis"),
 * return { skill, input }; otherwise null.
 */
function matchCommand(text) {
  const t = String(text || '').trim();
  for (const skill of SKILLS) {
    const re = new RegExp('^' + skill.command.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s+(.+)', 'is');
    const m = t.match(re);
    if (m) return { skill, input: m[1].trim() };
  }
  return null;
}

module.exports = { SKILLS, getSkill, matchCommand, learnSkill };
