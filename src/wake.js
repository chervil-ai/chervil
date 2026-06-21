'use strict';

// "Hey Sprig" wake word via openWakeWord (ONNX), running on onnxruntime-web —
// fully on-device, free, no API key. The ort WASM runtime and the ONNX models are
// injected as bytes (the renderer reads them from the main process), so nothing is
// fetched over file:// and there's no network dependency.
//
// Pipeline (openWakeWord): 16 kHz audio → melspectrogram model → 32-bin mels
// (scaled /10 + 2) → embedding model over a 76-frame window (step 8) → 96-dim
// embeddings → wakeword model over the last 16 embeddings → score in [0,1].
(function () {
  const SR = 16000;
  const CHUNK = 1280;        // samples per audio frame from the worklet (80 ms)
  const MEL_BINS = 32;
  const EMB_WINDOW = 76;     // mel frames per embedding
  const EMB_STEP = 8;        // mel-frame stride between embeddings
  const EMB_DIM = 96;
  const WW_FRAMES = 16;      // embeddings per wakeword score
  const QUEUE_CAP = 40;      // drop oldest audio if inference falls behind

  let melSess = null, embSess = null, wwSess = null;
  let audioCtx = null, micStream = null, workletNode = null, srcNode = null;
  let running = false, paused = false, cfg = null;

  let melBuf = [];   // Float32Array(32) rows
  let embBuf = [];   // Float32Array(96) rows
  let framesSinceEmb = 0;
  let lastDetect = 0;
  let queue = [], draining = false;

  function available() { return typeof window.__ortReady !== 'undefined'; }

  async function ensureOrt() {
    await window.__ortReady;
    if (!window.ort) throw new Error('onnxruntime-web failed to load.');
    return window.ort;
  }

  function asU8(b) { return b instanceof Uint8Array ? b : new Uint8Array(b); }

  async function runMel(ort, samples) {
    // openWakeWord feeds int16-range values (not normalized [-1,1]).
    const scaled = new Float32Array(samples.length);
    for (let i = 0; i < samples.length; i++) scaled[i] = samples[i] * 32768;
    const t = new ort.Tensor('float32', scaled, [1, scaled.length]);
    const out = await melSess.run({ [melSess.inputNames[0]]: t });
    const o = out[melSess.outputNames[0]];
    const frames = o.dims[o.dims.length - 2];
    const rows = [];
    for (let f = 0; f < frames; f++) {
      const row = new Float32Array(MEL_BINS);
      for (let m = 0; m < MEL_BINS; m++) row[m] = o.data[f * MEL_BINS + m] / 10 + 2;
      rows.push(row);
    }
    return rows;
  }

  async function runEmb(ort, win) {
    const flat = new Float32Array(EMB_WINDOW * MEL_BINS);
    for (let i = 0; i < EMB_WINDOW; i++) flat.set(win[i], i * MEL_BINS);
    const t = new ort.Tensor('float32', flat, [1, EMB_WINDOW, MEL_BINS, 1]);
    const out = await embSess.run({ [embSess.inputNames[0]]: t });
    return new Float32Array(out[embSess.outputNames[0]].data);
  }

  async function runWW(ort, win) {
    const flat = new Float32Array(WW_FRAMES * EMB_DIM);
    for (let i = 0; i < WW_FRAMES; i++) flat.set(win[i], i * EMB_DIM);
    const t = new ort.Tensor('float32', flat, [1, WW_FRAMES, EMB_DIM]);
    const out = await wwSess.run({ [wwSess.inputNames[0]]: t });
    return out[wwSess.outputNames[0]].data[0];
  }

  async function processChunk(ort, chunk) {
    const mels = await runMel(ort, chunk);
    for (const m of mels) {
      melBuf.push(m);
      framesSinceEmb++;
      if (melBuf.length > EMB_WINDOW + 32) melBuf.shift();
      if (melBuf.length >= EMB_WINDOW && framesSinceEmb >= EMB_STEP) {
        framesSinceEmb = 0;
        const emb = await runEmb(ort, melBuf.slice(melBuf.length - EMB_WINDOW));
        embBuf.push(emb);
        if (embBuf.length > WW_FRAMES + 8) embBuf.shift();
        if (embBuf.length >= WW_FRAMES) {
          const score = await runWW(ort, embBuf.slice(embBuf.length - WW_FRAMES));
          const now = Date.now();
          if (score >= (cfg.threshold || 0.5) && now - lastDetect > (cfg.cooldownMs || 2500)) {
            lastDetect = now;
            try { cfg.onDetect && cfg.onDetect({ score }); } catch (_) { /* ignore */ }
          }
        }
      }
    }
  }

  async function drain() {
    if (draining) return;
    draining = true;
    const ort = window.ort;
    while (queue.length && running) {
      const chunk = queue.shift();
      if (paused) continue;
      try { await processChunk(ort, chunk); }
      catch (e) { try { cfg.onError && cfg.onError(e); } catch (_) { /* ignore */ } }
    }
    draining = false;
  }

  // A tiny AudioWorklet that buffers mic audio into fixed 1280-sample frames.
  const WORKLET_SRC =
    'class C extends AudioWorkletProcessor{constructor(){super();this.b=new Float32Array(1280);this.n=0;}' +
    'process(i){const c=i[0]&&i[0][0];if(!c)return true;' +
    'for(let k=0;k<c.length;k++){this.b[this.n++]=c[k];if(this.n===1280){this.port.postMessage(this.b.slice(0));this.n=0;}}return true;}}' +
    "registerProcessor('oww-cap',C);";

  // cfg: { ortWasm, melspec, embedding, keywordModel (bytes), threshold, cooldownMs, onDetect, onError }
  async function start(opts) {
    if (running) return;
    cfg = opts || {};
    const ort = await ensureOrt();
    if (!cfg.keywordModel) throw new Error('No wake-word model loaded.');

    ort.env.wasm.numThreads = 1;
    ort.env.wasm.simd = true;
    ort.env.wasm.wasmBinary = asU8(cfg.ortWasm);

    const so = { executionProviders: ['wasm'], graphOptimizationLevel: 'all' };
    melSess = await ort.InferenceSession.create(asU8(cfg.melspec), so);
    embSess = await ort.InferenceSession.create(asU8(cfg.embedding), so);
    wwSess = await ort.InferenceSession.create(asU8(cfg.keywordModel), so);

    micStream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true } });
    audioCtx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: SR });
    const blobUrl = URL.createObjectURL(new Blob([WORKLET_SRC], { type: 'application/javascript' }));
    await audioCtx.audioWorklet.addModule(blobUrl);
    URL.revokeObjectURL(blobUrl);
    srcNode = audioCtx.createMediaStreamSource(micStream);
    workletNode = new AudioWorkletNode(audioCtx, 'oww-cap');
    workletNode.port.onmessage = (e) => {
      if (!running || paused) return;
      queue.push(e.data);
      if (queue.length > QUEUE_CAP) queue.splice(0, queue.length - QUEUE_CAP);
      drain();
    };
    srcNode.connect(workletNode);
    // Keep the graph pulling without making noise.
    workletNode.connect(audioCtx.destination);

    melBuf = []; embBuf = []; framesSinceEmb = 0; queue = [];
    running = true; paused = false;
  }

  function pause() { paused = true; }
  function resume() { paused = false; melBuf = []; embBuf = []; framesSinceEmb = 0; queue = []; }

  async function stop() {
    running = false; paused = false;
    try { if (workletNode) { workletNode.port.onmessage = null; workletNode.disconnect(); } } catch (_) { /* ignore */ }
    try { if (srcNode) srcNode.disconnect(); } catch (_) { /* ignore */ }
    try { if (micStream) for (const t of micStream.getTracks()) t.stop(); } catch (_) { /* ignore */ }
    try { if (audioCtx) await audioCtx.close(); } catch (_) { /* ignore */ }
    for (const s of [melSess, embSess, wwSess]) { try { if (s && s.release) await s.release(); } catch (_) { /* ignore */ } }
    melSess = embSess = wwSess = null;
    workletNode = srcNode = micStream = audioCtx = null;
    melBuf = []; embBuf = []; queue = [];
  }

  window.ChervilWake = { start, stop, pause, resume, available, isRunning: () => running };
})();
