# Introducing Chervil

### The agentic, conversational web browser — and why we're building it in the open

---

I want to show you what I've been building. Not because it's finished — it isn't — but because the idea is clear enough now that it's worth saying out loud, and because I'd rather build it *with* you watching than unveil it from behind a curtain.

It's called **Chervil**.

## The web stopped working for us

For thirty years, browsing has worked the same way. You have a question. You translate it into keywords. You hand those keywords to a search engine. You get back ten blue links — most of them ads, SEO bait, or one useful sentence buried under three screens of cookie banners. You open six tabs. You skim. You stitch the answer together yourself. Then you do it again an hour later.

We've all just... accepted this. We became unpaid librarians for a system that profits when we stay lost.

But the web was never the point. **The answer was the point.** The page was the point. The thing you were trying to *do* was the point. Links were just the 1990s plumbing we used to get there.

The shift happening right now is bigger than "AI search." It's the move from **answer engines** to **agentic systems** — from an AI that *tells you* it's 5:45 in New York to an AI that *builds you a live clock*, remembers it, updates it, and keeps it ready whenever you need it. The AI stops handing you information and starts doing the work.

That's the bet behind Chervil: **the web should work for you.**

## What Chervil is

Chervil is an agentic, conversational web browser — a real desktop app, not a website or a wrapper around someone else's chatbot. Instead of typing keywords into a bar, you talk to **Sprig**, a leafy guide who searches the live web and **composes a complete, beautiful page** built for your exact question. And when you actually want a real site — your email, your bank, a web app — Sprig opens the real thing. Synthesized pages when synthesis is better; the live web when the live web is the point.

*(Chervil is "French parsley." Sprig is a sprig of parsley. The name and the mascot grew from the same plant — that's the idea: something small and fresh that makes everything around it better.)*

A few of the things it already does:

- **Composes pages, not link lists** — grounded in live search, with sources.
- **Living, interactive pages** — composed pages can call back to Sprig at runtime, so you get working mini-apps, not static printouts.
- **Deep Dive** — a research mode that produces a long, cited report and *vets for disinformation* as it goes.
- **A trust layer** — every page can show its work and one-click **verify** its own claims against live sources.
- **Spaces, living pages, remix, voice, agentic actions on real sites** — and bring-your-own-AI across Claude, Grok, Gemini, Azure, and local Ollama.

## The hard part we're determined to get right

Here's the question I keep getting, and it's the right one: *once an AI can act, what stops it from acting wrongly?*

Making decisions is easy. Preventing unauthorized ones is where it gets interesting. The trap most agentic systems fall into is letting the model be its own authority — "I decided it's fine, so I did it." That can never be secure, because the thing deciding is the thing that can be tricked.

So in Chervil, authority doesn't live in the model's reasoning. It lives in the runtime around it. The model *proposes*; a deterministic layer *disposes*. Payments, logins, and destructive actions hit a hard gate or a human. Credentials never touch the model's context. Permissions can't be self-widened. (There's a whole write-up on this — it's the part of agentic systems I think the industry is still under-building.)

## Why open source, and why now

Chervil will be **open source**, built in public, from the start. Two reasons.

First, an agentic browser asks for a lot of trust — it holds your keys and can act on your behalf. "Trust me" isn't good enough. "Read the code" is better. The safety model should be something you can *inspect*, not just something I promise.

Second, I'd rather build with a community than for an audience. The roadmap is long and the space is moving fast.

**So here's the honest status:** Chervil is early. It's alpha. There's no polished installer yet — today you run it from source. Plenty of features are built but still being hardened. I'm sharing it now, at this stage, on purpose.

If any of this resonates:

- ⭐ **Star and watch the repo** to follow along (and to get the v0.1 release when it lands).
- 💬 **Open an issue** with what you'd want a browser like this to do.
- 🌱 **Join the waitlist** for the first packaged build.

The blue link had a thirty-year run. It was a fine table of contents for the early internet. But you were never really trying to find a *page* — you were trying to get an *answer*, finish a *task*, understand a *thing*.

Chervil is my attempt at what the web looks like when it finally works for *you*.

**Stop searching. Start asking. Say hey to Sprig.**

---

*Chervil is in active, open development. Nothing here is a finished product — it's an invitation to build one together.*
