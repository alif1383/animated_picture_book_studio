import { defineConfig, type Plugin } from 'vitest/config';
import path from 'path';
import fs from 'fs';

/**
 * Vite dev-server plugin: POST /__studio/save-export
 * Saves exported MP4 blobs directly to <workspace>/exports/<sanitized-filename>
 * and returns JSON { ok: true, savedPath: "<workspace>/exports/..." }.
 *
 * Headers:
 *   x-export-filename: <filename>.mp4   (takes priority)
 * Query:
 *   ?filename=<filename>.mp4            (fallback)
 *
 * Used by the Studio UI after video export to persist the file for agent access.
 */
function studioSaveExportPlugin(): Plugin {
  return {
    name: 'studio-save-export',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.method !== 'POST' || req.url?.split('?')[0] !== '/__studio/save-export') {
          return next();
        }

        const url = new URL(req.url ?? '', 'http://localhost');
        const rawFilename =
          (req.headers['x-export-filename'] as string | undefined) ??
          url.searchParams.get('filename') ??
          'export.mp4';

        // Sanitize filename: allow only safe chars, strip path separators
        const safeFilename = path.basename(rawFilename).replace(/[^a-zA-Z0-9._\-]/g, '_');
        const exportsDir = path.resolve(process.cwd(), 'exports');
        fs.mkdirSync(exportsDir, { recursive: true });
        const savedPath = path.join(exportsDir, safeFilename);

        const chunks: Buffer[] = [];
        req.on('data', (chunk: Buffer) => chunks.push(chunk));
        req.on('end', () => {
          try {
            const body = Buffer.concat(chunks);
            fs.writeFileSync(savedPath, body);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ ok: true, savedPath: savedPath.replace(/\\/g, '/') }));
          } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ ok: false, error: String(err) }));
          }
        });
        req.on('error', () => {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: false, error: 'Request error' }));
        });
      });

      server.middlewares.use((req, res, next) => {
        if (req.method !== 'POST' || req.url?.split('?')[0] !== '/__studio/generate-speech') {
          return next();
        }
        const chunks: Buffer[] = [];
        req.on('data', (chunk: Buffer) => chunks.push(chunk));
        req.on('end', async () => {
          try {
            const payload = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
            const rawFilename = String(payload.filename || 'voiceover.wav');
            const safeFilename = path
              .basename(rawFilename.endsWith('.wav') ? rawFilename : `${rawFilename}.wav`)
              .replace(/[^a-zA-Z0-9._\-]/g, '_');
            const outPath = path.resolve(process.cwd(), 'public', 'audio', safeFilename);
            const scriptUrl = new URL('./scripts/generate_audio.mjs', import.meta.url).href;
            const genMod = await import(/* @vite-ignore */ scriptUrl);
            const cliArgs =
              payload.mode === 'multi'
                ? [
                    'dialogue',
                    '--text',
                    String(payload.text || ''),
                    '--speakers',
                    String(payload.speakers || ''),
                    '--styles',
                    String(payload.styles || ''),
                    '--model',
                    String(payload.model || 'gemini-3.8-flash-tts'),
                    '--out',
                    outPath,
                  ]
                : [
                    'tts',
                    '--text',
                    String(payload.text || ''),
                    '--voice',
                    String(payload.voice || ''),
                    '--character',
                    String(payload.character || ''),
                    '--style',
                    String(payload.style || ''),
                    '--model',
                    String(payload.model || 'gemini-3.8-flash-tts'),
                    '--out',
                    outPath,
                  ];
            if (payload.apiKey) {
              cliArgs.push('--api-key', String(payload.apiKey));
            }
            const result = await genMod.runCli(cliArgs);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(
              JSON.stringify({
                ok: true,
                url: `/audio/${safeFilename}`,
                savedPath: outPath.replace(/\\/g, '/'),
                durationSec: result?.durationSec ?? 0,
                source: result?.source ?? 'unknown',
              })
            );
          } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ ok: false, error: String(err) }));
          }
        });
      });
    },
  };
}

export default defineConfig({
  plugins: [studioSaveExportPlugin()],
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
  },
});
