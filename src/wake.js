'use strict';

// Wake-word controller — "Hey Sprig" listening mode.
//
// Wraps Picovoice Porcupine (offline, on-device) via the vendored IIFE bundles
// (window.PorcupineWeb + window.WebVoiceProcessor). Detection runs entirely on
// the machine; the mic audio never leaves it until the user actually speaks a
// command (which the renderer then captures and transcribes separately).
//
// The params model (.pv) and any custom keyword (.ppn) are passed as base64 —
// Porcupine's `publicPath` option uses fetch(), which Chromium blocks on
// file://, so base64 is the only reliable path for a packaged/from-source app.
(function () {
  let worker = null;
  let running = false;
  let subscribed = false;

  function available() {
    return typeof window.PorcupineWeb !== 'undefined'
      && typeof window.WebVoiceProcessor !== 'undefined'
      && !!window.PorcupineWeb.PorcupineWorker;
  }

  function wvp() {
    return window.WebVoiceProcessor && window.WebVoiceProcessor.WebVoiceProcessor;
  }

  // keyword: { base64, label, sensitivity } for a custom .ppn, or { builtin, sensitivity }
  // where builtin is a BuiltInKeyword name (e.g. "Computer").
  async function start({ accessKey, modelBase64, keyword, onDetect, onError }) {
    if (running) return;
    if (!available()) throw new Error('Wake-word engine failed to load.');
    if (!accessKey) throw new Error('Add your Picovoice access key in Settings to enable “Hey Sprig”.');
    if (!modelBase64) throw new Error('Wake-word model is missing.');

    const PW = window.PorcupineWeb;
    const sensitivity = (keyword && typeof keyword.sensitivity === 'number') ? keyword.sensitivity : 0.6;
    let kw;
    if (keyword && keyword.base64) {
      kw = { label: keyword.label || 'Hey Sprig', base64: keyword.base64, sensitivity };
    } else {
      const name = (keyword && keyword.builtin) || 'Computer';
      const enumVal = PW.BuiltInKeyword && PW.BuiltInKeyword[name.replace(/\s+/g, '')];
      kw = { builtin: enumVal || name, sensitivity };
    }

    worker = await PW.PorcupineWorker.create(
      accessKey,
      kw,
      (detection) => { try { onDetect && onDetect(detection); } catch (_) { /* ignore */ } },
      { base64: modelBase64 },
      { processErrorCallback: (e) => { try { onError && onError(e); } catch (_) { /* ignore */ } } },
    );
    await wvp().subscribe(worker);
    subscribed = true;
    running = true;
  }

  // Free the mic without tearing down the engine (used while capturing a command
  // so the dictation recorder owns the microphone, then resume() re-arms).
  async function pause() {
    if (worker && subscribed && wvp()) { try { await wvp().unsubscribe(worker); } catch (_) { /* ignore */ } }
    subscribed = false;
  }
  async function resume() {
    if (worker && !subscribed && wvp()) { try { await wvp().subscribe(worker); subscribed = true; } catch (_) { /* ignore */ } }
  }

  async function stop() {
    try { if (worker && subscribed && wvp()) await wvp().unsubscribe(worker); } catch (_) { /* ignore */ }
    subscribed = false;
    try { if (worker && worker.release) await worker.release(); } catch (_) { /* ignore */ }
    try { if (worker && worker.terminate) worker.terminate(); } catch (_) { /* ignore */ }
    worker = null;
    running = false;
  }

  window.ChervilWake = { start, stop, pause, resume, available, isRunning: () => running };
})();
