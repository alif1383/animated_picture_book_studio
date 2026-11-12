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
