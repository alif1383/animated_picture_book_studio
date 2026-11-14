#!/usr/bin/env node
/**
 * Picture-Book Studio VCS Helper (scripts/vcs.mjs)
 *
 * Automatically detects whether native `git` is installed on the machine.
 * - If native `git` is available (and `--force-isomorphic` is not passed),
 *   executes native `git` commands.
 * - If native `git` is NOT installed (e.g., on a machine with only Antigravity
 *   installed), seamlessly falls back to the bundled pure-JS `isomorphic-git`
 *   engine (`vendor/isomorphic-git/index.mjs`) so real `.git` repositories and
 *   atomic phase commits work everywhere!
 *
 * Usage:
 *   agy-node scripts/vcs.mjs check
 *   agy-node scripts/vcs.mjs init
 *   agy-node scripts/vcs.mjs status
 *   agy-node scripts/vcs.mjs commit -m "feat(scenes): add sleepy fox scene"
 *   agy-node scripts/vcs.mjs log [-n 5]
 */

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import isoGit from '../vendor/isomorphic-git/index.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ENGINE_ROOT = path.resolve(__dirname, '..');

function hasNativeGit(forceIsomorphic = false) {
  if (forceIsomorphic || process.env.PICTURE_BOOK_FORCE_ISOMORPHIC_GIT === '1') {
    return false;
  }
  const res = spawnSync('git', ['--version'], { encoding: 'utf8', stdio: 'pipe' });
  return res.status === 0;
}

function ensureUserIdentity(cwd) {
  const checkEmail = spawnSync('git', ['config', 'user.email'], { cwd, encoding: 'utf8' });
  if (checkEmail.status !== 0 || !checkEmail.stdout.trim()) {
    spawnSync('git', ['config', 'user.name', 'Picture-Book Studio Agent'], { cwd });
    spawnSync('git', ['config', 'user.email', 'agent@picturebook.local'], { cwd });
  }
}

async function main() {
  const rawArgs = process.argv.slice(2);
  const forceIsoIdx = rawArgs.indexOf('--force-isomorphic');
  const forceIsomorphic = forceIsoIdx !== -1;
  if (forceIsomorphic) rawArgs.splice(forceIsoIdx, 1);

  let dir = process.cwd();
  const dirIdx = rawArgs.indexOf('--dir');
  if (dirIdx !== -1 && rawArgs[dirIdx + 1]) {
    dir = path.resolve(rawArgs[dirIdx + 1]);
    rawArgs.splice(dirIdx, 2);
  } else if (!fs.existsSync(path.join(dir, 'src')) && fs.existsSync(path.join(ENGINE_ROOT, 'src'))) {
    dir = ENGINE_ROOT;
  }

  const cmd = rawArgs[0] || 'status';
  const useNative = hasNativeGit(forceIsomorphic);
  const backend = useNative ? 'native-git' : 'isomorphic-git';

  if (cmd === 'check') {
    console.log(JSON.stringify({ backend, nativeGitAvailable: useNative, dir }, null, 2));
    return;
  }

  if (cmd === 'init') {
    if (useNative) {
      if (!fs.existsSync(path.join(dir, '.git'))) {
        const res = spawnSync('git', ['init'], { cwd: dir, encoding: 'utf8' });
        if (res.status !== 0) throw new Error(res.stderr || 'git init failed');
      }
      ensureUserIdentity(dir);
      console.log(`[vcs:${backend}] Repository initialized at ${dir}`);
    } else {
      await isoGit.init({ dir });
      console.log(`[vcs:${backend}] Repository initialized at ${dir}`);
    }
    return;
  }

  if (cmd === 'status') {
    if (useNative && fs.existsSync(path.join(dir, '.git'))) {
      const res = spawnSync('git', ['status', '--short'], { cwd: dir, encoding: 'utf8' });
      console.log(`[vcs:${backend}] status in ${dir}:`);
      if (res.stdout.trim()) console.log(res.stdout.trim());
      else console.log('Clean working tree.');
    } else {
      const st = await isoGit.status({ dir });
      console.log(`[vcs:${backend}] status in ${dir} (initialized=${st.initialized}):`);
      if (st.changes.length === 0) {
        console.log('Clean working tree.');
      } else {
        for (const c of st.changes) {
          console.log(` ${c.status.padEnd(10)} ${c.path}`);
        }
      }
    }
    return;
  }

  if (cmd === 'add') {
    if (useNative && fs.existsSync(path.join(dir, '.git'))) {
      const targets = rawArgs.slice(1).length > 0 ? rawArgs.slice(1) : ['-A'];
      const res = spawnSync('git', ['add', ...targets], { cwd: dir, encoding: 'utf8' });
      if (res.status !== 0) throw new Error(res.stderr || 'git add failed');
      console.log(`[vcs:${backend}] Staged files.`);
    } else {
      const entries = await isoGit.addAll({ dir });
      console.log(`[vcs:${backend}] Staged ${entries.length} files.`);
    }
    return;
  }

  if (cmd === 'commit') {
    let msg = 'chore: update picture-book studio';
    const mIdx = rawArgs.findIndex((a) => a === '-m' || a === '--message');
    if (mIdx !== -1 && rawArgs[mIdx + 1]) {
      msg = rawArgs[mIdx + 1];
    } else if (rawArgs[1]) {
      msg = rawArgs.slice(1).join(' ');
    }

    if (useNative) {
      if (!fs.existsSync(path.join(dir, '.git'))) {
        spawnSync('git', ['init'], { cwd: dir, encoding: 'utf8' });
      }
      ensureUserIdentity(dir);
      spawnSync('git', ['add', '-A'], { cwd: dir, encoding: 'utf8' });
      const statusCheck = spawnSync('git', ['status', '--porcelain'], { cwd: dir, encoding: 'utf8' });
      if (!statusCheck.stdout.trim()) {
        console.log(`[vcs:${backend}] Nothing to commit, working tree clean.`);
        return;
      }
      const res = spawnSync('git', ['commit', '-m', msg], { cwd: dir, encoding: 'utf8' });
      if (res.status !== 0) throw new Error(res.stderr || res.stdout || 'git commit failed');
      console.log(`[vcs:${backend}] ${res.stdout.trim()}`);
    } else {
      const result = await isoGit.commit({ dir, message: msg });
      console.log(
        `[vcs:${backend}] [${result.commitOid.slice(0, 7)}] ${msg} (${result.fileCount} files tracked)`
      );
    }
    return;
  }

  if (cmd === 'log') {
    let depth = 5;
    const nIdx = rawArgs.findIndex((a) => a === '-n' || a === '--max-count');
    if (nIdx !== -1 && rawArgs[nIdx + 1]) {
      depth = Number(rawArgs[nIdx + 1]) || 5;
    }
    if (useNative && fs.existsSync(path.join(dir, '.git'))) {
      const res = spawnSync('git', ['log', `-${depth}`, '--oneline'], { cwd: dir, encoding: 'utf8' });
      console.log(`[vcs:${backend}] recent commits:`);
      console.log(res.stdout.trim());
    } else {
      const commits = await isoGit.log({ dir, depth });
      console.log(`[vcs:${backend}] recent commits:`);
      for (const c of commits) {
        console.log(`${c.oid.slice(0, 7)} ${c.message.split('\n')[0]}`);
      }
    }
    return;
  }

  console.error(`Unknown vcs command: ${cmd}. Supported: check, init, status, add, commit, log`);
  process.exit(1);
}

main().catch((err) => {
  console.error('[vcs error]', err);
  process.exit(1);
});
