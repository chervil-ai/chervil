'use strict';

const { contextBridge, ipcRenderer } = require('electron');

// Minimal bridge for the floating quick-ask window.
contextBridge.exposeInMainWorld('quick', {
  /** Send the typed prompt to the main process (which hands it to the main window). */
  submit: (text) => ipcRenderer.send('chervil:quick-submit', text),
  /** Dismiss the quick-ask bar. */
  hide: () => ipcRenderer.send('chervil:quick-hide'),
  /** Called when the bar is (re)shown, so it can refocus + clear. Passes {chat} = the current mode. */
  onShow: (cb) => ipcRenderer.on('chervil:quick-show', (_e, info) => cb(info || {})),
  /** Wake mode: summoned by "Hey Sprig" — Sprig is listening for a spoken request. */
  onListening: (cb) => ipcRenderer.on('chervil:quick-listening', () => cb()),

  // --- Inline chat panel ---
  /** Run one chat turn through the main renderer; resolves to { ok, text, sources, error }. */
  chat: (query) => ipcRenderer.invoke('chervil:quick-chat', { query }),
  /** Tell main the panel flipped between ask (false) and chat (true) so it resizes the window. */
  setMode: (chat) => ipcRenderer.send('chervil:quick-mode', !!chat),
  /** Open a source link from a reply in the main Chervil window. */
  openUrl: (url) => ipcRenderer.send('chervil:quick-open-url', String(url || '')),
  /** Hand the running conversation to the main Chervil window. */
  openInApp: () => ipcRenderer.send('chervil:quick-open-in-app'),
  /** Start a fresh chat — also clears the renderer's quick-chat history. */
  clear: () => ipcRenderer.send('chervil:quick-clear'),
  /** Main asks the panel to clear itself (e.g. after "Open in Chervil" handoff). */
  onReset: (cb) => ipcRenderer.on('chervil:quick-reset', () => cb()),
});
