# Agent files

Importable personas for Chervil. In the app: **👤 Agents** → **Import agent file…**
(or paste one) → **Activate**. While active, the agent shapes Sprig's behavior,
can pin a model, restrict which MCP servers it may use, and offer one-click
starter prompts. A scheduled task can also be set to run "as" an agent.

## Format

Markdown body = the persona / instructions. YAML frontmatter = config (all keys optional except a persona body):

```markdown
---
name: Display name
description: One-line summary
model: claude-opus-4-8        # applied only when it matches your current provider
provider: claude              # optional hint
mcp: [server-name, other]     # restrict the agent to these configured MCP servers
starters:                     # one-click prompts shown in the Agents panel
  - Do the thing
  - Another starter
---
You are ... (the persona, voice, priorities, and rules)
```

The examples in this folder are starting points — copy and tweak them.

## Create one from a session

Don't want to write frontmatter by hand? In **👤 Agents**, click **✨ Create
agent from this session** — Chervil distills the active tab's conversation into a
reusable persona (name, description, instructions, and starter prompts) you can
then review and edit. (Falls back to a prompt-seeded persona if your provider
can't synthesize.)

## Share one

Each agent has an **Export** button (in **👤 Agents**) that writes it back out as
a Markdown + frontmatter file in this same format — hand it to someone else and
they can import it.
