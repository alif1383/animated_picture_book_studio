#!/usr/bin/env node
/**
 * ensure_engine.mjs — 100% Standalone Zero-Dependency Engine Scaffolder, Syncer & Asset Promoter (Option A).
 *
 * Runs on Antigravity's built-in `agy-node` (or standard `node`) with ZERO
 * external dependencies (no `pnpm`, `npm`, `python`, or `git` required).
 *
 * Resolution Order (Option A — Isolated Per-Conversation Scratch Default):
 * 1. Existing Picture-Book Workspace:
 *    If `--workspace <dir>` (or `process.cwd()`) already contains
 *    `src/engine/schema.ts` (and is not `<plugin-root>/engine`), sync any
 *    missing `vendor/` or `scripts/` files from `<plugin-root>/engine/`
 *    without overwriting existing user scenes/characters/exports, and use
 *    that workspace directly (`source: 'workspace'`).
 * 2. Explicit New Project Scaffold (`--workspace <dir> --scaffold`):
 *    If `--scaffold` is explicitly passed with a target `--workspace <dir>`,
 *    copy the full `<plugin-root>/engine/` into `<dir>`
 *    (`source: 'scaffolded_from_bundled_engine'`).
 * 3. In-Place Plugin Mode (`--in-place`):
 *    If `--in-place` is explicitly passed, use `<plugin-root>/engine/` directly.
 * 4. Default — Per-Conversation Scratch Workspace (`<appDataDir>/brain/<conversation-id>/scratch/picture-book-studio`):
 *    When a conversation is started without any project/workspace open (or the
 *    open folder is not a Picture-Book project), automatically copy the full
 *    `<plugin-root>/engine/` into `<appDataDir>/brain/<conversation-id>/scratch/picture-book-studio`
 *    so each conversation has its own 100% isolated workspace without touching
 *    `<plugin-root>/engine/` or polluting the user's home/unrelated folder!
 * 5. Asset Promotion Mode (`--promote-from <workspace>`):
 *    When the user confirms they want to save newly created assets (characters,
 *    buildings, props, scenes, audio files, SFX modules, docs, tests) from the
 *    active workspace or conversation `scratch/` folder back into the main
 *    plugin folder (`<plugin-root>/engine/`) so future conversations can use
 *    them, run:
 *      `agy-node "<plugin-root>/scripts/ensure_engine.mjs" --promote-from "<workspace>"`
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PLUGIN_ROOT = path.resolve(__dirname, '..');

function isEngineRoot(dir) {
  return Boolean(dir) && fs.existsSync(path.join(dir, 'src', 'engine', 'schema.ts'));
}

const BUNDLED_ENGINE_DIR = isEngineRoot(path.join(PLUGIN_ROOT, 'engine'))
  ? path.join(PLUGIN_ROOT, 'engine')
  : PLUGIN_ROOT;

const SKIP_DIRS = new Set(['node_modules', 'dist', '.git', '__pycache__']);
const PROMOTE_SUBDIRS = [
  'src',
  'public',
  'docs',
  'tests',
  'scripts',
];
const ALWAYS_UPDATE_FILES = new Set([
  'package.json',
  'tsconfig.json',
  'vite.config.ts',
]);

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

export function getDefaultScratchEngineDir() {
  const appDataDir =
    process.env.ANTIGRAVITY_APP_DATA_DIR ||
    path.join(os.homedir(), '.gemini', 'antigravity');
  const conversationId =
    process.env.ANTIGRAVITY_CONVERSATION_ID || 'default-session';
  return path.resolve(
    appDataDir,
    'brain',
    conversationId,
    'scratch',
    'picture-book-studio'
  );
}

function copyTreeSync(srcDir, destDir, overwrite = true, copiedFiles = null) {
  fs.mkdirSync(destDir, { recursive: true });
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);

    if (entry.isDirectory()) {
      const forceDir = entry.name === 'vendor' || entry.name === 'scripts';
      copyTreeSync(srcPath, destPath, overwrite || forceDir, copiedFiles);
    } else if (entry.isFile()) {
      if (overwrite || !fs.existsSync(destPath) || ALWAYS_UPDATE_FILES.has(entry.name)) {
        try {
          fs.copyFileSync(srcPath, destPath);
          if (copiedFiles) copiedFiles.push(destPath);
        } catch {
          // Ignore read-only file lock if identical
        }
      }
    }
  }
}

function ensureExportsKeep(dir) {
  const exportsKeep = path.join(dir, 'exports', '.gitkeep');
  fs.mkdirSync(path.dirname(exportsKeep), { recursive: true });
  if (!fs.existsSync(exportsKeep)) {
    fs.writeFileSync(exportsKeep, '', 'utf8');
  }
}

/**
 * Promotes assets (characters, buildings, props, scenes, audio files in `public/`,
 * modular SFX in `src/audio/` & `scripts/sfx/`, `docs/`, and `tests/`) from a
 * workspace or conversation `scratch/` directory back into `<plugin-root>/engine/`
 * (and syncs `docs/AUDIO_CATALOG.md` to `skills/picture-book-audio/references/audio-catalog.md`).
 */
export function promoteAssetsToPlugin({
  fromWorkspace,
  targetPluginRoot = PLUGIN_ROOT,
} = {}) {
  const srcRoot = path.resolve(fromWorkspace || getDefaultScratchEngineDir());
  if (!isEngineRoot(srcRoot)) {
    throw new Error(`Source workspace is not a valid Picture-Book engine directory: ${srcRoot}`);
  }

  const destPluginRoot = path.resolve(targetPluginRoot);
  const destEngineDir = path.join(destPluginRoot, 'engine');
  fs.mkdirSync(destEngineDir, { recursive: true });

  const promotedFiles = [];
  for (const sub of PROMOTE_SUBDIRS) {
    const srcSub = path.join(srcRoot, sub);
    const destSub = path.join(destEngineDir, sub);
    if (fs.existsSync(srcSub)) {
      copyTreeSync(srcSub, destSub, true, promotedFiles);
    }
  }

  // Also sync docs/AUDIO_CATALOG.md to skills/picture-book-audio/references/audio-catalog.md if present
  const srcAudioCatalog = path.join(srcRoot, 'docs', 'AUDIO_CATALOG.md');
  const skillAudioCatalogDir = path.join(
    destPluginRoot,
    'skills',
    'picture-book-audio',
    'references'
  );
  if (fs.existsSync(srcAudioCatalog) && fs.existsSync(path.dirname(skillAudioCatalogDir))) {
    fs.mkdirSync(skillAudioCatalogDir, { recursive: true });
    const destSkillCatalog = path.join(skillAudioCatalogDir, 'audio-catalog.md');
    fs.copyFileSync(srcAudioCatalog, destSkillCatalog);
    promotedFiles.push(destSkillCatalog);
  }

  // Also sync scripts/generate_audio.mjs to skills/picture-book-audio and skills/picture-book-voiceover
  const srcGenAudio = path.join(srcRoot, 'scripts', 'generate_audio.mjs');
  if (fs.existsSync(srcGenAudio)) {
    for (const skillName of ['picture-book-audio', 'picture-book-voiceover']) {
      const skillDir = path.join(destPluginRoot, 'skills', skillName);
      if (fs.existsSync(skillDir)) {
        const destScriptDir = path.join(skillDir, 'scripts');
        fs.mkdirSync(destScriptDir, { recursive: true });
        const destScript = path.join(destScriptDir, 'generate_audio.mjs');
        fs.copyFileSync(srcGenAudio, destScript);
        promotedFiles.push(destScript);
      }
    }
  }

  return {
    promoted_from: srcRoot,
    promoted_to_engine: destEngineDir,
    files_synced_count: promotedFiles.length,
  };
}

export function resolveEngine({
  workspace = null,
  scaffold = false,
  inPlace = false,
  scratchDir = null,
} = {}) {
  if (!isEngineRoot(BUNDLED_ENGINE_DIR)) {
    throw new Error(`Bundled engine not found at ${BUNDLED_ENGINE_DIR}`);
  }

  // 1. Explicit in-place mode (`--in-place`)
  if (inPlace) {
    ensureExportsKeep(BUNDLED_ENGINE_DIR);
    return {
      engine_dir: BUNDLED_ENGINE_DIR,
      source: 'bundled_engine_in_place',
      bundled_engine_dir: BUNDLED_ENGINE_DIR,
      vendor_ready: hasVendorBundle(BUNDLED_ENGINE_DIR),
    };
  }

  const candidateWorkspace = workspace ? path.resolve(workspace) : path.resolve(process.cwd());
  const isCandidateBundled =
    candidateWorkspace.toLowerCase() === BUNDLED_ENGINE_DIR.toLowerCase() ||
    candidateWorkspace.toLowerCase() === PLUGIN_ROOT.toLowerCase();

  // 2. Active workspace already has a Picture-Book Studio project (`src/engine/schema.ts`)
  if (!isCandidateBundled && isEngineRoot(candidateWorkspace) && !scaffold) {
    copyTreeSync(BUNDLED_ENGINE_DIR, candidateWorkspace, !hasModularAssets(candidateWorkspace));
    ensureExportsKeep(candidateWorkspace);
    return {
      engine_dir: candidateWorkspace,
      source: 'workspace',
      bundled_engine_dir: BUNDLED_ENGINE_DIR,
      vendor_ready: hasVendorBundle(candidateWorkspace),
    };
  }

  // 3. Explicit `--scaffold` into a specified target directory
  if (scaffold && workspace && !isCandidateBundled) {
    copyTreeSync(BUNDLED_ENGINE_DIR, candidateWorkspace, true);
    ensureExportsKeep(candidateWorkspace);
    return {
      engine_dir: candidateWorkspace,
      source: 'scaffolded_from_bundled_engine',
      bundled_engine_dir: BUNDLED_ENGINE_DIR,
      vendor_ready: hasVendorBundle(candidateWorkspace),
    };
  }

  // 4. Option A Default: Full isolated copy in the conversation's scratch directory
  //    (`<appDataDir>/brain/<conversation-id>/scratch/picture-book-studio`)
  const targetScratchDir = scratchDir
    ? path.resolve(scratchDir)
    : getDefaultScratchEngineDir();

  const alreadyScaffoldedInScratch = isEngineRoot(targetScratchDir);
  if (alreadyScaffoldedInScratch && !scaffold) {
    // Preserve characters/scenes already created in this conversation's scratch workspace
    copyTreeSync(BUNDLED_ENGINE_DIR, targetScratchDir, false);
  } else {
    // Fresh full copy of `<plugin-root>/engine/` into this conversation's scratch workspace
    copyTreeSync(BUNDLED_ENGINE_DIR, targetScratchDir, true);
  }
  ensureExportsKeep(targetScratchDir);

  return {
    engine_dir: targetScratchDir,
    source: alreadyScaffoldedInScratch && !scaffold
      ? 'conversation_scratch'
      : 'scaffolded_to_conversation_scratch',
    bundled_engine_dir: BUNDLED_ENGINE_DIR,
    vendor_ready: hasVendorBundle(targetScratchDir),
  };
}

function main() {
  const args = process.argv.slice(2);
  let workspace = null;
  let scaffold = false;
  let inPlace = false;
  let scratchDir = null;
  let promoteFrom = null;
  let promoteTarget = null;
  let jsonOut = false;

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--workspace' && args[i + 1]) {
      workspace = args[++i];
    } else if (a === '--scratch' && args[i + 1]) {
      scratchDir = args[++i];
    } else if (a === '--promote-from' && args[i + 1]) {
      promoteFrom = args[++i];
    } else if (a === '--promote-target' && args[i + 1]) {
      promoteTarget = args[++i];
    } else if (a === '--scaffold') {
      scaffold = true;
    } else if (a === '--in-place') {
      inPlace = true;
    } else if (a === '--json') {
      jsonOut = true;
    }
  }

  if (promoteFrom) {
    const promo = promoteAssetsToPlugin({
      fromWorkspace: promoteFrom,
      targetPluginRoot: promoteTarget || PLUGIN_ROOT,
    });
    if (jsonOut) {
      console.log(JSON.stringify(promo, null, 2));
    } else {
      console.log(
        `Promoted ${promo.files_synced_count} files from ${promo.promoted_from} to plugin engine at ${promo.promoted_to_engine}`
      );
    }
    return;
  }

  const result = resolveEngine({ workspace, scaffold, inPlace, scratchDir });
  if (jsonOut) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(
      `Engine ready at: ${result.engine_dir} (source: ${result.source}, vendor_ready: ${result.vendor_ready})`
    );
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
