#!/usr/bin/env node
/**
 * Picture-Book Studio Zero-Dependency CLI (`scripts/studio-cli.mjs`)
 *
 * Runs entirely on Antigravity's built-in `agy-node` (or standard `node`)
 * using ONLY the pre-bundled pure-JS modules in `vendor/`:
 *   - `vendor/typescript/lib/tsc.js` & `typescript.js`
 *   - `vendor/mp4-muxer/mp4-muxer.mjs`
 *   - `vendor/vitest-shim/index.mjs`
 *
 * Commands:
 *   agy-node scripts/studio-cli.mjs typecheck
 *   agy-node scripts/studio-cli.mjs test [filter]
 *   agy-node scripts/studio-cli.mjs build
 *   agy-node scripts/studio-cli.mjs dev [--port 5173]
 *   agy-node scripts/studio-cli.mjs export [--scene <id>] [--resolution 1080p|720p] [--footage <actId>]
 */

import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { register, createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ENGINE_ROOT = path.resolve(__dirname, '..');
const require = createRequire(import.meta.url);
const ts = require(path.join(ENGINE_ROOT, 'vendor', 'typescript', 'lib', 'typescript.js'));

// ---------------------------------------------------------------------------
// 1. Typecheck (`tsc --noEmit`)
// ---------------------------------------------------------------------------
function runTypecheck() {
  const tscPath = path.join(ENGINE_ROOT, 'vendor', 'typescript', 'lib', 'tsc.js');
  const tsconfigPath = path.join(ENGINE_ROOT, 'tsconfig.json');
  const res = spawnSync(process.execPath, [tscPath, '--noEmit', '-p', tsconfigPath], {
    cwd: ENGINE_ROOT,
    stdio: 'inherit',
    env: { ...process.env, ELECTRON_RUN_AS_NODE: '1' },
  });
  return res.status === 0;
}

// ---------------------------------------------------------------------------
// 2. Unit & Integration Test Runner (Vitest-compatible)
// ---------------------------------------------------------------------------
function collectTestFiles(dir, filter = '', out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectTestFiles(full, filter, out);
    } else if (entry.isFile() && entry.name.endsWith('.test.ts')) {
      if (!filter || full.toLowerCase().includes(filter.toLowerCase())) {
        out.push(full);
      }
    }
  }
  return out;
}

async function runSuiteRecursive(suite, ancestorBeforeEach = [], ancestorAfterEach = []) {
  let passed = 0;
  let failed = 0;
  const failures = [];

  for (const fn of suite.beforeAll) await fn();

  const curBeforeEach = [...ancestorBeforeEach, ...suite.beforeEach];
  const curAfterEach = [...suite.afterEach, ...ancestorAfterEach];

  for (const t of suite.tests) {
    try {
      for (const bf of curBeforeEach) await bf();
      await t.fn();
      for (const af of curAfterEach) await af();
      passed++;
    } catch (err) {
      failed++;
      failures.push({ suite: suite.name, test: t.name, error: err });
    }
  }

  for (const child of suite.suites) {
    const sub = await runSuiteRecursive(child, curBeforeEach, curAfterEach);
    passed += sub.passed;
    failed += sub.failed;
    failures.push(...sub.failures);
  }

  for (const fn of suite.afterAll) await fn();

  return { passed, failed, failures };
}

async function runTests(filterArg = '') {
  register(pathToFileURL(path.join(__dirname, 'ts-loader-hooks.mjs')).href);
  const vitestShimUrl = pathToFileURL(
    path.join(ENGINE_ROOT, 'vendor', 'vitest-shim', 'index.mjs')
  ).href;
  const { registeredSuites, resetRegisteredSuites } = await import(vitestShimUrl);

  const testFiles = collectTestFiles(path.join(ENGINE_ROOT, 'tests'), filterArg).sort();
  if (testFiles.length === 0) {
    console.error('No test files found in tests/.');
    return false;
  }

  console.log(`\n RUN  Picture-Book Studio Test Runner (${ ENGINE_ROOT })\n`);
  const startAll = Date.now();
  let totalFilesPassed = 0;
  let totalFilesFailed = 0;
  let totalTestsPassed = 0;
  let totalTestsFailed = 0;
  const allFailures = [];

  for (const file of testFiles) {
    resetRegisteredSuites();
    const relFile = path.relative(ENGINE_ROOT, file).replace(/\\/g, '/');
    const t0 = Date.now();
    await import(pathToFileURL(file).href);

    let filePassed = 0;
    let fileFailed = 0;
    for (const suite of registeredSuites) {
      const res = await runSuiteRecursive(suite);
      filePassed += res.passed;
      fileFailed += res.failed;
      for (const f of res.failures) {
        allFailures.push({ file: relFile, ...f });
      }
    }
    const elapsed = Date.now() - t0;
    totalTestsPassed += filePassed;
    totalTestsFailed += fileFailed;

    if (fileFailed === 0) {
      totalFilesPassed++;
      console.log(` ✓ ${relFile} (${filePassed} tests) ${elapsed}ms`);
    } else {
      totalFilesFailed++;
      console.log(` ✗ ${relFile} (${filePassed} passed, ${fileFailed} failed) ${elapsed}ms`);
    }
  }

  const totalDuration = ((Date.now() - startAll) / 1000).toFixed(2);
  console.log(
    `\n Test Files  ${totalFilesPassed} passed (${totalFilesPassed + totalFilesFailed})`
  );
  console.log(`      Tests  ${totalTestsPassed} passed (${totalTestsPassed + totalTestsFailed})`);
  console.log(`   Duration  ${totalDuration}s\n`);

  if (allFailures.length > 0) {
    for (const f of allFailures) {
      console.error(`FAIL ${f.file} > ${f.suite} > ${f.test}`);
      console.error(`  ${f.error?.stack || f.error}\n`);
    }
    return false;
  }
  return true;
}

// ---------------------------------------------------------------------------
// 3. Browser Module Transpiler & Import Resolver (for `dev` and `build`)
// ---------------------------------------------------------------------------
function resolveLocalModuleFile(fromFile, specifier) {
  const baseDir = path.dirname(fromFile);
  const targetBase = specifier.startsWith('/')
    ? path.join(ENGINE_ROOT, specifier)
    : path.resolve(baseDir, specifier);

  const candidates = [
    targetBase,
    `${targetBase}.ts`,
    `${targetBase}.mjs`,
    `${targetBase}.js`,
    path.join(targetBase, 'index.ts'),
    path.join(targetBase, 'index.mjs'),
    path.join(targetBase, 'index.js'),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c) && fs.statSync(c).isFile()) {
      return c;
    }
  }
  return null;
}

function rewriteBrowserImports(jsCode, sourceFilePath, forBuild = false) {
  const rewriteSpec = (spec) => {
    if (spec === 'mp4-muxer') {
      return '/__vendor/mp4-muxer.mjs';
    }
    if (spec.startsWith('./') || spec.startsWith('../') || spec.startsWith('/src/')) {
      const resolved = resolveLocalModuleFile(sourceFilePath, spec);
      if (resolved) {
        let webPath = '/' + path.relative(ENGINE_ROOT, resolved).replace(/\\/g, '/');
        if (forBuild && webPath.endsWith('.ts')) {
          webPath = webPath.slice(0, -3) + '.js';
        }
        return webPath;
      }
    }
    return spec;
  };

  return jsCode
    .replace(
      /(from\s+['"])([^'"]+)(['"])/g,
      (_m, pre, spec, post) => `${pre}${rewriteSpec(spec)}${post}`
    )
    .replace(
      /(import\s*\(\s*['"])([^'"]+)(['"]\s*\))/g,
      (_m, pre, spec, post) => `${pre}${rewriteSpec(spec)}${post}`
    );
}

function transpileTsForBrowser(filePath, forBuild = false) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const out = ts.transpileModule(raw, {
    fileName: filePath,
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      isolatedModules: true,
      sourceMap: false,
    },
  });
  return rewriteBrowserImports(out.outputText, filePath, forBuild);
}

// ---------------------------------------------------------------------------
// 4. Production Build (`build`: typecheck + emit `dist/`)
// ---------------------------------------------------------------------------
function copyDirRecursive(srcDir, destDir) {
  if (!fs.existsSync(srcDir)) return;
  fs.mkdirSync(destDir, { recursive: true });
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else if (entry.isFile()) {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function buildSrcTree(srcDir, distSrcDir) {
  fs.mkdirSync(distSrcDir, { recursive: true });
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const srcPath = path.join(srcDir, entry.name);
    if (entry.isDirectory()) {
      buildSrcTree(srcPath, path.join(distSrcDir, entry.name));
    } else if (entry.isFile() && entry.name.endsWith('.ts') && !entry.name.endsWith('.d.ts')) {
      const jsCode = transpileTsForBrowser(srcPath, true);
      const outName = entry.name.slice(0, -3) + '.js';
      fs.writeFileSync(path.join(distSrcDir, outName), jsCode, 'utf8');
    }
  }
}

function runBuild() {
  console.log('[build] Running strict TypeScript check (tsc --noEmit)...');
  if (!runTypecheck()) {
    console.error('[build] TypeScript check failed.');
    return false;
  }

  const distDir = path.join(ENGINE_ROOT, 'dist');
  fs.rmSync(distDir, { recursive: true, force: true });
  fs.mkdirSync(path.join(distDir, '__vendor'), { recursive: true });

  // 1. Copy public/ static assets
  copyDirRecursive(path.join(ENGINE_ROOT, 'public'), distDir);

  // 2. Copy vendor/mp4-muxer
  fs.copyFileSync(
    path.join(ENGINE_ROOT, 'vendor', 'mp4-muxer', 'mp4-muxer.mjs'),
    path.join(distDir, '__vendor', 'mp4-muxer.mjs')
  );

  // 3. Transpile src/**/*.ts -> dist/src/**/*.js
  buildSrcTree(path.join(ENGINE_ROOT, 'src'), path.join(distDir, 'src'));

  // 4. Write dist/index.html
  const indexHtml = fs
    .readFileSync(path.join(ENGINE_ROOT, 'index.html'), 'utf8')
    .replace('src="/src/main.ts"', 'src="/src/main.js"');
  fs.writeFileSync(path.join(distDir, 'index.html'), indexHtml, 'utf8');

  console.log(`[build] Successfully built Picture-Book Studio to ${distDir}`);
  return true;
}

// ---------------------------------------------------------------------------
// 5. Dev Server (`dev`: HTTP server on :5173 + TS transpiler + /__studio/save-export)
// ---------------------------------------------------------------------------
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.m4a': 'audio/mp4',
  '.mp4': 'video/mp4',
};

function createStudioHttpServer(callbacks = {}) {
  const { onExportSaved, onExportError } = callbacks;
  return http.createServer((req, res) => {
    const parsedUrl = new URL(req.url || '/', 'http://localhost');
    const pathname = decodeURIComponent(parsedUrl.pathname);

    // 1. POST /__studio/save-export middleware (saves MP4 to <engine-root>/exports/)
    if (req.method === 'POST' && pathname === '/__studio/save-export') {
      const rawFilename =
        req.headers['x-export-filename'] ||
        parsedUrl.searchParams.get('filename') ||
        'export.mp4';
      const safeFilename = path
        .basename(String(rawFilename))
        .replace(/[^a-zA-Z0-9._\-]/g, '_');
      const exportsDir = path.join(ENGINE_ROOT, 'exports');
      fs.mkdirSync(exportsDir, { recursive: true });
      const savedPath = path.join(exportsDir, safeFilename);

      const chunks = [];
      req.on('data', (chunk) => chunks.push(chunk));
      req.on('end', () => {
        try {
          const buf = Buffer.concat(chunks);
          fs.writeFileSync(savedPath, buf);
          const normalizedPath = savedPath.replace(/\\/g, '/');
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(
            JSON.stringify({
              ok: true,
              savedPath: normalizedPath,
            })
          );
          if (typeof onExportSaved === 'function') {
            onExportSaved(normalizedPath, buf.length);
          }
        } catch (err) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: false, error: String(err) }));
          if (typeof onExportError === 'function') {
            onExportError(String(err));
          }
        }
      });
      return;
    }

    // 1b. POST /__studio/export-error notification from browser
    if (req.method === 'POST' && pathname === '/__studio/export-error') {
      const chunks = [];
      req.on('data', (chunk) => chunks.push(chunk));
      req.on('end', () => {
        const msg = Buffer.concat(chunks).toString('utf8');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
        if (typeof onExportError === 'function') {
          onExportError(msg || 'Unknown browser export error');
        }
      });
      return;
    }

    // 1c. POST /__studio/generate-speech (Google AI Studio Gemini TTS proxy)
    if (req.method === 'POST' && pathname === '/__studio/generate-speech') {
      const chunks = [];
      req.on('data', (chunk) => chunks.push(chunk));
      req.on('end', async () => {
        try {
          const payload = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
          const rawFilename = String(payload.filename || 'voiceover.wav');
          const safeFilename = path
            .basename(rawFilename.endsWith('.wav') ? rawFilename : `${rawFilename}.wav`)
            .replace(/[^a-zA-Z0-9._\-]/g, '_');
          const outPath = path.join(ENGINE_ROOT, 'public', 'audio', safeFilename);
          const genMod = await import('./generate_audio.mjs');
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
          res.end(JSON.stringify({ ok: false, error: err instanceof Error ? err.message : String(err) }));
        }
      });
      return;
    }

    // 2. Serve bundled vendor mp4-muxer
    if (pathname === '/__vendor/mp4-muxer.mjs') {
      const muxerFile = path.join(ENGINE_ROOT, 'vendor', 'mp4-muxer', 'mp4-muxer.mjs');
      res.writeHead(200, {
        'Content-Type': 'application/javascript; charset=utf-8',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      });
      res.end(fs.readFileSync(muxerFile));
      return;
    }

    // 3. Serve index.html for root
    if (pathname === '/' || pathname === '/index.html') {
      const html = fs.readFileSync(path.join(ENGINE_ROOT, 'index.html'), 'utf8');
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      });
      res.end(html);
      return;
    }

    // 4. Serve /src/**/* TypeScript modules (transpiled on the fly)
    if (pathname.startsWith('/src/')) {
      const resolved = resolveLocalModuleFile(ENGINE_ROOT, pathname);
      if (resolved && resolved.endsWith('.ts')) {
        try {
          const js = transpileTsForBrowser(resolved, false);
          res.writeHead(200, {
            'Content-Type': 'application/javascript; charset=utf-8',
            'Cache-Control': 'no-store, no-cache, must-revalidate',
          });
          res.end(js);
          return;
        } catch (err) {
          res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end(String(err));
          return;
        }
      }
    }

    // 5. Serve static files from public/ or root exports/
    const publicCandidate = path.join(ENGINE_ROOT, 'public', pathname);
    const rootCandidate = path.join(ENGINE_ROOT, pathname);
    const staticFile =
      fs.existsSync(publicCandidate) && fs.statSync(publicCandidate).isFile()
        ? publicCandidate
        : fs.existsSync(rootCandidate) && fs.statSync(rootCandidate).isFile()
          ? rootCandidate
          : null;

    if (staticFile) {
      const ext = path.extname(staticFile).toLowerCase();
      const mime = MIME_TYPES[ext] || 'application/octet-stream';
      res.writeHead(200, {
        'Content-Type': mime,
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      });
      res.end(fs.readFileSync(staticFile));
      return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(`Not Found: ${pathname}`);
  });
}

function startDevServer(port = 5173) {
  const server = createStudioHttpServer();
  server.listen(port, '127.0.0.1', () => {
    console.log(`\n  Picture-Book Studio Dev Server ready!`);
    console.log(`  ➜  Local:   http://localhost:${port}/`);
    console.log(`  ➜  Engine:  ${ENGINE_ROOT}\n`);
  });
}

// ---------------------------------------------------------------------------
// 6. Headless CLI Video Export (`export --scene <id> [--resolution 1080p|720p]`)
// ---------------------------------------------------------------------------
function findHeadlessBrowserBinary() {
  if (process.env.PICTURE_BOOK_BROWSER_BIN && fs.existsSync(process.env.PICTURE_BOOK_BROWSER_BIN)) {
    return process.env.PICTURE_BOOK_BROWSER_BIN;
  }

  const localAppData = process.env.LOCALAPPDATA || '';
  const programFiles = process.env.PROGRAMFILES || 'C:\\Program Files';
  const programFilesX86 = process.env['PROGRAMFILES(X86)'] || 'C:\\Program Files (x86)';

  const candidates = [
    // Windows (Microsoft Edge is pre-installed on all Windows 10/11 systems)
    path.join(programFilesX86, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
    path.join(programFiles, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
    localAppData ? path.join(localAppData, 'Microsoft', 'Edge', 'Application', 'msedge.exe') : '',
    path.join(programFiles, 'Google', 'Chrome', 'Application', 'chrome.exe'),
    path.join(programFilesX86, 'Google', 'Chrome', 'Application', 'chrome.exe'),
    localAppData ? path.join(localAppData, 'Google', 'Chrome', 'Application', 'chrome.exe') : '',
    path.join(programFiles, 'BraveSoftware', 'Brave-Browser', 'Application', 'brave.exe'),
    // macOS
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
    // Linux
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/usr/bin/microsoft-edge',
    '/usr/bin/brave-browser',
  ].filter(Boolean);

  for (const bin of candidates) {
    if (fs.existsSync(bin)) {
      return bin;
    }
  }
  return null;
}

function getArgValue(args, flag, defaultVal = '') {
  const idx = args.indexOf(flag);
  if (idx !== -1 && args[idx + 1] && !args[idx + 1].startsWith('--')) {
    return args[idx + 1];
  }
  const eq = args.find((a) => a.startsWith(`${flag}=`));
  if (eq) {
    return eq.slice(flag.length + 1);
  }
  return defaultVal;
}

async function runHeadlessExport(args) {
  const sceneId = getArgValue(args, '--scene', '') || getArgValue(args, '--short_sample', '') || '1';
  const resolution = getArgValue(args, '--resolution', '1080p');
  const footage = getArgValue(args, '--footage', '');
  const vibrant = getArgValue(args, '--vibrant', '');
  const timeoutSec = Number(getArgValue(args, '--timeout', '180')) || 180;

  const browserBin = findHeadlessBrowserBinary();
  if (!browserBin) {
    console.error(
      '[export] Could not locate a local Chromium/Edge browser binary for CLI export. ' +
        'Set PICTURE_BOOK_BROWSER_BIN or use the Antigravity built-in browser subagent on http://localhost:5173/?scene=' +
        encodeURIComponent(sceneId) +
        '&auto_export=1&resolution=' +
        encodeURIComponent(resolution)
    );
    return false;
  }

  let resolveExport;
  let rejectExport;
  const exportPromise = new Promise((resolve, reject) => {
    resolveExport = resolve;
    rejectExport = reject;
  });

  const server = createStudioHttpServer({
    onExportSaved: (savedPath, sizeBytes) => {
      resolveExport({ savedPath, sizeBytes });
    },
    onExportError: (errMsg) => {
      rejectExport(new Error(errMsg));
    },
  });

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;

  const query = new URLSearchParams({
    scene: sceneId,
    auto_export: '1',
    resolution,
  });
  if (footage) query.set('footage', footage);
  if (vibrant) query.set('vibrant', vibrant);

  const exportUrl = `http://127.0.0.1:${port}/?${query.toString()}`;
  const tempProfile = path.join(os.tmpdir(), `pb-cli-export-${Date.now()}`);

  console.log(`[export] Rendering scene="${sceneId}" (${resolution} 16:9) in headless mode...`);
  console.log(`[export] Browser engine: ${path.basename(browserBin)}`);

  const startTime = Date.now();
  const browserProc = spawn(
    browserBin,
    [
      '--headless=new',
      '--no-sandbox',
      '--remote-debugging-port=0',
      '--autoplay-policy=no-user-gesture-required',
      '--no-first-run',
      '--no-default-browser-check',
      `--user-data-dir=${tempProfile}`,
      exportUrl,
    ],
    { stdio: 'ignore' }
  );

  let timer;
  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(`Timed out after ${timeoutSec}s waiting for video export.`));
    }, timeoutSec * 1000);
  });

  try {
    const { savedPath, sizeBytes } = await Promise.race([exportPromise, timeoutPromise]);
    clearTimeout(timer);
    const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(1);
    const mb = (sizeBytes / (1024 * 1024)).toFixed(2);
    console.log(`[export] Export complete in ${elapsedSec}s (${mb} MB)`);
    console.log(`[export] Saved MP4: ${savedPath}`);
    console.log(`[export] Link: [${path.basename(savedPath)}](file:///${savedPath})`);
    return true;
  } catch (err) {
    clearTimeout(timer);
    console.error(`[export] Failed: ${err instanceof Error ? err.message : String(err)}`);
    return false;
  } finally {
    try {
      browserProc.kill();
    } catch {}
    server.close();
    setTimeout(() => {
      try {
        fs.rmSync(tempProfile, { recursive: true, force: true });
      } catch {}
    }, 300);
  }
}

// ---------------------------------------------------------------------------
// Entrypoint
// ---------------------------------------------------------------------------
async function main() {
  const args = process.argv.slice(2);
  const cmd = args[0] || 'test';

  if (cmd === 'typecheck') {
    process.exit(runTypecheck() ? 0 : 1);
  } else if (cmd === 'test') {
    const filter = args[1] && !args[1].startsWith('-') ? args[1] : '';
    const ok = await runTests(filter);
    process.exit(ok ? 0 : 1);
  } else if (cmd === 'build') {
    process.exit(runBuild() ? 0 : 1);
  } else if (cmd === 'dev') {
    let port = 5173;
    const pIdx = args.indexOf('--port');
    if (pIdx !== -1 && args[pIdx + 1]) {
      port = Number(args[pIdx + 1]) || 5173;
    }
    startDevServer(port);
  } else if (cmd === 'export') {
    const ok = await runHeadlessExport(args.slice(1));
    process.exit(ok ? 0 : 1);
  } else {
    console.error(`Unknown studio-cli command: ${cmd}. Use: typecheck | test | build | dev | export`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
