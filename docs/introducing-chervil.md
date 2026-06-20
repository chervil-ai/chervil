# Introducing Chervil

### The agentic, conversational web browser — and why we're building it in the open

---

I want to show you what I've been building. Not because it's finished — it isn't — but because the idea is clear enough now that it's worth saying out loud, and because I'd rather build it *with* you watching than unveil it from behind a curtain.

It's called **Chervil**, and it's a reimagining of the most-used piece of software on Earth: the web browser.

---

## The web stopped working for us

For thirty years the web has worked the same way. You have a question. You translate it into keywords. You hand those keywords to a search engine. You get back ten blue links — most of them ads, SEO bait, or pages that bury one sentence of useful information under three screens of cookie banners, newsletter pop-ups, and autoplaying video. You open six tabs. You skim. You stitch the answer together yourself. You close the tabs. You do it again an hour later.

We've all just... accepted this. We learned to "search well." We learned which results to trust and which to skip. We became unpaid librarians for a system that makes money when we stay lost.

But here's the thing: the web was never the point. **The answer was the point.** The page was the point. The thing you were trying to *do* was the point. Links were just the 1990s plumbing we used to get there — a table of contents for a library we had to walk through ourselves.

There's a bigger shift underneath this, and it's the one that matters. We're moving from **answer engines** to **agentic systems** — from an AI that *tells you* it's 5:45 PM in New York to an AI that *builds you a live clock*, remembers it, keeps it updated, and has it ready whenever you need it. The AI stops handing you a fact and starts doing the work: gathering, organizing, presenting, maintaining. It creates artifacts that persist and can be reused.

That's the bet behind Chervil. The web should work *for you* — and the way it does that is by stopping you from manually gathering information at all.

What if, instead of you going to the web, the web came to you — assembled, on demand, into exactly the page you needed, by something that actually understood what you asked?

That's Chervil.

---

## What Chervil is

**Chervil is the agentic, conversational web browser.** It's a real desktop application — not a website, not a Chrome extension, not a wrapper around someone else's chatbot. It runs standalone on your machine and replaces the fundamental loop of browsing.

You don't type keywords into a bar. You talk — in plain language — to a character named **Sprig**. And instead of handing you a list of links, Sprig brings the web alive as a single, beautiful, self-contained page composed in real time, grounded in live web search, and built specifically for your question.

Ask "compare the iPhone 16 and the Pixel 9," and you don't get a results page. You get a crafted comparison — a styled spec table, the trade-offs that actually matter, real product images, current prices, and a short list of the sources Sprig consulted, all laid out like a polished magazine spread. Ask "plan me three days of street food in Tokyo," and you get an itinerary, not a link to someone else's. Ask "what's happening with interest rates this week," and Sprig searches, reads, cross-checks, and composes a briefing — with citations.

The page is the answer. The conversation is the interface. The web is the raw material. **You never have to go fetch it yourself again.**

---

## Meet Sprig

Every great interface has a face. Chervil's is **Sprig** — a glowing, leafy, faintly cyber-punk sprig of parsley who is the personality you actually talk to. Sprig isn't a gimmick mascot bolted onto a settings screen; Sprig *is* the product's voice. Sprig thinks out loud ("Sprig is searching the web…", "Sprig is reading sources…", "Sprig is composing your page…"), pairs every reply with a friendly avatar, and greets you by name.

There's even a wake phrase. Address Sprig directly — **"Hey Sprig, open YouTube"** — and the convention makes commands feel natural and conversational, like talking to a capable assistant rather than operating a machine. (It's graceful, not strict: everything works with or without the phrase.)

The name is a deliberate little pun. **Chervil is "French parsley"** — a delicate cousin of the herb Sprig is named for. The name and the mascot grew from the same plant, and that's the whole philosophy in a word: something small and fresh that quietly makes everything around it better.

---

## The paradigm shift: from *searching* to *summoning*

The deepest idea in Chervil is small to state and enormous in consequence:

> **Stop navigating to information. Summon it.**

A traditional browser is a vehicle — it takes *you* somewhere. Chervil is the opposite. It brings the destination *to you*, purpose-built, every time. There is no "somewhere" to drive to, because the page didn't exist until you asked for it. Sprig composes it on the spot.

This flips three assumptions the web has trained into us:

1. **You no longer adapt to pages — pages adapt to you.** No more skimming a recipe blogger's life story to find the ingredient list. Sprig gives you the part you wanted, in the shape you wanted it.

2. **You no longer collect tabs — you hold a conversation.** Follow-ups refine what's in front of you. "Make it dark mode." "Add a budget column." "Now just the vegetarian options." The page changes in place, because Sprig remembers what you're looking at.

3. **You no longer trust blindly — you verify on demand.** Every composed page can show its work and fact-check itself against live sources (more on that below).

This is what people mean when they say the web should *work for you*. Chervil makes that literal.

---

## How it actually works (a peek under the hood)

Chervil is built on Electron, which means it bundles its own browser engine — it depends on no installed browser and runs fully standalone. Inside, it's a clean three-part architecture: a main process that holds your keys and talks to AI providers, a sandboxed renderer that is the UI, and a model layer that's completely pluggable.

When you ask Sprig something, one of two things happens:

- **Compose a page.** The default. Sprig writes a complete, standalone HTML document — inline styles, thoughtful typography, real images, the works — and Chervil renders it in a sandboxed frame. Sprig only reaches for live web search when the question actually needs current data (news, prices, scores, "today/latest"), which keeps everyday answers fast.

- **Open a real site.** When you clearly want a *specific* live destination — your email, your bank, YouTube, a web app you need to log into — Sprig opens the real thing in an embedded live browser view. Hybrid by design: synthesized pages when synthesis is better, the real web when the real web is the point.

Composed pages render in an isolated sandbox for safety, but Chervil injects a tiny, trusted runtime into each one. That runtime is what makes the next idea possible.

---

## Living, interactive pages — not static printouts

Here's where Chervil stops being "a nicer search engine" and becomes something genuinely new.

The pages Sprig composes can **think.** Through an injected bridge, a page's own JavaScript can call back to Sprig at runtime — to fetch fresh, web-grounded data on demand. That means Sprig doesn't just write you a *document*; it can write you a working **mini-app.**

Ask for a weather page and you might get a live widget with a "Check now" button that actually re-queries current conditions. Ask for a stock comparison and the numbers can refresh themselves. Ask for a tracker, a calculator, a dashboard — and you get a real, interactive applet, composed on the fly, wired to live data, running inside your conversation. No app store. No install. No developer. Just: *describe the tool you want, and Sprig builds it.*

This is the "computed page" — software summoned by sentence. It's the clearest expression of the answer-engine-to-agentic-system shift: the AI doesn't answer your question, it builds you a thing that keeps answering it.

---

## A suite of superpowers

Chervil grew from a single good idea into a full, modern interface for *doing things* with the web. Here's the complete picture — and why each piece matters.

### Remix anything

Every composed page floats a **Remix bar**. One click reshapes what you're looking at: **Summarize** it, **Simplify** it, **Go deeper**, turn it into **Slides**, or pull out the **Key points** — each producing a fresh, derived page. The web becomes clay. The significance: a page is no longer a dead end you read and discard; it's a living object you bend to whatever shape the moment needs.

### Hear it, don't just read it — Audio Overview

Press the **🔊 Audio** button and Sprig narrates the page aloud, using your operating system's voices (you pick the voice and speed in Settings). It's a free, built-in way to turn any page into a listen-while-you-work briefing — research that follows you into the commute or the kitchen.

### Talk to Sprig — voice input

You don't even have to type. The **🎤 microphone** in the chat box lets you simply *speak* to Sprig. Chervil records, transcribes through a speech-to-text service of your choice, and drops your words into the conversation — optionally sending them automatically. Talking to the web, out loud, becomes the literal interface.

### Spaces — research that remembers

Working on something big? **Spaces** are persistent, topic-focused workspaces. Every page you compose can be collected into a Space, and then Sprig can **synthesize across everything you've gathered** — comparing, connecting, and drawing conclusions grounded in your own prior research, complete with a "From your Space" note showing what it drew on. It's the difference between a search history and an actual research notebook that thinks with you. This is the artifact-that-persists idea at the scale of a whole project.

### Deep Dive — agentic, cited research

Flip on the **🔬 Deep Dive** toggle and a simple question becomes a thorough investigation. Sprig runs a two-phase pipeline: first it researches the topic from many angles into a structured brief, then it composes a long, beautifully organized, **fully cited** report — executive summary, table of contents, comparison tables, inline citations, the lot. Crucially, it **vets for disinformation** as it goes: cross-checking significant claims across independent sources, tagging findings as well-established, contested, or unverified, and surfacing a "Verify & caveats" section so you always know what to trust and what to double-check. Research that's not just fast, but *honest*.

### The Trust layer — show your work, then check it

Two of the most important buttons in Chervil live on every page. **Sources** opens a panel showing exactly what Sprig did: the search queries it ran and the real pages it used, all clickable. And **✓ Verify** turns Sprig into a skeptic — it re-reads the page you're looking at, fact-checks each major claim against reputable live sources, and composes a "Trust Check" report with clear verdicts (✅ Verified, ⚠️ Contested, ❓ Unverified, ❌ False), a one-line basis for each, and citations. In an age of confident-sounding nonsense, Chervil builds the antidote directly into the page.

### Living pages — the web that updates itself

Tell Sprig to keep a page **live**, and it will. Pick a refresh interval and Chervil quietly re-grounds that page on a schedule — refreshing prices, scores, news, or anything else — *even while the app sits minimized in the background.* When something actually changes, you get a system notification; click it and Chervil jumps straight to the updated page. Your dashboard maintains itself. This is the live-clock idea made general: an artifact that doesn't just persist, but stays current without you.

### Agentic actions on the live web

When you're on a real site, Sprig can **operate it for you.** Tell it what to do — "search for noise-cancelling headphones," "find the contact page" — and Sprig reads the page, decides the next action, and clicks, types, and navigates to accomplish the task. And it does so *safely*: anything that submits, posts, or changes an account asks for your approval first, and Chervil hard-refuses to enter passwords, payment details, or complete purchases — those it always hands back to you. (More on how that safety is enforced below — it's the part of agentic systems that matters most.)

### The Thinking Canvas — browsing as a map, not a line

History in most browsers is a single back/forward line; go back and start something new, and your forward history is gone. Chervil treats each tab's history as a **branching tree.** Go back, ask something different, and you *fork* — nothing is lost. The **⌗ Map** view draws your whole exploration as a visual tree of pages with connecting edges, and you can click any node to jump there. Your train of thought becomes a place you can see and revisit.

### Bring your own everything — files, images, PDFs

Drag a file onto Chervil — text, CSV, an image, a PDF — and Sprig will compose a page grounded in *your* content. Ask it to analyze a spreadsheet, explain a document, or build a page from a report. The web Sprig works with includes the web *you* bring.

### A memory of you

In Settings, tell Sprig about yourself — where you are, what you do, how you like answers, your preferences and constraints. Sprig uses that "About you" memory to tailor every page it composes: the right units, the right tone, the right defaults, the right relevance. It's kept on your machine and sent only to the model you chose.

### Export and keep

Love a page Sprig made? **Save** it to disk as standalone HTML, or **export it as a PDF** with one click. And everything you compose is **auto-collected into History** — reopen any past page to restore it *and* the conversation around it, or send it to the Trash (which you can empty on your terms).

---

## Yours to configure: bring your own AI

Chervil doesn't lock you into one model or one company. It's built around a **pluggable provider system** with genuine bring-your-own-API support:

- **Claude (Anthropic)** — the flagship experience: top-quality composition, live web grounding via search *and* fetch, the full two-phase Deep Dive, and image-rich pages.
- **Grok (xAI)** — fast reasoning with live web grounding via xAI's Agent Tools API (server-side web and X search), with citations.
- **Gemini (Google)** — huge context, low cost, and live grounding via Google Search.
- **OpenAI** — strong general reasoning with live web grounding via the Responses API's web search, with citations.
- **Azure AI Foundry** — enterprise and compliance, running in your own Azure with your hosted models.
- **Ollama** — completely free, completely private, running offline on your own machine.

You hold your own keys, stored **encrypted at rest** on your device via your operating system's secure storage — Chervil's UI never even sees the raw key after you save it. The model dropdown auto-refreshes the latest available models from each provider (a free metadata call), so you're never stuck on a stale list.

### Connect Sprig to your tools — MCP

For power users, Chervil speaks **MCP** (the Model Context Protocol). Connect remote MCP servers in Settings and Sprig can use *their* tools and data as part of its agentic toolset — your calendar, a database, a SaaS app — calling them while it composes. The opt-in list is the trust boundary, so you decide exactly what Sprig can reach.

### Make it yours — tabs, layout, and feel

Chervil browses in **tabs**, each its own conversation and page history. Drag to reorder them like any browser; flip a single setting to turn the top tab strip into a vertical side rail. Pick your narration voice and speed, your notification preferences — the interface bends to you.

---

## The hard part we're determined to get right: execution control

Here's the question I keep getting, and it's the right one: *once an AI can act, what stops it from acting wrongly?*

Making decisions is easy. Preventing unauthorized ones is where it gets interesting. The trap most agentic systems fall into is letting the model be its own authority — "I decided it's fine, so I did it." That can never be secure, because the thing deciding is the same thing that can be jailbroken, prompt-injected by a page it reads, or simply wrong.

So in Chervil, **authority doesn't live in the model's reasoning. It lives in the runtime around it.** The model *proposes*; a deterministic layer *disposes*. Payments, logins, and destructive actions hit a hard gate or a human. Credentials never touch the model's context. Permissions can't be self-widened. The model has no power to grant itself more than it was given.

Visibility was never the hard part — we can already watch what these systems do. **Execution control is the missing capability**, and it's the part of agentic AI the whole industry is still under-building. We're building it in from the start, because a browser that can act on your behalf has to earn that trust at the mechanism level, not the marketing level.

---

## Privacy and safety, built in — not bolted on

A tool this capable has to be trustworthy by design, and Chervil is:

- **Your keys stay encrypted on your machine.** They're never stored in plain text and never round-tripped through the UI.
- **Composed pages run sandboxed.** Sprig's HTML executes in isolation, with a single trusted bridge as the only line back to the app.
- **The microphone is scoped to Chervil itself.** Embedded real sites in the live browser view can never silently grab your mic or camera.
- **Side-effects ask first.** When Sprig acts on a real website, anything that sends, submits, posts, or changes an account requires your explicit approval — and financial actions, passwords, and purchases are always handed back to you.
- **Honesty about facts.** From Deep Dive's disinformation vetting to the one-click Verify layer, Chervil is engineered to *distinguish* what's solid from what's shaky, rather than smoothing everything into equally confident prose.

---

## Why this is revolutionary

It's tempting to file Chervil under "AI search," but that undersells it. Search answers a question. Chervil changes the *relationship* between you and the web.

**The web comes to you.** You no longer travel a network of documents hoping one of them holds your answer. The answer is assembled and delivered, made-to-order, in the shape of your question.

**The web works for you.** It summarizes, simplifies, narrates, refreshes, fact-checks, researches, and even operates other sites on your behalf. It builds you tools on demand. It remembers your projects and your preferences. It's not a place you visit; it's an agent that acts.

**The web becomes a conversation.** No keyword translation, no tab graveyard, no skimming. Just you, talking — by text or by voice — to a guide who understands and responds with exactly what you needed, and shows its work.

This is the **modern, agentic web interface**: a single conversational surface where the entire open web is raw material, and an intelligent agent named Sprig turns it into living, trustworthy, interactive pages built for one person — you. Not ten blue links. Not a wall of someone else's content. The web, finally, on your side of the table.

---

## Why open source, and why now

Chervil will be **open source**, built in public, from the start. Two reasons.

First, an agentic browser asks for a lot of trust — it holds your keys and can act on your behalf. "Trust me" isn't good enough. "Read the code" is better. The safety model I just described should be something you can *inspect*, not just something I promise.

Second, I'd rather build with a community than for an audience. The roadmap is long and the space is moving fast, and the best version of this gets made in the open.

**So here's the honest status:** Chervil is early. It's alpha. There's no polished installer yet — today you run it from source. Plenty of features are built but still being hardened. I'm sharing it now, at this stage, on purpose — because the idea is worth pressure-testing in daylight.

If any of this resonates:

- ⭐ **Star and watch the repo** to follow along (and to get the first packaged release when it lands).
- 💬 **Open an issue** with what you'd want a browser like this to do.
- 🌱 **Join the waitlist** for the first signed build.

---

## The road ahead

Chervil is already a complete, working reimagining of the browser — but the direction is clear and the ambition is large: deeper multi-step agents that carry out whole tasks, Spaces that hold your files as permanent sources, richer computed pages that run real software, collaborative sessions, and ever-stronger trust tooling. The throughline never changes: **make the web come to you, and make it work for you.**

The blue link had a thirty-year run. It served us well as a table of contents for the early internet. But you were never really trying to find a *page* — you were trying to get an *answer*, finish a *task*, understand a *thing*.

Chervil is what the web looks like when it finally figures that out.

**Stop searching. Start asking. Say hey to Sprig.**

---

*Chervil is in active, open development. Nothing here is a finished product — it's an invitation to build one together.*
