# Building the Windows installer

Chervil ships a Windows installer built with [Inno Setup](https://jrsoftware.org/isinfo.php).
The setup wizard can, on first launch, configure the app for the user — so building
the installer is a two-step pack-then-compile, plus a first-run handshake inside the app.

## What the wizard does

The installer adds custom wizard pages (see [`installer/chervil.iss`](../installer/chervil.iss)):

1. **AI provider keys** — paste Anthropic/OpenAI/xAI/Google keys, or leave blank to skip
   and add them later in **Settings → Provider**.
2. **Default provider** — shown only if a key was entered; pick which provider Chervil uses by default.
3. **About you** — an optional personal-memory profile that tailors composed pages (skippable).
4. **Run at startup** — a checkbox on the “Select Additional Tasks” page (per-user `Run` registry entry).

The wizard can't encrypt keys itself (Electron's `safeStorage` is OS/Electron-specific),
so it writes the choices to `%APPDATA%\Chervil\firstrun.json`. On first launch Chervil's
main process (`applyFirstRunProvisioning` in [`electron/main.js`](../electron/main.js))
imports them — encrypting keys, seeding the default provider + profile — then deletes the file.

## Build locally

Prerequisites: Node 20+, and [Inno Setup 6](https://jrsoftware.org/isdl.php) (`ISCC.exe`).

```bash
npm ci
npm run package        # -> dist\Chervil-win32-x64\Chervil.exe  (via @electron/packager)
ISCC /DMyAppVersion=0.1.0 installer\chervil.iss
# -> dist\installer\Chervil-Setup-0.1.0.exe
```

`npm run package` prunes devDependencies (Electron itself, the Picovoice wake-word
packages) from the bundle; the runtime-vendored copies in `src/vendor/` are kept.

## Release (CI)

Pushing a tag builds and publishes automatically — see
[`.github/workflows/release.yml`](../.github/workflows/release.yml). It runs on a
Windows runner, packages the app, installs Inno Setup via Chocolatey, compiles the
installer, and attaches `Chervil-Setup-<version>.exe` to a GitHub Release.

```bash
git tag v0.1.0
git push origin v0.1.0
# or trigger manually: Actions -> Release -> Run workflow (enter the version)
```
