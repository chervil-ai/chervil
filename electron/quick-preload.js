'use strict';

const { contextBridge, ipcRenderer } = require('electron');

// Minimal bridge for the floating quick-ask window.
contextBridge.exposeInMainWorld('quick', {
  /** Send the typed prompt to the main process (which hands it to the main window). */
  submit: (text) => ipcRenderer.send('chervil:quick-submit', text),
  /** Dismiss the quick-ask bar. */
  hide: () => ipcRenderer.send('chervil:quick-hide'),
  /** Called when the bar is (re)shown, so it can refocus + clear. */
  onShow: (cb) => ipcRenderer.on('chervil:quick-show', () => cb()),
  /** Wake mode: summoned by "Hey Sprig" — Sprig is listening for a spoken request. */
  onListening: (cb) => ipcRenderer.on('chervil:quick-listening', () => cb()),
});
