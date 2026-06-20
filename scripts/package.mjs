#!/usr/bin/env node
// Cross-platform packaging wrapper for the Windows build.
//
// Drives @electron/packager (via npx, so it never lands in the bundled
// node_modules) with a single source of truth for the version (package.json)
// and consistent Win32 file metadata. Spawned with an args array (no shell),
// so values with spaces/punctuation don't need quoting.
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const v = pkg.version;

const args = [
  '--yes', '@electron/packager', '.', 'Chervil',
  '--platform=win32', '--arch=x64',
  '--icon=build/icon.ico', '--out=dist', '--overwrite',
  // Stamp the Windows file/product version + metadata (was blank before).
  `--app-version=${v}`, `--build-version=${v}`,
  '--app-copyright=(c) 2026 Rod Trent',
  '--win32metadata.CompanyName=Rod Trent',
  '--win32metadata.ProductName=Chervil',
  '--win32metadata.FileDescription=Chervil - the agentic, conversational web browser',
  '--win32metadata.OriginalFilename=Chervil.exe',
  // Exclude repo/dev cruft. @picovoice is a dev-only dependency — the runtime
  // uses the vendored bundles in src/vendor — and prune isn't reliably dropping
  // it, so ignore it explicitly to keep the bundle lean.
  '--ignore=^/dist', '--ignore=^/installer', '--ignore=^/\\.github',
  '--ignore=^/\\.git$', '--ignore=^/\\.env$', '--ignore=^/memory$', '--ignore=^/scripts$',
  '--ignore=/node_modules/@picovoice',
  '--prune=true',
];

// Node 24 refuses to spawn npx.cmd without a shell, but a shell won't auto-quote
// our spaced metadata values — so build a double-quoted command line and run it
// through the shell (cmd on Windows, sh elsewhere). Double quotes neutralize the
// spaces, commas, parens, and regex chars in both shells.
const cmd = 'npx ' + args.map((a) => `"${a.replace(/"/g, '\\"')}"`).join(' ');
const r = spawnSync(cmd, { cwd: root, stdio: 'inherit', shell: true });
if (r.error) { console.error(r.error); process.exit(1); }
process.exit(r.status ?? 1);
