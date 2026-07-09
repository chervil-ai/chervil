'use strict';

// AI hero-image generation for composed pages (opt-in; costs money).
//
// Claude can't generate images, so this uses a separate image-capable provider
// via the user's BYO key — OpenAI `gpt-image-1` first, falling back to Google
// Gemini's image model. Returns a `data:` URL (base64 PNG) the page can inline
// directly (the composed-page CSP already allows data: images), or null if no
// key is configured / generation fails.

// Build a tasteful, text-free hero prompt from the page's title + the user query.
function heroPrompt(title, topic) {
  const subject = String(title || topic || '').trim().slice(0, 300);
  const context = String(topic || '').trim().slice(0, 300);
  return [
    `A clean, modern, editorial hero illustration for an article titled "${subject}".`,
    context && context.toLowerCase() !== subject.toLowerCase() ? `Subject/context: ${context}.` : '',
    'Tasteful, professional, magazine-quality. Soft depth and lighting, cohesive color palette.',
    'Absolutely NO text, words, letters, captions, logos, or watermarks anywhere in the image.',
    'Wide 3:2 landscape composition suitable for a page header.',
  ].filter(Boolean).join(' ');
}

// OpenAI Images API (gpt-image-1) — returns base64 PNG.
async function generateOpenAI(prompt, apiKey, signal) {
  const resp = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model: 'gpt-image-1', prompt, n: 1, size: '1536x1024' }),
    signal,
  });
  if (!resp.ok) {
    let detail = '';
    try { detail = (await resp.json()).error?.message || ''; } catch { /* ignore */ }
    throw new Error(`OpenAI image error ${resp.status}${detail ? ': ' + detail : ''}`);
  }
  const data = await resp.json();
  const b64 = data && data.data && data.data[0] && data.data[0].b64_json;
  if (!b64) throw new Error('OpenAI returned no image data.');
  return `data:image/png;base64,${b64}`;
}

// xAI Grok image API (grok-2-image) — OpenAI-style /images/generations. Note:
// xAI ignores size/quality/style; it returns a url or b64_json. We ask for
// b64_json and fall back to fetching a returned url.
async function generateGrok(prompt, apiKey, signal) {
  const resp = await fetch('https://api.x.ai/v1/images/generations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model: 'grok-2-image', prompt, n: 1, response_format: 'b64_json' }),
    signal,
  });
  if (!resp.ok) {
    let detail = '';
    try { detail = (await resp.json()).error?.message || ''; } catch { /* ignore */ }
    throw new Error(`Grok image error ${resp.status}${detail ? ': ' + detail : ''}`);
  }
  const data = await resp.json();
  const item = data && data.data && data.data[0];
  if (item && item.b64_json) return `data:image/png;base64,${item.b64_json}`;
  if (item && item.url) return await urlToDataUrl(item.url, signal);
  throw new Error('Grok returned no image data.');
}

// Fetch a remote image and inline it as a data: URL (so it can't expire).
async function urlToDataUrl(url, signal) {
  const r = await fetch(url, { signal });
  if (!r.ok) throw new Error(`Image fetch error ${r.status}`);
  const mime = r.headers.get('content-type') || 'image/png';
  const buf = Buffer.from(await r.arrayBuffer());
  return `data:${mime};base64,${buf.toString('base64')}`;
}

// Google Gemini image model (generateContent with an image-capable model) —
// returns the first inline image part as base64.
async function generateGemini(prompt, apiKey, signal) {
  const model = 'gemini-2.5-flash-image';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    signal,
  });
  if (!resp.ok) {
    let detail = '';
    try { detail = (await resp.json()).error?.message || ''; } catch { /* ignore */ }
    throw new Error(`Gemini image error ${resp.status}${detail ? ': ' + detail : ''}`);
  }
  const data = await resp.json();
  const parts = data?.candidates?.[0]?.content?.parts || [];
  const img = parts.find((p) => p && p.inlineData && p.inlineData.data);
  if (!img) throw new Error('Gemini returned no image data.');
  const mime = img.inlineData.mimeType || 'image/png';
  return `data:${mime};base64,${img.inlineData.data}`;
}

/**
 * Generate a hero image. Auto-picks the available provider (OpenAI → Gemini).
 * @param {object} opts
 * @param {string} opts.title       page title
 * @param {string} [opts.topic]     the user's query / topic for context
 * @param {string} [opts.openaiKey]
 * @param {string} [opts.geminiKey]
 * @param {string} [opts.grokKey]
 * @param {AbortSignal} [opts.signal]
 * @returns {Promise<string|null>} data: URL, or null if nothing could be generated.
 */
async function generateHeroImage({ title, topic = '', openaiKey = '', geminiKey = '', grokKey = '', signal = null }) {
  const prompt = heroPrompt(title, topic);
  const errors = [];
  if (openaiKey) {
    try { return await generateOpenAI(prompt, openaiKey, signal); }
    catch (e) { errors.push(String(e && e.message ? e.message : e)); }
  }
  if (geminiKey) {
    try { return await generateGemini(prompt, geminiKey, signal); }
    catch (e) { errors.push(String(e && e.message ? e.message : e)); }
  }
  if (grokKey) {
    try { return await generateGrok(prompt, grokKey, signal); }
    catch (e) { errors.push(String(e && e.message ? e.message : e)); }
  }
  if (errors.length) throw new Error(errors.join(' | '));
  return null; // no image-capable key configured
}

// ---- AI image EDITING (the in-Chervil snip editor's "Ask Sprig" path) -------

function splitDataUrl(dataUrl) {
  const m = /^data:([^;]+);base64,(.*)$/.exec(String(dataUrl || ''));
  if (!m || !m[2]) throw new Error('Not a base64 data: URL.');
  return { mime: m[1] || 'image/png', b64: m[2] };
}

// OpenAI Images edits endpoint (gpt-image-1): multipart with the source image.
async function editOpenAI(imageDataUrl, instruction, apiKey, signal) {
  const { mime, b64 } = splitDataUrl(imageDataUrl);
  const form = new FormData();
  form.append('model', 'gpt-image-1');
  form.append('image', new Blob([Buffer.from(b64, 'base64')], { type: mime }), 'image.png');
  form.append('prompt', instruction);
  const resp = await fetch('https://api.openai.com/v1/images/edits', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` }, // FormData sets its own Content-Type
    body: form,
    signal,
  });
  if (!resp.ok) {
    let detail = '';
    try { detail = (await resp.json()).error?.message || ''; } catch { /* ignore */ }
    throw new Error(`OpenAI image-edit error ${resp.status}${detail ? ': ' + detail : ''}`);
  }
  const data = await resp.json();
  const out = data && data.data && data.data[0] && data.data[0].b64_json;
  if (!out) throw new Error('OpenAI returned no edited image.');
  return `data:image/png;base64,${out}`;
}

// xAI Grok Imagine edit endpoint — plain JSON with the source image inline as a
// base64 data URI; we ask for b64_json so nothing has to be re-fetched. Uses the
// standard grok-imagine-image model (fast, $0.02/image) rather than -quality —
// snip edits want snappy turnaround.
async function editGrok(imageDataUrl, instruction, apiKey, signal, resolution) {
  const resp = await fetch('https://api.x.ai/v1/images/edits', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'grok-imagine-image',
      prompt: instruction,
      image: { type: 'image_url', url: imageDataUrl },
      n: 1,
      response_format: 'b64_json',
      // Snips are usually small — keep output modest and shaped like the source
      // (the editor rescales results back down), EXCEPT for explicit upscales
      // ("AI enhance"), which ask for the 2k tier.
      resolution: resolution === '2k' ? '2k' : '1k',
      aspect_ratio: 'auto',
    }),
    signal,
  });
  if (!resp.ok) {
    let detail = '';
    try { detail = (await resp.json()).error?.message || ''; } catch { /* ignore */ }
    throw new Error(`Grok image-edit error ${resp.status}${detail ? ': ' + detail : ''}`);
  }
  const data = await resp.json();
  const item = data && data.data && data.data[0];
  if (item && item.b64_json) return `data:${item.mime_type || 'image/png'};base64,${item.b64_json}`;
  if (item && item.url) return await urlToDataUrl(item.url, signal);
  throw new Error('Grok returned no edited image.');
}

// Gemini image model: send the source image inline + the edit instruction.
async function editGemini(imageDataUrl, instruction, apiKey, signal) {
  const { mime, b64 } = splitDataUrl(imageDataUrl);
  const model = 'gemini-2.5-flash-image';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [
        { inlineData: { mimeType: mime, data: b64 } },
        { text: `Edit this image: ${instruction}. Return only the edited image, preserving everything not mentioned.` },
      ] }],
    }),
    signal,
  });
  if (!resp.ok) {
    let detail = '';
    try { detail = (await resp.json()).error?.message || ''; } catch { /* ignore */ }
    throw new Error(`Gemini image-edit error ${resp.status}${detail ? ': ' + detail : ''}`);
  }
  const data = await resp.json();
  const parts = data?.candidates?.[0]?.content?.parts || [];
  const img = parts.find((p) => p && p.inlineData && p.inlineData.data);
  if (!img) throw new Error('Gemini returned no edited image.');
  return `data:${img.inlineData.mimeType || 'image/png'};base64,${img.inlineData.data}`;
}

/**
 * Edit an image from a natural-language instruction ("add a red arrow pointing
 * at the button", "remove the toolbar at the top"). Auto-picks the available
 * edit-capable provider — Grok first (fastest and cheapest per edit), then
 * OpenAI, then Gemini.
 * @returns {Promise<string|null>} data: URL of the edited image, or null if no
 *          edit-capable key is configured.
 */
async function editImage({ imageDataUrl, instruction, grokKey = '', openaiKey = '', geminiKey = '', resolution = '', signal = null }) {
  const errors = [];
  if (grokKey) {
    try { return await editGrok(imageDataUrl, instruction, grokKey, signal, resolution); }
    catch (e) { errors.push(String(e && e.message ? e.message : e)); }
  }
  if (openaiKey) {
    try { return await editOpenAI(imageDataUrl, instruction, openaiKey, signal); }
    catch (e) { errors.push(String(e && e.message ? e.message : e)); }
  }
  if (geminiKey) {
    try { return await editGemini(imageDataUrl, instruction, geminiKey, signal); }
    catch (e) { errors.push(String(e && e.message ? e.message : e)); }
  }
  if (errors.length) throw new Error(errors.join(' | '));
  return null; // no edit-capable key configured
}

module.exports = { generateHeroImage, heroPrompt, editImage };
