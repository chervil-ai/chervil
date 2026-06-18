'use strict';

const { contextBridge, ipcRenderer } = require('electron');

// Minimal, safe bridge between the renderer UI and the agent in the main process.
contextBridge.exposeInMainWorld('parslee', {
  /**
   * Ask Parslee something.
   * @param {{query: string, history: Array}} payload
   * @returns {Promise<{ok: boolean, result?: object, error?: string}>}
   */
  ask: (payload) => ipcRenderer.invoke('parslee:ask', payload),

  /**
   * Subscribe to streamed HTML text deltas while a page is being generated.
   * The callback receives { requestId, delta } so the renderer can route to the right tab.
   */
  onChunk: (cb) => {
    const handler = (_e, payload) => cb(payload);
    ipcRenderer.on('parslee:chunk', handler);
    return () => ipcRenderer.removeListener('parslee:chunk', handler);
  },

  /**
   * Subscribe to status updates (e.g. "Searching the web…").
   * The callback receives { requestId, status }.
   */
  onStatus: (cb) => {
    const handler = (_e, payload) => cb(payload);
    ipcRenderer.on('parslee:status', handler);
    return () => ipcRenderer.removeListener('parslee:status', handler);
  },

  /** Applet bridge: a composed page asks Sprig for live data. */
  appletAsk: (payload) => ipcRenderer.invoke('parslee:applet-ask', payload),

  /** Per-provider key status: { claude, grok, gemini, azure, claudeFromEnv }. */
  getKeyStatus: () => ipcRenderer.invoke('parslee:get-key-status'),

  /** Save/clear a provider's API key (stored encrypted; '' clears it). */
  setApiKey: (provider, apiKey) => ipcRenderer.invoke('parslee:set-api-key', { provider, apiKey }),

  /** Live list of models for the given provider config. */
  listModels: (config) => ipcRenderer.invoke('parslee:list-models', { config }),

  /** Web-agent: ask Sprig for the next action on a live site. */
  agentStep: (payload) => ipcRenderer.invoke('parslee:agent-step', payload),

  /** Save a composed page to disk via a native save dialog. */
  savePage: (payload) => ipcRenderer.invoke('parslee:save-page', payload),

  /** Export a composed page as PDF via a native save dialog. */
  exportPdf: (payload) => ipcRenderer.invoke('parslee:export-pdf', payload),

  /** Transcribe recorded mic audio via the configured Whisper-compatible STT. */
  transcribe: (payload) => ipcRenderer.invoke('parslee:transcribe', payload),

  /** Show an OS notification (e.g. a Living page refreshed in the background). */
  notify: (payload) => ipcRenderer.invoke('parslee:notify', payload),

  /** Subscribe to notification clicks — receives { tabId, entryId } to jump to. */
  onNotificationClick: (cb) => {
    const handler = (_e, payload) => cb(payload);
    ipcRenderer.on('parslee:notification-click', handler);
    return () => ipcRenderer.removeListener('parslee:notification-click', handler);
  },

  /** Load persisted session state (tabs, prompts, pages). */
  loadState: () => ipcRenderer.invoke('parslee:load-state'),

  /** Persist session state. */
  saveState: (state) => ipcRenderer.invoke('parslee:save-state', state),
});
