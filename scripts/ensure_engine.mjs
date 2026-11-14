#!/usr/bin/env node
/**
 * ensure_engine.mjs — 100% Standalone Zero-Dependency Engine Scaffolder & Syncer.
 *
 * Runs on Antigravity's built-in `agy-node` (or standard `node`) with ZERO
 * external dependencies (no `pnpm`, `npm`, `python`, or `git` required).
 *
 * Resolution Order:
 * 1. If the current working directory (or `--workspace`) already contains
 *    `src/engine/schema.ts`, sync any missing files (including `vendor/`,
 *    `scripts/studio-cli.mjs`, `scripts/vcs.mjs`, and modular `src/assets/`)
 *    from `<plugin-root>/engine/` without overwriting existing user scenes/exports.
 * 2. Otherwise (or when `--scaffold` is passed), copy `<plugin-root>/engine/`
 *    into the target workspace directory.
 *
 * Because `<plugin-root>/engine/vendor/` pre-bundles pure-JS `typescript`,
 * `mp4-muxer`, `vitest-shim`, and `isomorphic-git`, NO `pnpm install` or
 * `npm install` is needed!
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PLUGIN_ROOT = path.resolve(__dirname, '..');
const BUNDLED_ENGINE_DIR = path.join(PLUGIN_ROOT, 'engine');

const SKIP_DIRS = new Set(['node_modules', 'dist', '.git', '__pycache__']);
const ALWAYS_UPDATE_FILES = new Set([
  'package.json',
  'tsconfig.json',
  'vite.config.ts',
]);

function isEngineRoot(dir) {
  return fs.existsSync(path.join(dir, 'src', 'engine', 'schema.ts'));
}

function hasModularAssets(dir) {
  return fs.existsSync(path.join(dir, 'src', 'assets', 'characters', 'cat.ts'));
}

function hasVendorBundle(dir) {
  return (
    fs.existsSync(path.join(dir, 'vendor', 'typescript', 'lib', 'typescript.js')) &&
    fs.existsSync(path.join(dir, 'vendor', 'mp4-muxer', 'mp4-muxer.mjs')) &&
    fs.existsSync(path.join(dir, 'vendor', 'isomorphic-git', 'index.mjs')) &&
    fs.existsSync(path.join(dir, 'scripts', 'studio-cli.mjs'))
  );
}

function copyTreeSync(srcDir, destDir, overwrite = true) {
  fs.mkdirSync(destDir, { recursive: true });
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);

    if (entry.isDirectory()) {
      // Always overwrite vendor/ and scripts/ so standalone toolchain stays current
      const forceDir = entry.name === 'vendor' || entry.name === 'scripts';
      copyTreeSync(srcPath, destPath, overwrite || forceDir);
    } else if (entry.isFile()) {
      if (overwrite || !fs.existsSync(destPath) || ALWAYS_UPDATE_FILES.has(entry.name)) {
        try {
          fs.copyFileSync(srcPath, destPath);
        } catch {
          // Ignore read-only file lock if identical
        }
      }
    }
  }
}

export function resolveEngine({ workspace = null, scaffold = false } = {}) {
  const cwd = path.resolve(workspace || process.cwd());

  if (!isEngineRoot(BUNDLED_ENGINE_DIR)) {
    throw new Error(`Bundled engine not found at ${BUNDLED_ENGINE_DIR}`);
  }

  let source = 'workspace';
  if (isEngineRoot(cwd) && !scaffold) {
    if (cwd !== BUNDLED_ENGINE_DIR) {
      copyTreeSync(BUNDLED_ENGINE_DIR, cwd, !hasModularAssets(cwd));
    }
  } else {
    copyTreeSync(BUNDLED_ENGINE_DIR, cwd, true);
    source = 'scaffolded_from_bundled_engine';
  }

  const exportsKeep = path.join(cwd, 'exports', '.gitkeep');
  fs.mkdirSync(path.dirname(exportsKeep), { recursive: true });
  if (!fs.existsSync(exportsKeep)) {
    fs.writeFileSync(exportsKeep, '', 'utf8');
  }

  return {
    engine_dir: cwd,
    source,
    bundled_engine_dir: BUNDLED_ENGINE_DIR,
    vendor_ready: hasVendorBundle(cwd),
  };
}

function main() {
  const args = process.argv.slice(2);
  let workspace = null;
  let scaffold = false;
  let jsonOut = false;

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--workspace' && args[i + 1]) {
      workspace = args[++i];
    } else if (a === '--scaffold') {
      scaffold = true;
    } else if (a === '--json') {
      jsonOut = true;
    }
  }

  const result = resolveEngine({ workspace, scaffold });
  if (jsonOut) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(
      `Engine ready at: ${result.engine_dir} (source: ${result.source}, vendor_ready: ${result.vendor_ready})`
    );
  }
}

main();
