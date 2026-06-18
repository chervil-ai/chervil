'use strict';

// Pluggable model registry. Each provider implements:
//   async run({ query, history, onStatus, onText }) -> AgentResult
// where AgentResult is one of:
//   { kind: 'page', html, title, sources? }
//   { kind: 'navigate', url, reason? }
//
// Claude is the default. To add another backend (local model, OpenAI-compatible,
// etc.), drop a module here that exports a createProvider() factory with the same
// run() contract and register it in the `providers` map below.

const { createClaudeProvider } = require('./claude');
const { createOllamaProvider } = require('./ollama');
const { createOpenAICompatProvider } = require('./openai-compatible');

const providers = {
  claude: createClaudeProvider,
  ollama: createOllamaProvider, // local, free dev provider (no live web grounding)
  // OpenAI-compatible brains (compose-only — no live web grounding):
  grok: createOpenAICompatProvider, // xAI
  gemini: createOpenAICompatProvider, // Google (OpenAI-compatible endpoint)
  azure: createOpenAICompatProvider, // Azure AI Foundry / Azure OpenAI
};

// config: { provider, apiKey, model, ollamaModel, ollamaUrl } — runtime overrides
// (from the in-app "bring your own API" settings). Each field falls back to env.
function getProvider(config = {}) {
  const key = (
    config.provider ||
    process.env.PARSLEE_PROVIDER ||
    process.env.PINGCHAT_PROVIDER ||
    'claude'
  ).toLowerCase();
  const factory = providers[key];
  if (!factory) {
    throw new Error(
      `Unknown Parslee provider "${key}". Available: ${Object.keys(providers).join(', ')}`
    );
  }
  return factory(config);
}

module.exports = { getProvider };
