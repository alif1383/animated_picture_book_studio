import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';
import { spawnSync } from 'node:child_process';
import isoGit from 'isomorphic-git';

function createTinyValidPng(r: number, g: number, b: number): Buffer {
  const width = 4;
  const height = 4;
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth 8
  ihdr[9] = 2; // color type 2 (RGB)

  const rawRows: number[] = [];
  for (let y = 0; y < height; y++) {
    rawRows.push(0); // filter type 0 (None)
    for (let x = 0; x < width; x++) {
      rawRows.push(r, g, b);
    }
  }
  const idatData = zlib.deflateSync(Buffer.from(rawRows));

  const makeChunk = (type: string, data: Buffer) => {
    const buf = Buffer.alloc(12 + data.length);
    buf.writeUInt32BE(data.length, 0);
    buf.write(type, 4, 4, 'ascii');
    data.copy(buf, 8);
    // CRC placeholder
    buf.writeUInt32BE(0, 8 + data.length);
    return buf;
  };

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', idatData),
    makeChunk('IEND', Buffer.alloc(0)),
  ]);
}

describe('Phase 10: Option B Standalone Runtime, Isomorphic-Git & Zero-Python Utilities', () => {
  it('initializes a real .git repository, tracks files, and writes valid commits via bundled isomorphic-git', async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pb-isogit-'));
    try {
      fs.mkdirSync(path.join(tmpDir, 'src'), { recursive: true });
      fs.writeFileSync(
        path.join(tmpDir, 'src', 'scene.ts'),
        'export const sceneId = "test-cat-scene";\n',
        'utf8'
      );

      await isoGit.init({ dir: tmpDir });
      expect(fs.existsSync(path.join(tmpDir, '.git', 'HEAD'))).toBe(true);

      const stBefore = await isoGit.status({ dir: tmpDir });
      expect(stBefore.initialized).toBe(true);
      expect(stBefore.changes).toHaveLength(1);
      expect(stBefore.changes[0].status).toBe('untracked');

      const commit1 = await isoGit.commit({
        dir: tmpDir,
        message: 'feat(scenes): add test cat scene',
      });
      expect(commit1.commitOid).toHaveLength(40);
      expect(commit1.fileCount).toBe(1);

      const stAfter = await isoGit.status({ dir: tmpDir });
      expect(stAfter.changes).toHaveLength(0);

      // Modify file and create second commit
      fs.writeFileSync(
        path.join(tmpDir, 'src', 'scene.ts'),
        'export const sceneId = "test-cat-scene-v2";\n',
        'utf8'
      );
      const stModified = await isoGit.status({ dir: tmpDir });
      expect(stModified.changes).toHaveLength(1);
      expect(stModified.changes[0].status).toBe('modified');

      const commit2 = await isoGit.commit({
        dir: tmpDir,
        message: 'feat(scenes): update cat scene to v2',
      });
      expect(commit2.parentOid).toBe(commit1.commitOid);

      const history = await isoGit.log({ dir: tmpDir, depth: 5 });
      expect(history).toHaveLength(2);
      expect(history[0].message).toBe('feat(scenes): update cat scene to v2');
      expect(history[1].message).toBe('feat(scenes): add test cat scene');
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('executes scripts/vcs.mjs in isomorphic-git fallback mode cleanly', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pb-vcs-cli-'));
    try {
      fs.writeFileSync(path.join(tmpDir, 'note.txt'), 'crayon test', 'utf8');
      const vcsScript = path.resolve(process.cwd(), 'scripts', 'vcs.mjs');

      const checkRes = spawnSync(
        process.execPath,
        [vcsScript, 'check', '--force-isomorphic', '--dir', tmpDir],
        { encoding: 'utf8', env: { ...process.env, ELECTRON_RUN_AS_NODE: '1' } }
      );
      expect(checkRes.status).toBe(0);
      const parsed = JSON.parse(checkRes.stdout);
      expect(parsed.backend).toBe('isomorphic-git');

      const commitRes = spawnSync(
        process.execPath,
        [vcsScript, 'commit', '-m', 'test: vcs cli commit', '--force-isomorphic', '--dir', tmpDir],
        { encoding: 'utf8', env: { ...process.env, ELECTRON_RUN_AS_NODE: '1' } }
      );
      expect(commitRes.status).toBe(0);
      expect(commitRes.stdout).toContain('[vcs:isomorphic-git]');
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('generates WAV sound effects and inspects audio clips via scripts/generate_audio.mjs without Python', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pb-audio-cli-'));
    try {
      const outWav = path.join(tmpDir, 'sparkle-test.wav');
      const audioScript = path.resolve(process.cwd(), 'scripts', 'generate_audio.mjs');

      const sfxRes = spawnSync(
        process.execPath,
        [audioScript, 'sfx', 'magic_sparkle', '--duration', '0.4', '--name', 'sparkle-test', '--output', outWav],
        { encoding: 'utf8', env: { ...process.env, ELECTRON_RUN_AS_NODE: '1' } }
      );
      expect(sfxRes.status).toBe(0);
      expect(fs.existsSync(outWav)).toBe(true);
      expect(sfxRes.stdout).toContain("id: 'sparkle-test'");

      const infoRes = spawnSync(
        process.execPath,
        [audioScript, 'info', outWav, '--start-time', '2.5'],
        { encoding: 'utf8', env: { ...process.env, ELECTRON_RUN_AS_NODE: '1' } }
      );
      expect(infoRes.status).toBe(0);
      expect(infoRes.stdout).toContain('Format   : WAV');
      expect(infoRes.stdout).toContain('startTime: 2.5');
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('analyzes reference photos and maps RGB clusters to TOKENS via scripts/analyze_reference_photo.mjs without Python', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pb-photo-cli-'));
    try {
      // Create a 4x4 PNG filled with terracottaRoof (#C84B31 -> 200, 75, 49)
      const pngPath = path.join(tmpDir, 'terracotta.png');
      fs.writeFileSync(pngPath, createTinyValidPng(200, 75, 49));

      const photoScript = path.resolve(process.cwd(), 'scripts', 'analyze_reference_photo.mjs');
      const res = spawnSync(
        process.execPath,
        [photoScript, pngPath],
        { encoding: 'utf8', env: { ...process.env, ELECTRON_RUN_AS_NODE: '1' } }
      );
      expect(res.status).toBe(0);
      const report = JSON.parse(res.stdout);
      expect(report.dimensions.width).toBe(4);
      expect(report.dimensions.height).toBe(4);
      const topCluster = report.regions.overall.dominant_colors[0];
      expect(topCluster.nearest_token.token_name).toBe('terracottaRoof');
      expect(topCluster.nearest_token.suggested_pattern).toBe('pat-crayon-terracotta');
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('includes cross-platform bootstrap-node scripts that resolve Antigravity built-in Node via ANTIGRAVITY_AGENTAPI_EXE', () => {
    const cmdPath = path.resolve(process.cwd(), 'scripts', 'bootstrap-node.cmd');
    const shPath = path.resolve(process.cwd(), 'scripts', 'bootstrap-node.sh');
    expect(fs.existsSync(cmdPath)).toBe(true);
    expect(fs.existsSync(shPath)).toBe(true);

    const cmdContent = fs.readFileSync(cmdPath, 'utf8');
    const shContent = fs.readFileSync(shPath, 'utf8');
    expect(cmdContent).toContain('ANTIGRAVITY_AGENTAPI_EXE');
    expect(cmdContent).toContain('ELECTRON_RUN_AS_NODE=1');
    expect(shContent).toContain('ANTIGRAVITY_AGENTAPI_EXE');
    expect(shContent).toContain('ELECTRON_RUN_AS_NODE=1');
  });

  it('scaffolds into isolated per-conversation scratch directory (Option A), preserves edits, and promotes new assets via ensure_engine.mjs', () => {
    const tmpBase = fs.mkdtempSync(path.join(os.tmpdir(), 'pb-ensure-opt-a-'));
    try {
      const unrelatedWorkspace = path.join(tmpBase, 'unrelated-app');
      const scratchWorkspace = path.join(tmpBase, 'brain-scratch-studio');
      const mockPluginRoot = path.join(tmpBase, 'mock-plugin');
      fs.mkdirSync(unrelatedWorkspace, { recursive: true });
      fs.mkdirSync(
        path.join(mockPluginRoot, 'skills', 'picture-book-audio', 'references'),
        { recursive: true }
      );

      const ensureScript = path.resolve(process.cwd(), 'scripts', 'ensure_engine.mjs');

      // 1. First call with an unrelated folder (no src/engine/schema.ts):
      //    Should NOT pollute unrelatedWorkspace, and instead scaffold into scratchWorkspace
      const run1 = spawnSync(
        process.execPath,
        [ensureScript, '--workspace', unrelatedWorkspace, '--scratch', scratchWorkspace, '--json'],
        { encoding: 'utf8', env: { ...process.env, ELECTRON_RUN_AS_NODE: '1' } }
      );
      expect(run1.status).toBe(0);
      const res1 = JSON.parse(run1.stdout);
      expect(res1.source).toBe('scaffolded_to_conversation_scratch');
      expect(res1.engine_dir).toBe(scratchWorkspace);
      expect(res1.vendor_ready).toBe(true);
      expect(fs.readdirSync(unrelatedWorkspace)).toHaveLength(0);
      expect(fs.existsSync(path.join(scratchWorkspace, 'src', 'engine', 'schema.ts'))).toBe(true);

      // 2. Create a custom asset inside the conversation's scratch workspace
      const customAssetPath = path.join(
        scratchWorkspace,
        'src',
        'assets',
        'characters',
        'customTestFox.ts'
      );
      fs.writeFileSync(customAssetPath, 'export const CUSTOM_FOX = true;\n', 'utf8');

      // 3. Second call in the same conversation should preserve customTestFox.ts
      const run2 = spawnSync(
        process.execPath,
        [ensureScript, '--workspace', unrelatedWorkspace, '--scratch', scratchWorkspace, '--json'],
        { encoding: 'utf8', env: { ...process.env, ELECTRON_RUN_AS_NODE: '1' } }
      );
      expect(run2.status).toBe(0);
      const res2 = JSON.parse(run2.stdout);
      expect(res2.source).toBe('conversation_scratch');
      expect(fs.existsSync(customAssetPath)).toBe(true);

      // 4. Promote assets from scratchWorkspace to mockPluginRoot
      const runPromote = spawnSync(
        process.execPath,
        [
          ensureScript,
          '--promote-from',
          scratchWorkspace,
          '--promote-target',
          mockPluginRoot,
          '--json',
        ],
        { encoding: 'utf8', env: { ...process.env, ELECTRON_RUN_AS_NODE: '1' } }
      );
      expect(runPromote.status).toBe(0);
      const promoRes = JSON.parse(runPromote.stdout);
      expect(promoRes.files_synced_count).toBeGreaterThan(20);
      expect(
        fs.existsSync(
          path.join(mockPluginRoot, 'engine', 'src', 'assets', 'characters', 'customTestFox.ts')
        )
      ).toBe(true);
      expect(
        fs.existsSync(
          path.join(
            mockPluginRoot,
            'skills',
            'picture-book-audio',
            'references',
            'audio-catalog.md'
          )
        )
      ).toBe(true);
    } finally {
      fs.rmSync(tmpBase, { recursive: true, force: true });
    }
  });
});
