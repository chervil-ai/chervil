'use strict';

// The Learn skill's `enrich` hook (RFC 0003): verify model-suggested YouTube
// media via oEmbed before a lesson is shown. Confirms each video exists, enriches
// title/caption from real metadata, and drops any that can't be verified (and
// now-empty modules). Runs in the main/Node context (uses fetch). Mutates in place.
async function verifyLessonMedia(lesson) {
  const cards = [];
  for (const m of (lesson.modules || [])) {
    for (const c of (m.cards || [])) {
      if (c.kind === 'media' && c.provider === 'youtube' && !c.verified) cards.push(c);
    }
  }
  await Promise.all(cards.map(async (c) => {
    try {
      const oembed = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${encodeURIComponent(c.videoId)}&format=json`;
      const res = await fetch(oembed, { signal: AbortSignal.timeout(6000) });
      if (!res.ok) return; // 401/404 => video doesn't exist or isn't embeddable
      const j = await res.json().catch(() => null);
      c.verified = true;
      if (j && j.title) {
        if (!c.title) c.title = String(j.title).slice(0, 200);
        if (!c.caption) c.caption = String(j.title).slice(0, 500);
      }
    } catch { /* network/timeout => leave unverified, dropped below */ }
  }));
  for (const m of (lesson.modules || [])) {
    m.cards = (m.cards || []).filter((c) => !(c.kind === 'media' && !c.verified));
  }
  lesson.modules = (lesson.modules || []).filter((m) => m.cards.length);
  return lesson;
}

module.exports = { verifyLessonMedia };
