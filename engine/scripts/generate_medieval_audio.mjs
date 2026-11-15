#!/usr/bin/env node
/**
 * generate_medieval_audio.mjs
 * Pure-JS 44.1kHz 16-bit PCM WAV synthesizer entry point delegating to
 * modular one-file-per-sound-effect generators in `scripts/sfx/`.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { WAV_SFX_MODULES, resetSeed, writeWav } from './sfx/index.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function main() {
  resetSeed(0x5eed1234);
  const workspaceAudioDir = path.resolve(__dirname, '..', 'public', 'audio');
  const targets = [
    workspaceAudioDir,
    'C:\\Users\\sinad\\.gemini\\config\\plugins\\animated_picture_book_studio\\engine\\public\\audio',
    'D:\\picture_book_plugin\\engine\\public\\audio',
  ];

  for (const mod of WAV_SFX_MODULES) {
    console.log(
      `Synthesizing ${mod.filename} (${mod.durationSec.toFixed(1)}s)...`
    );
    const samples = mod.generate();
    const outPath = path.join(workspaceAudioDir, mod.filename);
    writeWav(outPath, samples, mod.targetPeak);
    const sizeKb = (fs.statSync(outPath).size / 1024).toFixed(1);
    console.log(`  -> Wrote ${outPath} (${sizeKb} KB)`);

    for (const targetDir of targets.slice(1)) {
      try {
        if (fs.existsSync(path.dirname(targetDir))) {
          fs.mkdirSync(targetDir, { recursive: true });
          const dest = path.join(targetDir, mod.filename);
          fs.copyFileSync(outPath, dest);
          console.log(`  -> Synced to ${dest}`);
        }
      } catch (err) {
        console.warn(`  ! Could not sync to ${targetDir}: ${err.message}`);
      }
    }
  }
}

main();
