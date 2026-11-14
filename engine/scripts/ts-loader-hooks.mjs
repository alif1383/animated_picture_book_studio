/**
 * Node.js module customization hooks (`module.register`) for Picture-Book Studio.
 * Allows `agy-node` / `node` to import `.ts` files with extensionless relative
 * specifiers (`../src/theme/tokens`, `../src/assets/characters` -> `index.ts`),
 * bare `'mp4-muxer'`, and bare `'vitest'` using ONLY the plugin's bundled
 * `vendor/` directory (zero `node_modules` required).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ENGINE_ROOT = path.resolve(__dirname, '..');
const require = createRequire(import.meta.url);
const ts = require(path.join(ENGINE_ROOT, 'vendor', 'typescript', 'lib', 'typescript.js'));

function tryResolveTsFile(candidateBase) {
  const candidates = [
    candidateBase,
    `${candidateBase}.ts`,
    `${candidateBase}.mjs`,
    `${candidateBase}.js`,
    path.join(candidateBase, 'index.ts'),
    path.join(candidateBase, 'index.mjs'),
    path.join(candidateBase, 'index.js'),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c) && fs.statSync(c).isFile()) {
      return c;
    }
  }
  return null;
}

export async function resolve(specifier, context, nextResolve) {
  if (specifier === 'vitest') {
    const vitestShim = path.join(ENGINE_ROOT, 'vendor', 'vitest-shim', 'index.mjs');
    return {
      url: pathToFileURL(vitestShim).href,
      shortCircuit: true,
    };
  }

  if (specifier === 'mp4-muxer') {
    const muxerPath = path.join(ENGINE_ROOT, 'vendor', 'mp4-muxer', 'mp4-muxer.mjs');
    return {
      url: pathToFileURL(muxerPath).href,
      shortCircuit: true,
    };
  }

  if (specifier === 'isomorphic-git') {
    const isoGitPath = path.join(ENGINE_ROOT, 'vendor', 'isomorphic-git', 'index.mjs');
    return {
      url: pathToFileURL(isoGitPath).href,
      shortCircuit: true,
    };
  }

  if (
    (specifier.startsWith('./') || specifier.startsWith('../') || specifier.startsWith('/')) &&
    context.parentURL &&
    context.parentURL.startsWith('file:')
  ) {
    const parentDir = path.dirname(fileURLToPath(context.parentURL));
    const targetBase = specifier.startsWith('/')
      ? path.join(ENGINE_ROOT, specifier)
      : path.resolve(parentDir, specifier);
    const resolvedFile = tryResolveTsFile(targetBase);
    if (resolvedFile) {
      return {
        url: pathToFileURL(resolvedFile).href,
        shortCircuit: true,
      };
    }
  }

  return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
  if (url.startsWith('file:') && url.endsWith('.ts')) {
    const filePath = fileURLToPath(url);
    const rawSource = fs.readFileSync(filePath, 'utf8');
    const transpiled = ts.transpileModule(rawSource, {
      fileName: filePath,
      compilerOptions: {
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.ESNext,
        moduleResolution: ts.ModuleResolutionKind.Bundler,
        isolatedModules: true,
        sourceMap: false,
      },
    });
    return {
      format: 'module',
      source: transpiled.outputText,
      shortCircuit: true,
    };
  }
  return nextLoad(url, context);
}
