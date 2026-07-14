# Changelog

All notable changes to Chervil are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project aims to
follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Resizable panes.** Drag the seam on the right edge of the **chat sidebar** (or,
  in vertical-tabs layout, the **tab rail**) to set its width — **double-click the
  seam to reset** to the default. Widths are remembered and sync across your
  machines. Dragging the sidebar well past its minimum snaps it closed (the same as
  Ctrl+\\).

### Fixed
- **The composer no longer clips its Send button on a narrow sidebar.** After the
  ⚖️ Compare toggle was added, the row of composer buttons could overflow a narrow
  chat sidebar and push **Send** off the edge; the buttons now wrap to a second row
  instead. (You can also just widen the sidebar now — see above.)
- **No more empty gap when the vertical tab rail is hidden.** Making the rail
  resizable gave it a fixed width, which left a blank strip on the left when you
  hid the tabs; the rail's column now collapses to zero when hidden, as before.

## [0.19.0] — 2026-07-14

Better than blue links. Chervil takes on the search engine head-on: ask it to
**compare** two things and it builds a sourced, side-by-side table with a verdict;
every composed page now **cites its sources inline** and shows how fresh they are;
and Chervil can **watch a page** for you and ping you when something changes — a
price drops, an item is back in stock, the docs update. Plus you can now **refine
a page in place** with a follow-up, right from the page itself. And the toolbar no
longer hides its buttons when the window isn't maximized.

### Added
- **Compare (a new skill).** Type `iPhone 16 vs Pixel 9` (or hit the new **⚖️**
  button, or `/compare …`) and Sprig researches the live web and builds a
  **side-by-side comparison** — your options as columns, the factors that matter as
  rows, the winner of each row flagged, a **"bottom line"** verdict, and a **"best
  for…"** guide. Every cell is grounded in real sources, not memory. Click a column
  header to focus it, or toggle **Differences only**.
- **Inline citations + source freshness.** When Sprig uses the web, composed pages
  now carry **numbered citation chips** on the specific claims they support, with a
  matching numbered Sources list. The **Sources** panel shows how recent each source
  is and a freshness summary (e.g. "Freshest source 2 days ago · 4 of 6 dated"), so
  you can see at a glance how current an answer is.
- **Page watchers.** Ask Chervil to **watch a page and tell you when something
  changes** — "watch this page and let me know when it's back in stock", "tell me
  when the price drops below $500". Sprig checks it on a schedule in the background
  and sends a notification (clicking it opens the page). Set one up by asking on any
  live site, or from **⏰ Schedules & watchers** with a URL and a condition.
- **In-page follow-up.** A composed page's action bar now has a **follow-up box** —
  type "make it shorter", "focus on the budget options", "add a section on X" and
  Sprig **refines the page in place** without you leaving it.

### Changed
- The **Toolbar buttons** picker in Settings now lays out in **two columns** so the
  full list is easier to scan.

### Fixed
- **The toolbar no longer hides buttons when the window isn't maximized.** When the
  top bar ran out of room, the right-most icons (Settings, Print, Zoom…) were pushed
  off-screen and unreachable. They now collapse into a **⋯ "More"** menu that appears
  only when needed, so every action stays reachable at any window size.

## [0.18.0] — 2026-07-13

Chervil learns to publish. Compose a page, then send it straight to your blog —
a real draft on **WordPress**, an import on **Medium**, a pre-filled editor on
**Substack**. There's a new **Share this page** menu (Fedica, AddToAny, and your
own networks) that opens each composer already written. The floating **Hey Sprig**
bar (Ctrl+Shift+Space) can now hold a real conversation without opening a tab. Plus
a **Mute tab** menu item and a quieter web (broken "Enable Push" buttons are gone).

### Added
- **Publish to your blog (WordPress, Substack & Medium).** From any composed page,
  **Publish to web → To WordPress / Substack / Medium…**. WordPress posts a real
  **draft** via its REST API (using an Application Password kept in your encrypted
  vault) and opens the editor to review. Medium uses its **Import a story** by URL
  (Chervil publishes the page first, then hands Medium the link — it adds a
  canonical back to your page). Substack opens your new-post editor with the post
  **copied to your clipboard** for a single paste. Configure your blogs in
  **Settings → Publishing & Sync → Blogs**. As always, Chervil drafts and fills —
  **you click Publish**.
- **Optional: let Sprig fill the editor.** A per-choice opt-in (Settings → Blogs)
  that fills the Substack editor's title and body for you — but always stops before
  Publish, so you post it yourself.
- **A "Share this page" menu (📣).** One button that drafts a post and opens the
  right composer pre-filled: **Fedica** (schedule it), **AddToAny** (share to 100+
  services, no extra account), and any social networks you've added in *Your places*.
  Choose which appear, and whether composers open in a popup window or a tab, in
  **Settings → Sharing**.
- **A real chat in the floating quick bar.** Press **Ctrl+Shift+Space** and hit 💬
  to chat with Sprig right there — no tab opened, no page composed. Carry the
  conversation into Chervil anytime with **↗ Open in Chervil**.
- **Mute tab** on the tab right-click menu — silence a noisy tab without switching
  to it.

### Changed
- Share composers (Fedica, AddToAny, your networks) open in a tidy **popup window**
  by default, riding your logged-in session — switch to a tab in Settings → Sharing.

### Fixed
- **Broken "Enable notifications / Push" buttons are hidden.** Electron ships no web
  push service, so those buttons always failed — Chervil now hides the Web Push API
  on embedded sites so they don't show up. (Site notifications still work.)

## [0.17.0] — 2026-07-10

A polish release aimed at the friction you feel every single morning. Your
pinned tabs now warm up in the background the moment Chervil launches, so the
first click on each one shows a loaded page instead of a spinner. Tab groups
grew a visible fold arrow so it's obvious they collapse. And opening a whole
Collection now drops its pages into a tab group named after the Collection, so
your working set arrives already organized.

### Added
- **Pinned tabs pre-warm on launch.** Restored tabs used to load lazily — the
  first time you clicked each one after starting Chervil, its page reloaded from
  scratch. Now your **pinned** tabs load quietly in the background right after
  launch (staggered so they don't all hit the network at once, and capped so
  they don't crowd out the tab you're actually using). Clicking through your
  morning tabs is instant. Costs nothing extra — it's just loading sites you
  were about to open anyway.
- **Open all → a named group.** **⧉ Open all** on a Library Collection now opens
  its pages into a **tab group named after the Collection**, so the whole set
  stays together (and folds away as one) instead of scattering across the strip.

### Changed
- **Tab groups show a fold arrow.** A group's header now carries a **▾ / ▸**
  chevron, so it's obvious at a glance that clicking it collapses and expands the
  group. (The collapse behavior itself is unchanged — this just makes it
  discoverable.)

## [0.16.0] — 2026-07-09

Your places, Collections, and a book press. This release teaches Chervil where
*you* live on the web, gives you working sets of pages that Sprig can compose
from, and turns any lesson or page into a real, publishable book.

### Added — Your places
- **Your places** (Settings → You). Register your webmail, blog, and socials by
  URL; then *"open my email"* / *"check my blog"* works typed, from the omnibox,
  or by voice, and your places show up in omnibox suggestions and as welcome-
  screen tiles.
- **mailto: links open your webmail** compose window in a tab, pre-addressed —
  no desktop mail app required — plus a ✉️ **Email this page** button.
- **Share to your networks.** Publish a page, blog post, or lesson and Sprig
  drafts a tailored post for each network and opens its compose box pre-filled.
  You always press Post yourself — Chervil never posts on your behalf.

### Added — Collections
- **Collections** — named working sets of pages, built from any tab's right-click
  **Add to Collection…**, living in **Library → Collections** and syncing with
  folder sync. Reopen the whole set in tabs, or use a Collection as a **data
  source**: *"compose a page based on the Kyoto Collection"* grounds a new page
  on your saved pages.

### Added — a book press
- **eBook export (EPUB / Kindle).** Any lesson or composed page becomes a proper
  chaptered EPUB — the format Kindle, Apple Books, Kobo, and KDP accept.
- **Print-ready PDF** at true trim sizes (6×9, 5×8, A5, Letter) with optional
  KDP-spec bleed, book typography, chapter breaks, and page numbers.
- **Image upscaling for print** — the snip editor gained **⤴ Upscale 2×** (on-
  device resample) and **✨ Enhance 2×** (AI upscaling through your image key);
  the print exporter doubles small images so they don't print soft.
- **The snip editor grew up** — open a snip in Chervil's own **image editor**
  (text, erase, crop, undo, all offline) with an *Ask Sprig* box for AI edits.

### Changed
- **"Hey Sprig" in a noisy room.** Wake detection now needs a sustained match,
  command capture tracks the room's noise floor, and a wake with no speech is
  discarded untranscribed — plus a **Noisy room mode** toggle that turns all of
  it up and always confirms before composing.

### Fixed
- **Background tabs really stay alive now.** A CSS one-liner was quietly
  detaching background tabs, so switching still reloaded the page. Fixed —
  switching is instant, scroll holds, and audio keeps playing. Also added a **⟳
  reload button**, **Reload** / **Duplicate tab** on the tab menu, and a
  hideable tab bar (**Ctrl+Shift+\\**).

## [0.15.0] — 2026-07-08

The big one: a real multi-tab engine, and Sprig on every page. Until today,
only the tab you were looking at was actually *running* — switch away and your
video stopped, your page state vanished, everything reloaded on return. Now
every tab is alive, private tabs are genuinely private, and tabs organize into
colored groups. On top of that, Sprig learned to work with the page you're
*on*: ask about it, translate it, have it read aloud, snip it, compare it with
your other tabs.

### Added — Sprig on every page
- **Ask about this page (💬)** — chat with Sprig about the live site you're
  viewing: "summarize this", "what does it say about X". Works in chat mode
  automatically, or click 💬 to route a single question there without leaving
  normal mode. If you've selected text on the page, Sprig knows that's what
  "this" refers to.
- **Translate this page (🌐)** — translate any live site in place (layout,
  links, and images stay put), to any language, with one-click "Show original".
- **Read aloud (🔊)** — Sprig narrates the article on a live site (or a
  composed page). Select a passage to hear just that part; click again to stop.
- **Compare your open tabs** — ask in chat: "compare my open tabs", "which tab
  mentions…". Sprig reads your other tabs' actual content, not just titles.
- **Snip (✂)** — drag-select any region of the screen and hand it straight to
  Sprig ("what's this chart?"), copy it, or save it to Downloads.

### Added — a browser you can organize
- **Tab groups** — name them, color them, collapse them. Right-click a tab →
  "Add to group…"; groups survive restarts.
- **Tab search** — start typing in the address bar and your open tabs appear
  first as "Switch to tab", so you stop re-opening pages you already have.
- **Send this page to your phone (📱)** — a QR code your phone camera opens.
- **Per-site zoom memory** — the site you always bump to 125% stays at 125%.
- **Spell-check** — red squiggles + right-click suggestions in every text
  field, tuned to your system language (Settings → Browser to turn off).
- **Welcome setup** — a first-run walkthrough for switchers: import your
  bookmarks/history/address, pick a search engine, make Chervil your default.
  Re-run it anytime from Settings → Browser.

### Changed — the engine under the tabs
- **Every tab is alive now.** Each live-site tab runs in its own view instead
  of sharing one: background tabs keep playing (music keeps going — the tab
  shows 🔊, click it to mute without switching), tab switching is instant, and
  scroll position + page state survive. The most recent handful of background
  sites stay warm; older ones simply reload when you return.
- **Private tabs are now truly private** — each gets its own isolated,
  in-memory session: separate cookies and storage that vanish when the tab
  closes. Sites in a private tab can't see your logged-in sessions (previously
  "private" only meant "not recorded"). Private sessions keep the same
  protections as normal ones: per-site permission prompts, ad-blocking, and
  safe downloads.

## [0.14.0] — 2026-07-07

The settle-in release. After 0.13.0 made it easy to *switch* to Chervil, this one
is about the everyday details that decide whether you *stay* — sites that can ask
for your camera the way a real browser does, PDFs that just open, a wake word that
won't run off and compose a page from the TV, and a password vault that finally
feels like a manager. Quieter than a headline feature, but this is the stuff you'd
miss in an hour.

### Added
- **Site permissions** (Settings → Browser). Embedded real sites now ask, per site,
  before using your **camera & microphone**, **location**, or **notifications** —
  and Chervil remembers your answer. Previously these were blanket-denied to every
  site, which broke video calls and maps; now you can allow the sites you trust and
  review or revoke any choice later.
- **Built-in PDF viewer** — PDFs now open inline in the browser instead of silently
  downloading (explicit "download" links still download).
- **Wake-word confirmation gate** — when "Hey Sprig" is triggered, Chervil shows
  what it heard and waits for you to confirm before composing (auto-cancels after a
  few seconds). On by default; turn it off in Settings → Voice for a quiet room.
  Stops a false trigger (e.g. TV audio) from composing a page on its own.
- **Password & card manager upgrades** — search your saved logins, **copy** a
  password or card number to the clipboard, and **edit** a saved login in place
  (change the username or set a new password without deleting and re-adding).

### Changed
- The Library drawer picked up the remaining Fluent polish (rounded panel, elevated
  tab bar, consistent thin scrollbar).

## [0.13.0] — 2026-07-06

The switch release. Moving to a new browser usually means leaving your life
behind — this one is about bringing it with you. Chervil now **imports from
Chrome, Edge, Brave, and Vivaldi**: your bookmarks, your history, your saved
passwords, and your address autofill. It also reorganizes the Library around a
cleaner idea — **Favorites** for the websites you love, **Saved Pages** for the
Chervil pages you compose — and fixes a real sync bug where deleted items could
quietly come back.

### Added
- **Import from another browser** (Settings → Browser → Import). Bring your data
  over from Chrome, Edge, Brave, or Vivaldi — read-only, and with no new
  dependencies (it uses the SQLite reader built into the app runtime):
  - **Bookmarks → Favorites**, keeping their folder structure.
  - **Browsing history** into the History tab (your most recent visits).
  - **Passwords** from a browser CSV export, saved straight into your encrypted
    vault. The file is parsed and stored **entirely in the main process** —
    plaintext passwords never reach the UI — and it works regardless of Chrome's
    newer app-bound encryption, because the browser decrypts them for the export.
  - **Address & contact autofill**, filling your saved identity in one click.
- **Favorites** — a ★ list of your favorite websites, with folders, collapsible
  sections, a **Collapse/Expand-all** control, and an optional **favorites bar**
  under the address bar.
- **"Chervil Chat" in the browser extension** — a right-click option that just
  *asks* Chervil about the page or your selection in chat, without composing a page.
- **Clickable links in chat** — URLs in Sprig's replies now open in a new tab.
- **Card 💳 and login 🔑 fill buttons** are now part of **Toolbar Options**, so you
  can show or hide them like any other address-bar button.
- **A dedicated Browser settings page** collecting Browsing & privacy and Import.

### Changed
- **The Library, reorganized around what things actually are:**
  - **Bookmarks → "Saved Pages"** — the composed Chervil pages you save, now
    organized by **Spaces**, with **Synthesize** and **Publish** right there.
  - **Websites live in Favorites**, not mixed in with saved pages. Anything you'd
    saved as a site (or just imported) moves to Favorites automatically.
  - **"Sites" → "History"** — your web browsing history, named like every browser.
  - The old composed-pages "History" tab is now **"Activity"** — a flat, automatic
    timeline of everything you compose.
- The bookmark button is now a proper bookmark icon; the ★ star belongs to Favorites.

### Fixed
- **Deletions now survive sync.** Deleting a page, site, agent, or schedule — or
  emptying Trash — on one computer no longer reappears after your synced folder
  updates from another machine (tombstone-based deletes, matching how bookmarks
  already worked), including a handful of edge cases around re-adding a
  just-deleted item.
- Faster Library folder rendering with large collections, and lighter import
  pickers (no longer copying whole databases just to show a count).

## [0.12.0] — 2026-07-03

The wallet release. Chervil already kept your passwords in an encrypted,
passphrase-locked vault; now it keeps your **payment cards** there too — filled
into a checkout with one deliberate click, never shown to Sprig, never
auto-submitted. Plus a real fix for making Chervil your Windows default browser
(it now actually registers as a browser, so it shows up in the picker), and
show/hide toggles for the address-bar fill buttons.

### Added
- **Payment-card autofill.** Save cards to the **same encrypted vault** as your
  passwords (one master passphrase, AES-256-GCM + your OS keychain) and fill them
  at checkout with a new **💳 button** on the address bar — name, number, and
  expiry, across combined `MM/YY` fields or separate month/year inputs and
  dropdowns. It **never auto-submits**, and card details are **never shown to
  Sprig** and never written to the plaintext settings file. For your security the
  **CVC is never stored** — you type it yourself at checkout — and card listings
  show only the brand and last four digits. Manage cards in **Settings → Security
  → Payment cards** (add, reveal, delete). Numbers are Luhn-checked on save.
- **Show/hide the fill buttons.** New toggles in **Settings → Security** let you
  hide the 🔑 (saved-login) and 💳 (saved-card) buttons from the address bar if you
  don't want them there. Both are shown by default.

### Fixed
- **"Make default browser" now actually works on Windows.** Previously the button
  only opened the Windows *Default apps* page — where Chervil wasn't even listed as
  a browser to choose. It now registers Chervil's browser capabilities in the
  registry (per-user, no admin needed) so it appears as a selectable web browser,
  deep-links to its own entry in the picker, and keeps the registration fresh
  across updates. The confirmation is honest about the one manual step Windows
  still requires (no app can silently seize the default), and dev builds say so
  instead of sending you on a dead-end trip.

## [0.11.0] — 2026-07-02

The everyday-browser release. Chervil is AI-first — but to be the browser you *live*
in, it also has to do the mundane things every browser does. This release fills in
that furniture: page zoom, a downloads shelf, printing, favicons, reader mode, a
real bookmarks bar with folders, ad & tracker blocking, private tabs, multiple
windows, picture-in-picture, and an address bar that suggests your history as you
type — plus Chervil can now be your OS default browser. None of it dilutes the
thesis; all of it removes a reason not to switch. (Also: Ollama can now use an
optional auth token for remote servers.)

### Added
- **Page zoom.** Zoom composed pages *and* embedded sites like a real browser —
  `Ctrl +` / `Ctrl −` / `Ctrl 0`, or a `−  100%  +` cluster in the toolbar (click the
  percentage to reset). Persists across sessions. Toggle the cluster in
  **Settings → toolbar buttons** (or right-click the toolbar).
- **Downloads shelf.** Files you download from embedded sites now land in a
  persistent **Downloads** tab in the Library, with **Open**, **Show in folder**,
  and **Remove** (removing only clears the list, never the file).
- **Print.** `Ctrl+P` (or **View → Print…**) prints the current page or site
  through the normal system print dialog. Optional toolbar button too.
- **Reader view.** On a live site, one click declutters the article into a clean,
  readable page — no ads, no chrome. It becomes a normal Chervil page, so **Back**
  returns to the site and you can listen to it, export it, or bookmark it. Runs
  entirely on-device (no model cost).
- **Favicons.** Real site icons now show on live-site tabs and in your Library
  (Sites and bookmarked sites).
- **Bookmark folders + a bookmarks bar.** Organize bookmarks into folders (group
  headers + a per-bookmark folder picker in the Library), and turn on a
  **bookmarks bar** under the address bar — folders become dropdowns, loose
  bookmarks become one-click buttons. Toggle it in **Settings → General**, the
  toolbar right-click menu, or **Ctrl+Shift+B**.
- **Private tabs.** **Ctrl+Shift+N** (or the tab right-click menu) opens a private
  tab: nothing in it is saved to your history, Library, or living pages, and it
  isn't reopened after a restart.
- **Multiple windows.** **Ctrl+N**, **File → New Window**, or the tab right-click
  menu opens another window — handy on multiple monitors.
- **Default browser.** **Settings → General → Browsing & privacy → "Make default…"**
  registers Chervil as an http/https handler and opens the OS picker; links opened
  from other apps then open in a Chervil tab. (Windows/macOS still ask you to
  confirm the choice.)
- **Ad & tracker blocking.** An opt-in toggle blocks common ad/tracker hosts on
  embedded sites, with a running "blocked this session" count. Off by default.
- **Clear browsing data.** One button clears cookies, cache, and site data for
  embedded sites — plus your Sites history and Downloads list. Bookmarks and saved
  logins are kept.
- **Search from the address bar.** Chervil still answers with Sprig by default, but
  a **bang** does a plain web search: `g!` Google, `ddg!` DuckDuckGo, `b!` Bing, or
  `s!` for your default (set in **Settings → General → Search**).
- **Address-bar suggestions.** As you type, a dropdown suggests matching sites from
  your history and bookmarks (with favicons), plus **Search the web** and **Ask
  Sprig** — arrow keys + Enter to pick.
- **Library search.** A search box in the Library filters the current list
  (History, Bookmarks, Sites, Downloads, Trash) as you type.
- **Picture-in-picture.** Pop a video out of an embedded site into a floating,
  always-on-top window.
- **Mute a noisy tab.** When a site is making sound, a speaker badge appears on its
  tab — click to mute/unmute.
- **Show the menu bar.** **Settings → Appearance** can keep the native File/Edit/View
  menu bar visible instead of hiding it until you press Alt.
- **Optional Ollama token.** The Ollama provider now accepts an optional API key,
  sent as an `Authorization: Bearer` header — for remote or password-protected
  Ollama servers. Local Ollama still needs none.

### Changed
- The toolbar **History** button is now **Library** — it opens History, Bookmarks,
  Sites, Downloads, and Trash.
- Page zoom, print, and reader view are all toggleable toolbar buttons (Settings or
  the toolbar right-click menu), which now also toggles the bookmarks bar.

### Fixed
- The toolbar right-click ("Show on toolbar") menu no longer stacks up duplicate
  copies or refuses to close — it now dismisses on outside-click, Esc, or clicking
  the page.
- Saving an Ollama setting now shows a clear confirmation like the other providers.

## [0.10.0] — 2026-07-01

Chat gets smart, and Chervil gets docs. Chat mode used to be a knowledgeable but
offline chatbot — now it searches the live web on its own when a question needs
current answers, and shows its sources right under the reply. And there's finally a
proper home for how-to: a full documentation site at
[getchervil.com/docs](https://getchervil.com/docs), linked from inside the app.

### Added
- **Chat mode can search the web.** Flip on chat mode (💬) and Sprig now reaches the
  live web on its own whenever a question needs current information — news, prices,
  scores, weather, "who currently holds…". The sources it used are listed right under
  the answer, and it still answers evergreen questions directly (and instantly) without
  searching. Works on Claude, Grok, Gemini, and OpenAI; on providers without web search
  (Azure, Ollama) chat stays knowledge-only and says so.
- **Documentation.** A full docs site is live at **getchervil.com/docs** — install,
  providers & keys, compose vs. chat, Deep Dive & Verify, real-world actions, Spaces,
  agents, Hey Sprig, and publishing. Reach it from the **welcome screen** ("Read the
  docs →") or **Settings → You → Documentation**.

## [0.9.0] — 2026-06-30

Sharing season. This release is about getting what you make in front of people — and
fixing a couple of things that should have just worked. Chat can now talk about the
page you're looking at, and an in-app update check tells you when there's a newer
Chervil to grab. Two fixes land too: closing a tab finally stops its audio, and the
“Listen / pronounce” buttons on composed pages actually make sound. (On the web side,
getchervil.com gains community ratings, hero images in link previews, and share
buttons — more in the blog.)

### Added
- **Check for updates.** In **Settings → You**, next to the version, a “Check for
  updates” link tells you whether a newer Chervil has been released and links
  straight to the download.
- **Chat about the page you composed.** Switch a tab with a composed page into chat
  mode (💬) and Sprig can now answer questions about that page — summarize it, explain
  a section, quiz you on it — using the page's own content. Toggle 💬 off to go back to
  composing; the page stays in view the whole time.

### Fixed
- **Closing a tab now stops its audio.** Playing a video (e.g. on YouTube) and then
  closing the tab no longer left the sound playing in the background until you quit
  Chervil — the page is now fully unloaded when you navigate away from it.
- **"Listen / pronounce" buttons on composed pages now make sound.** Pages built by
  Chervil (like language lessons) run in a sandbox where the browser's speech engine
  was silent; their pronunciation buttons now play through Chervil's voice, picking a
  matching voice for the language (Chinese, Japanese, Korean, and more).

## [0.8.0] — 2026-06-29

You're at the controls. This release is about making Chervil a more capable everyday
browser and putting power features in your hands: a toolbar you arrange yourself,
embedded-site logins that finally work, agent teams that adapt, Spaces that hold your
files, and a way to dial in how pages look — plus the Agent store, now inside the app.

### Added
- **Customize the top-bar buttons.** Choose which buttons show on the toolbar (Map,
  History, Schedules, Agents, Bookmark, Save) — in **Settings → General → Toolbar
  buttons**, or just **right-click the top bar** for a quick show/hide menu. (The
  ⚙ Settings button and core navigation always stay.)
- **Pin files to a Space (permanent sources).** In the 📁 Folders panel, **📌 Pin to
  Space** keeps files as permanent context for the active Space. By default they feed
  the Space's **Synthesize**; a new **Settings → Composed pages → Pinned Space files**
  option lets you use them in *every* page you compose in that Space, or turn them off.
- **Page style.** **Settings → Composed pages → Page style** picks **Balanced**
  (default), **Rich** (visual, dense, charts/diagrams), or **Minimal** (lean and fast)
  for the pages Sprig composes.
- **Orchestrated agent pipelines.** A pipeline can now be **🧠 Orchestrated** — instead
  of running its agents in a fixed order, a coordinator looks at the work so far and
  decides who should act next (and when the team is done), so the team adapts to results
  instead of marching in a line. Bounded by a step cap so it always finishes. Toggle it
  when you save a pipeline in **👤 Agents → 🧩 Agent pipelines**.
- **Browse the Agent store inside the app.** The **👤 Agents** panel now has an
  **🏪 Agent store** section — filter by category, hit **Browse store**, and **Add**
  any community agent straight into your Agents without leaving Chervil. (Previously
  you could only browse the store on getchervil.com.)

### Fixed
- **Logins that use a popup now work in embedded sites (RFC 0011).** Real sites
  opened in Chervil couldn't open popups or `target="_blank"` links — so
  Google/Microsoft "Sign in" buttons (which open an OAuth popup) silently did
  nothing. Chervil now handles them: "open in new tab" links open a new Chervil
  tab, and `window.open` popups (OAuth/login) open a real child window that shares
  your session, so the sign-in flow completes and closes itself.

## [0.7.0] — 2026-06-28

Share what you build with everyone: publish your agents, and submit your best
agents and pages to a community Agent store and Share gallery.

### Added
- **Publish agents — and a community Agent store.** Agents are now a publishable
  type, like pages and lessons. From **👤 Agents → Publish**, share an agent to your
  getchervil.com profile (public or unlisted); other Chervil users open it on the web
  and **import it in one click** ("Open in Chervil", with a get-the-app fallback).
  Beyond your profile, you can **submit** your best agents and pages to the community
  **Agent store** and **Share gallery** (getchervil.com/store and /share) — browsable
  by category. Submissions are LLM pre-vetted and human-approved before they appear.
  (Design: RFC 0012.)

## [0.6.0] — 2026-06-27

Agents that work as a team, pages you can hand off and remix, and a couple of
quietly important fixes — your bookmarks now really sync, and interactive pages
remember what you did on them.

### Added
- **Multi-stage agents (agent pipelines).** Chain two or more agents into a team that
  hands off to each other: each runs in order and builds on the previous one's output,
  and the last agent composes the final page. Build one in **Agents → 🧩 Agent
  pipelines** (name it, add agents as ordered stages), then give it a task and **Run** —
  each stage's work shows in the chat as it goes, before the page is composed. Ideal for
  research → draft → critique flows. (Reasoning stages need a provider with text
  completion, e.g. Claude.)
- **Shareable pages — export and import a composed page.** Any composed page now has
  a **🔗 Shareable page (.chervil)** option in the Export dropdown that writes a small,
  self-contained file (the page's HTML, its originating query, and sources — not your
  chat transcript). Send it to anyone; they open **History → ⤒ Import page** to drop it
  into their own Chervil as a fresh tab they can view and remix with Sprig. (E.g. share
  a calculator you built so a colleague can add a component themselves.) **Pages you
  publish to the web** also carry an unobtrusive **✦ Open in Chervil** button — any
  Chervil user viewing the published page can click it to pull the page into their own
  instance and remix it (via a `chervil://import` deep link that reads the page's
  embedded source). Visitors who don't have Chervil get a graceful **"Not using
  Chervil? Get it to import this page →"** prompt (shown only when the deep link
  doesn't launch the app).
- Design doc: **RFC 0011** (standalone browsing — a prioritized, code-grounded plan to
  make embedded real sites behave like they do in Chrome/Edge, without competing with
  browsers).

### Changed
- **Fluent UI pass — History panel.** The History/Library panel now opens as a
  **centered card over a blurred scrim**, consistent with the Agents, Schedules, and
  Settings panels (it was previously the lone right-anchored drawer). Its entries are
  now proper Fluent cards: resting depth, a reveal accent bar on the leading edge, a
  lift on hover, and press feedback, with a subtle entrance fade and unified radius
  tokens. The tabs get smooth state transitions and an active glow. (Honors
  `prefers-reduced-motion`.)

### Fixed
- **Interactive pages now remember their state (checkboxes, toggles).** Composed
  pages render in a security sandbox with no same-origin access, so a page's own
  `localStorage` silently failed — a checklist would forget every check on reopen,
  despite saying "saved in browser." Chervil now shims `localStorage`/`sessionStorage`
  inside composed pages, persisting their data in the app (keyed by a stable per-page
  id that travels with bookmark and history snapshots). Check a box, close the page,
  reopen it from a bookmark — your checks are still there. (Also rides folder-sync, so
  state follows you between computers.)
- **Bookmarks (and other data) now actually sync between computers.** Chervil's
  folder-sync rides a single `chervil-state.json` through OneDrive/Drive/Dropbox, and
  those services can't merge JSON — when two machines wrote it, the loser was forked
  into a `chervil-state-<MACHINE>.json` conflict copy the app never read, stranding
  whatever was saved there. Chervil now **reconciles conflict copies** on launch and
  on window focus (union of bookmarks, history, spaces, agents, schedules), unions the
  on-disk state into each save, writes atomically, and carries **deletion tombstones**
  so a removed bookmark stays removed across machines instead of being resurrected.

## [0.5.3] — 2026-06-26

### Fixed
- **Settings showed "Chervil v—" instead of the version number.** The sandboxed
  preload couldn't read `package.json`, so the version came back blank. It now comes
  from the main process (`app.getVersion()`) over a small sync IPC — Settings → You
  shows the real version again.

## [0.5.2] — 2026-06-26

A small quality release — make "Hey Sprig" behave in a noisy room.

### Added
- **Wake-word sensitivity control.** Settings → Voice now has a **threshold slider** for
  "Hey Sprig" — raise it so background noise or a TV in the room stops triggering Chervil
  on its own. (The cutoff existed internally but wasn't adjustable.) Changes apply live
  while listening, and the default is a touch stricter (0.6). More noisy-environment
  hardening — a confirmation gate before acting on a wake, and better voice-activity
  detection — is still on the list.

## [0.5.1] — 2026-06-26

A security patch.

### Fixed
- **Bumped the transitive `uuid` dependency to 11.1.1** (GHSA-w5hq-g745-h8pq /
  CVE-2026-41907 — a missing buffer bounds check in uuid v3/v5/v6 when a `buf`
  is provided). `uuid` reaches Chervil only through `exceljs` (Excel export),
  which calls `v4()` with no `buf`, so the vulnerable path was never reachable —
  this clears the alert. Verified Excel export still works.

## [0.5.0] — 2026-06-26

Interactive lessons that actually *do* things — everywhere. Applet cards now compose
real, interactive widgets in the app, in your saved lessons, **and** in lessons you
publish to the web — plus a fluent polish pass across the whole UI.

### Added
- **Interactive applet widgets** — a lesson's "Try it" card now composes a real,
  self-contained interactive widget (dropdowns, inputs, live-computed output, a
  step-by-step simulator) instead of a block of text. In the app it builds on click
  and is cached, so re-opening a lesson is instant; a **↻ Regenerate** button rebuilds
  it, and a failed build offers a Retry.
- **Widgets work on the published web page too** — published and exported lessons bake
  each widget into a sandboxed `data:` iframe under a hardened, hash-allowlisted CSP, so
  they stay interactive on getchervil.com — not just in the desktop app.
- **Lessons auto-upgrade on open** — older lessons re-render with the current renderer
  when opened, so they pick up new capabilities without being rebuilt.
- **Smart attachments for large files** — when an attached file is bigger than fits in
  one request, Chervil selects the **rows relevant to your question** instead of just
  sending the first chunk (local, on-device row matching — no server). The first step
  toward full indexed retrieval (RFC 0004).
- Design docs: **RFC 0009** (published-page metrics) and **RFC 0010** (Chervil on the web).

### Changed
- **Fluent UI pass.** The Settings panel highlights the selected option as a card (not
  just a radio dot) over a blurred backdrop; the **address bar stays usable on small
  windows** — the toolbar collapses to icons via a container query instead of running
  off-screen; the sidebar toggle is now a **directional chevron** that flips between
  hide (‹) and show (›). Plus thin themed scrollbars, consistent overlay blur, keyboard
  focus rings, a smooth sidebar slide, and unified radius tokens.
- **Re-publishing a lesson updates it in place** — same URL — instead of minting a new
  link each time (stable source id, matching the page-publish path).

### Fixed
- **Friendlier error messages** — transcription, wake-word, autofill, and login-fill
  failures now read as plain language instead of raw exceptions or `[object Object]`.

## [0.3.1] — 2026-06-24

Agentic actions land — Sprig can now *do* things on a live site under a
deterministic control layer (plan → allow/confirm/deny → audit) — plus everyday
extras (find in page, reopen closed tab, form autofill) and a fix so large
attached files are actually read.

### Fixed
- **Attached files were silently cut to 30,000 characters** — so a large file
  (e.g. a big CSV) reached the model as only its first few percent, and Sprig drew
  confident conclusions from the sliver it saw. The cap is now ~500,000 chars
  (≈125k tokens), and when a file is still larger the model is told it's truncated
  (and to say so) instead of treating the visible part as complete. All providers.

### Added
- **Form autofill** — save your details (name, email, phone, address…) in Settings
  → You, then on any real site say "fill the form" and Chervil fills the matching
  fields. Passwords and card details are never stored or auto-filled.
- **The web agent plans first** — before acting on a live site, Sprig drafts a
  short numbered plan, shows it to you, and keeps each step grounded in it (it
  still adapts as the page reveals reality). More reliable multi-step task
  completion and clearer intent (RFC 0006 6.2).
- **Find in page (Ctrl+F)** — a find bar that searches the current page: real
  sites use native find with a match count + next/prev; composed pages search via
  the in-page runtime. Enter / Shift+Enter cycle matches, Esc closes.
- **Reopen closed tab (Ctrl+Shift+T)** — restores recently-closed tabs with their
  full conversation and pages intact (keeps the last 12; pinned tabs return to the
  pinned group).
- **Per-task action approvals** — when the web agent asks to confirm a
  state-changing step, you can now **Approve once** or **Allow "&lt;action&gt;" for
  this task** (so Sprig stops re-asking for that action type mid-task). Scoped to
  the run, recorded in the audit trail. Reduces approval fatigue without weakening
  the gate.
- **Guarded OS actions (first ones)** — composed pages can call
  `window.chervil.os('open_url', {url})` or `os('open_downloads')`; each runs only
  after you confirm, is allowlisted in the main process (no arbitrary commands),
  and is recorded to the agent audit trail. The first of RFC 0006's Track B.
- **Agent activity log** — the Agents view now shows a 🛡 activity trail of every
  action Sprig took on a live site and what the control layer allowed, confirmed,
  or denied (with a Clear button). Surfaces the RFC 0006 audit trail.
- **Agentic control layer (foundation)** — the web-agent's actions now pass through
  a deterministic policy: a fixed registry of allowed action types (unknown types
  are refused), with allow / confirm / deny decisions, and an audit trail of every
  action (recorded + persisted). Re-expresses the existing payment refusal and
  approve-before-risky gates as policy. First step of [RFC 0006](docs/rfcs/0006-agentic-actions.md).

## [0.3.0] — 2026-06-24

The everyday-browser release. Chervil gains a **universal omnibox**, real browser
table stakes (**bookmarks**, **browsing history**, **downloads**, in-site
back/forward), a **Stop** button for composing, a tabbed **Settings**, and an
account panel — while the creator platform grows **blogs** as a publishable type
with type-grouped profiles and avatars.

### Added
- **Downloads** — files downloaded from embedded real sites now save straight to
  your Downloads folder (no save dialog, with name de-duplication), a toast
  confirms, and a "Download complete" notification opens the folder on click.
- **Publish as a Page or a Blog post** — publishing a composed page now asks where
  it should go. Blog posts are a distinct content type; your public profile groups
  everything by type (Lessons · Quizzes · Blog · Pages).
- **Browsing history** — a **Sites** tab in the History drawer logs the real
  websites you visit (newest-first, deduped). Click to reopen, Remove one, or
  Clear history. Separate from composed-page History.
- **Bookmarks** — a ☆ in the toolbar saves the current page or site (★ when saved);
  a new **Bookmarks** tab in the History drawer lists them. Click to reopen (sites
  navigate, composed-page bookmarks recompose); Remove to delete. Persists locally.
- **Live omnibox + back/forward inside real sites** — when you browse a real
  website embedded in Chervil, the omnibox now tracks the current URL, the tab
  title follows the site, and Back/Forward step through that site's own history
  before falling back to Chervil's page tree. Embedded browsing now feels like a
  real browser.
- **Account section in Settings → You** — shows whether you're on Chervil **Pro**
  or **Free**, with links to your getchervil.com account and your public profile
  (if you've claimed a handle). Free users get a short Pro pitch + sign-up link.
  Backed by a new `GET /api/account` (publish-token auth).
- **Universal omnibox** — the bar at the top of every page is now editable and
  smart: type a **URL** to open the real site, a **question** to have Sprig compose
  a page, or a **command** (`/learn`, `/quiz`) — one bar routes them all. `Ctrl+L`
  focuses it; Enter goes, Esc restores. Reuses the existing routing brain (slash
  commands, skill modes, Deep Dive, the web agent, and composing).
- **Stop a composing page** — the send button turns into a Stop button while Sprig
  is composing (or press Esc). It aborts the in-flight request, ignores its result,
  and hands the tab straight back to you. Per-tab, so other tabs keep composing.
- **App version in Settings** — Settings now shows the running version (e.g.
  "🌿 Chervil v0.2.0"), and **Help → About Chervil** shows it in a dialog.

### Changed
- **Settings organized into tabs** — the long Settings scroll is now grouped into
  **General · AI · Voice · Publishing & Sync · You** tabs, so each topic is a short,
  focused panel instead of one endless page.
- **Cleaner window chrome** — the native File/Edit/View/Window/Help menu bar is
  replaced by a minimal menu (Edit/View/Help + About) and hidden by default
  (Alt reveals it). Standard accelerators (copy/paste, reload, zoom) still work.

## [0.2.0] — 2026-06-23

A platform release. Chervil grows past "build interactive pages" into a tool that
**publishes anything** you make, **syncs across your computers**, pulls in your
own **files and folders**, **knows your machine**, and tames heavy sessions with
real tab management — plus a richer browser extension.

### Added
- **Sync between computers (free folder-sync)** — point Chervil's data (tabs,
  history, Spaces, agents) at a folder your cloud client already syncs
  (OneDrive / Google Drive / Dropbox) via Settings → "Sync between computers".
  Set the same folder on each machine and your sessions follow you. Safe by
  design: local fallback if the folder is offline, seed-or-adopt on setup, and a
  copy-back-to-local on unlink. Keys stay machine-local (not synced). Pro
  account-sync is the phase-2 path ([RFC 0005](docs/rfcs/0005-sync-between-computers.md)).
- **Computer info (read-only OS introspection)** — ask Sprig "check my computer",
  "how much RAM/disk", "what Windows version am I on", or "when did Windows Update
  last run" and it composes a real dashboard from live machine facts. Exposed to
  composed pages via the applet bridge: `window.chervil.info()` (CPU, RAM, disk,
  uptime, network, versions) and `window.chervil.details()` (Windows
  edition/build, install date, last boot, Windows Update history, GPU, battery,
  manufacturer/model, BIOS). Strictly read-only — fixed `Get-*`/registry queries;
  no settings changes or arbitrary commands.
- **Browser extension v0.2** — a grouped **Ask Sprig** right-click submenu for
  pages, selections, and links, with **Summarize**, **Key points**, and **Explain
  simply** actions; one-tap **Summarize**/**Key points** in the popup; and an
  `Alt+Shift+S` shortcut to summarize the current page. Actions ride a new
  `action=` deep-link param that shapes the prompt the app composes.
- **Tab switcher (Ctrl+K)** — a command palette to jump to any tab by title;
  type to filter, ↑/↓ to move, Enter to open. Tames large tab counts.
- **Pinned tabs** — right-click → Pin. Pinned tabs sort to the front, show 📌,
  are compact, and are protected from "close others / to the right / all". Pins
  persist across restarts.
- **Publish any page to the web** — **🌐 Publish to web** now works for *any*
  composed interactive page (clock, calculator, converter…), not just lessons and
  quizzes. Self-contained pages publish their HTML directly; pages that call Sprig
  at runtime degrade gracefully when hosted. New `chervil:publish-page` endpoint.
- **Publish a whole Space** — a **🌐 Publish** button in the History drawer's
  Space bar publishes every page in the active Space, then a styled index page
  linking them all, and copies the shareable index URL.
- **Minimal publish service** (`server/`) — a zero-dependency Node service that
  stores and serves published page HTML, so *Publish to web* works without the
  full hosted tier. Run `node server/server.js`, point Settings → Publishing at it.
- **Data folders** — designate local folders (or desktop-synced **OneDrive** /
  **Google Drive** folders) as data sources and pull their files into a query's
  attachments (📁 beside the attach button). A free, local on-ramp toward
  cloud-synced, indexed sources — designed in
  [RFC 0004](docs/rfcs/0004-cloud-data-sources.md).
- **History multi-select** — bulk-select and delete pages in the History drawer
  (**Select** → check rows → **Delete selected**), so long histories stay manageable.

### Fixed
- **Bulk tab close** now activates the closest *surviving* tab (first to the
  right, then left), computed before removal — instead of an index that shifts as
  tabs splice out.
- Publishing to an unavailable hosted endpoint now shows a clear "service still in
  development" message instead of a bare `404`.

## [0.1.5] — 2026-06-22

A big feature release: Chervil learns to **teach**. The flagship learning
vertical lands — interactive lessons and graded quizzes you can build, publish,
and share — alongside a browser extension and real-world map/phone actions.

### Added
- **Interactive Lessons** — ask Sprig to teach you a topic (🎓 **Learn**, or
  `/learn <topic>`) and it builds a swipeable deck of cards with hands-on,
  generative applets and oEmbed-verified videos.
- **Quizzes** — build a graded multiple-choice quiz (❓ **Quiz**, or
  `/quiz <topic>`) that scores answers and explains each one. A composer **skill
  picker** sits next to Deep Dive so you choose what Sprig should *make*.
- **Publish to the web (Chervil Pro)** — send any lesson or quiz to a shareable
  `getchervil.com/learn/…` link from the app (Settings → publish token).
  Re-publishing updates the same URL in place, and applets are snapshotted at
  publish so they keep working for viewers. Hosted extras: a **public profile**
  (`/profile/you`) that collects everything you've published, and **per-card
  analytics** showing where learners drop off.
- **Standalone mobile export** — save a lesson or quiz as a self-contained,
  swipeable `.html` you can open on any phone.
- **Browser extension (Chrome/Edge)** — "Ask Sprig about this page" or summarize
  it, sending the page or your selection to Chervil via a `chervil://` deep link.
- **Real-world agentic actions** — composed pages now open **real Google Maps**
  in-app (and send the pin to your phone via QR) instead of faking a map, and
  turn **phone numbers** into one-tap call-from-PC or send-to-phone.

### Changed
- The learning vertical is built on a reusable **skill framework**, so new
  builders (Lesson, Quiz, …) plug into one build → render → publish pipeline.

### Fixed
- Grok / OpenAI now surface the real streaming error instead of a generic
  "stream error".
- Browser deep links no longer get lost on a cold start — the prompt is delivered
  once the window's renderer is ready.

## [0.1.4] — 2026-06-22

### Changed
- **"Hey Sprig" is now a bundled, built-in wake word — and the default.** The
  self-trained openWakeWord model ships with the app, so hands-free "Hey Sprig"
  works out of the box; no more loading a custom `.onnx` or falling back to
  Hey Jarvis. (Hey Jarvis / Alexa / Hey Mycroft remain selectable.)

## [0.1.3] — 2026-06-21

### Changed
- **"Hey Sprig" wake word** now runs on **openWakeWord** (onnxruntime-web) instead
  of Picovoice Porcupine — free, open-source, on-device, and **no API key**
  (Picovoice is retiring its free tier on June 30, 2026). Built-in words
  (Hey Jarvis / Alexa / Hey Mycroft) work out of the box; the literal "Hey Sprig"
  uses a free, self-trained openWakeWord `.onnx` loaded as a custom model.

## [0.1.2] — 2026-06-20

### Fixed
- Installer build: prune the dev-only Picovoice packages from the app bundle
  (runtime uses the vendored copies in `src/vendor`), and stamp the Windows
  `Chervil.exe` file/product version + metadata (was blank). Packaging moved to
  a small cross-platform `scripts/package.mjs`.

## [0.1.1] — 2026-06-20

First packaged **Windows installer** (Inno Setup), plus new providers and a
hands-free listening mode.

### Added
- **Windows installer** — a setup wizard that can set your API keys, a default
  provider, an "About you" profile, and run-at-startup on first launch. Built and
  published by CI on a version tag. Run-from-source still works.
- **OpenAI provider** — alongside Claude/Grok/Gemini/Azure/Ollama, with live web
  grounding (Responses API web search) and citations.
- **"Hey Sprig" listening mode** (opt-in) — on-device wake-word detection
  (Picovoice Porcupine) pops the quick-ask bar and captures a spoken request.
- **Build an agent from a session**, and **export agents** to share.

### Changed
- **Grok** moved to xAI's Agent Tools API on `/v1/responses` (Live Search was
  deprecated) and refreshed to current `grok-4.x` models.

### Fixed
- Local-time clocks/pages (was UTC); notification on compose-finish while
  minimized; notification source name ("Chervil", not `com.chervil.app`).

## [0.1.0] — 2026-06-19

First public, build-in-public alpha. Run from source; no packaged installer yet.

### Added
- **Composed pages** — ask Sprig a question and get a single, image-rich,
  sandboxed page grounded in live web search, with its sources shown.
- **Living, interactive pages** — composed pages can call back to Sprig at
  runtime to fetch fresh data (mini-apps, not printouts).
- **Deep Dive** — a two-phase research pipeline producing long, cited reports
  with disinformation vetting.
- **Trust layer** — one-click **Verify** a page's claims against reputable live
  sources, plus a sources / "show your work" panel.
- **Living pages** — schedule a page to re-ground itself and notify you on change.
- **Spaces** — persistent topic workspaces that synthesize across what you've
  gathered.
- **Agentic web actions** — Sprig can operate real sites for you, with hard
  safety gates (see [SECURITY.md](SECURITY.md)).
- **Quick-ask** — a global hotkey opens a floating ask bar; Chervil lives in the
  tray and can close-to-tray.
- **Scheduled agents** — run prompts on a daily / weekly / interval schedule in
  the background; a schedule can run "as" a chosen agent.
- **Agent files** — import a persona (instructions, model, allowed MCP tools,
  starter prompts); the active agent shows as a chip by the composer. Ships with
  starter agents in [`/agents`](agents).
- **Video summaries** — summarize YouTube videos from captions, or watched
  natively when on Gemini.
- **Export anywhere** — PDF, PowerPoint (.pptx), Word (.docx), Excel (.xlsx),
  image (PNG / JPG), and animated GIF.
- **Bring your own AI** — pluggable providers: Claude, Grok, Gemini, OpenAI, Azure
  AI Foundry, and local Ollama; native grounding for Claude / Grok / Gemini / OpenAI.
- **Voice input** — dictate prompts via a Whisper-compatible endpoint.
- API keys encrypted at rest via OS-native storage; never round-tripped through
  the UI.

[Unreleased]: https://github.com/chervil-ai/chervil/compare/v0.19.0...HEAD
[0.19.0]: https://github.com/chervil-ai/chervil/compare/v0.18.0...v0.19.0
[0.18.0]: https://github.com/chervil-ai/chervil/compare/v0.17.0...v0.18.0
[0.13.0]: https://github.com/chervil-ai/chervil/compare/v0.12.0...v0.13.0
[0.1.5]: https://github.com/chervil-ai/chervil/compare/v0.1.4...v0.1.5
[0.1.0]: https://github.com/chervil-ai/chervil/releases/tag/v0.1.0
