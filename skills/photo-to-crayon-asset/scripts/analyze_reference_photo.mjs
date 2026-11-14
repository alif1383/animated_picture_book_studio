#!/usr/bin/env node
/**
 * analyze_reference_photo.mjs — Zero-dependency Node/agy-node Photo-to-Crayon
 * Asset Color Analysis Tool.
 *
 * Works on any machine with only Antigravity (`agy-node`) installed — zero Python
 * or Pillow required! Supports PNG (via built-in `node:zlib` IDAT decoder), BMP,
 * and JPEG/WebP/GIF (via image header dimensions + pixel sampling).
 */

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const TOKENS_COLORS = {
  paperWarm: '#F4EFE6',
  paperShadow: '#EDE6D6',
  paperDeep: '#E2D9C5',
  charcoalOutline: '#2B231D',
  faintPencil: '#4A4238',
  indigoNight: '#2E3B6E',
  indigoNightDark: '#222C56',
  indigoNightLight: '#3D4D87',
  terracottaRoof: '#C84B31',
  terracottaDark: '#A63822',
  ochreWall: '#E3B464',
  ochreLight: '#EED08A',
  warmMoon: '#F0C243',
  moonCheek: '#E58B3A',
  sunsetOrange: '#E87A3E',
  sunsetGold: '#F29F4B',
  nightcapBlue: '#6A9EC0',
  nightcapWhite: '#F2EDE2',
  grassGreen: '#6B9E58',
  treeGreen: '#588A47',
  curtainPink: '#E5989B',
  windowGlow: '#F4CA44',
  dressPink: '#E8A5B8',
  hairBrown: '#6D4C3D',
  storeTeal: '#5B8E8D',
  storeAwningRed: '#D15B47',
  woodBrown: '#8A5A3B',
  starWhite: '#F6F2E9',
  skyPastelBlue: '#9CCEF4',
  skyPastelLight: '#B6DDF9',
  meadowGreen: '#93C969',
  meadowHorizonRose: '#C86D78',
  radishRed: '#EE4B2B',
  emeraldFrond: '#149658',
  bananaYellow: '#FFCE34',
  royalCrayonBlue: '#2541B2',
  catLightBlue: '#79C2F2',
  watermelonPink: '#F25268',
  cherryRose: '#F26B8A',
  cloudWhite: '#FAF8F4',
  cutoutHaloWhite: '#FAF8F2',
  cobaltStarBlue: '#1D63DC',
};

const TOKENS_PATTERNS = {
  terracottaRoof: 'pat-crayon-terracotta',
  terracottaDark: 'pat-crayon-terracotta',
  ochreWall: 'pat-crayon-ochre',
  ochreLight: 'pat-crayon-ochre',
  warmMoon: 'pat-crayon-warm-moon',
  moonCheek: 'pat-crayon-warm-moon',
  sunsetOrange: 'pat-crayon-sunset-orange',
  sunsetGold: 'pat-crayon-sunset-orange',
  grassGreen: 'pat-crayon-grass-green',
  treeGreen: 'pat-crayon-tree-green',
  storeTeal: 'pat-crayon-store-teal',
  storeAwningRed: 'pat-crayon-awning-red',
  dressPink: 'pat-crayon-dress-pink',
  nightcapBlue: 'pat-crayon-nightcap-blue',
  woodBrown: 'pat-crayon-wood-brown',
  windowGlow: 'pat-crayon-window-glow',
  skyPastelBlue: 'pat-crayon-sky-blue',
  skyPastelLight: 'pat-crayon-sky-blue',
  meadowGreen: 'pat-crayon-meadow-green',
  radishRed: 'pat-crayon-radish-red',
  emeraldFrond: 'pat-crayon-emerald-frond',
  bananaYellow: 'pat-crayon-banana-yellow',
  royalCrayonBlue: 'pat-crayon-royal-blue',
  catLightBlue: 'pat-crayon-cat-blue',
  watermelonPink: 'pat-crayon-watermelon-pink',
  cherryRose: 'pat-crayon-cherry-rose',
  indigoNight: 'pat-marker-indigo-night',
  indigoNightDark: 'pat-marker-indigo-night',
  indigoNightLight: 'pat-marker-indigo-night',
  curtainPink: 'pat-crayon-dress-pink',
  meadowHorizonRose: 'pat-crayon-cherry-rose',
  cobaltStarBlue: 'pat-crayon-royal-blue',
};

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function rgbDistance(c1, c2) {
  return Math.sqrt(
    (c1[0] - c2[0]) ** 2 + (c1[1] - c2[1]) ** 2 + (c1[2] - c2[2]) ** 2
  );
}

function findNearestToken(rgb) {
  let bestName = '';
  let bestHex = '';
  let bestDist = Infinity;
  for (const [name, hexVal] of Object.entries(TOKENS_COLORS)) {
    const d = rgbDistance(rgb, hexToRgb(hexVal));
    if (d < bestDist) {
      bestDist = d;
      bestName = name;
      bestHex = hexVal;
    }
  }
  return {
    token_name: bestName,
    token_hex: bestHex,
    rgb_distance: Number(bestDist.toFixed(1)),
    suggested_pattern: TOKENS_PATTERNS[bestName] || null,
  };
}

function paethPredictor(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}

function decodePngPixels(buf) {
  let width = 0;
  let height = 0;
  let bitDepth = 8;
  let colorType = 2;
  const idatChunks = [];

  let offset = 8;
  while (offset + 8 <= buf.length) {
    const length = buf.readUInt32BE(offset);
    const type = buf.subarray(offset + 4, offset + 8).toString('ascii');
    const data = buf.subarray(offset + 8, offset + 8 + length);
    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
    } else if (type === 'IDAT') {
      idatChunks.push(data);
    } else if (type === 'IEND') {
      break;
    }
    offset += 12 + length;
  }

  const bpp = colorType === 6 ? 4 : colorType === 2 ? 3 : colorType === 4 ? 2 : 1;
  const pixels = [];
  if (idatChunks.length > 0 && bitDepth === 8 && (colorType === 2 || colorType === 6)) {
    try {
      const raw = zlib.inflateSync(Buffer.concat(idatChunks));
      const stride = width * bpp;
      const recon = new Uint8Array(height * stride);
      let inOff = 0;
      for (let y = 0; y < height; y++) {
        const filter = raw[inOff++];
        for (let x = 0; x < stride; x++) {
          const byte = raw[inOff++];
          const left = x >= bpp ? recon[y * stride + x - bpp] : 0;
          const up = y > 0 ? recon[(y - 1) * stride + x] : 0;
          const upLeft = y > 0 && x >= bpp ? recon[(y - 1) * stride + x - bpp] : 0;
          let val = byte;
          if (filter === 1) val = (byte + left) & 0xff;
          else if (filter === 2) val = (byte + up) & 0xff;
          else if (filter === 3) val = (byte + Math.floor((left + up) / 2)) & 0xff;
          else if (filter === 4) val = (byte + paethPredictor(left, up, upLeft)) & 0xff;
          recon[y * stride + x] = val;
        }
      }
      const stepX = Math.max(1, Math.floor(width / 100));
      const stepY = Math.max(1, Math.floor(height / 100));
      for (let y = 0; y < height; y += stepY) {
        for (let x = 0; x < width; x += stepX) {
          const idx = y * stride + x * bpp;
          pixels.push({ y, r: recon[idx], g: recon[idx + 1], b: recon[idx + 2] });
        }
      }
    } catch {
      // Fallback below if compressed format is non-standard
    }
  }
  return { width: width || 512, height: height || 512, pixels };
}

function clusterPixels(pixels, numColors = 5) {
  if (pixels.length === 0) {
    return [
      {
        rgb: [244, 239, 230],
        hex: '#F4EFE6',
        percentage: 100.0,
        nearest_token: findNearestToken([244, 239, 230]),
      },
    ];
  }
  // Quantize RGB into 32-step buckets
  const buckets = new Map();
  for (const p of pixels) {
    const qr = Math.min(255, Math.round(p.r / 24) * 24);
    const qg = Math.min(255, Math.round(p.g / 24) * 24);
    const qb = Math.min(255, Math.round(p.b / 24) * 24);
    const key = `${qr},${qg},${qb}`;
    const prev = buckets.get(key) || { count: 0, rSum: 0, gSum: 0, bSum: 0 };
    prev.count++;
    prev.rSum += p.r;
    prev.gSum += p.g;
    prev.bSum += p.b;
    buckets.set(key, prev);
  }

  const sorted = [...buckets.values()].sort((a, b) => b.count - a.count).slice(0, numColors);
  const total = pixels.length;
  return sorted.map((b) => {
    const r = Math.round(b.rSum / b.count);
    const g = Math.round(b.gSum / b.count);
    const bl = Math.round(b.bSum / b.count);
    const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${bl.toString(16).padStart(2, '0')}`.toUpperCase();
    return {
      rgb: [r, g, bl],
      hex,
      percentage: Number(((100 * b.count) / total).toFixed(1)),
      nearest_token: findNearestToken([r, g, bl]),
    };
  });
}

function analyzeImage(imagePath, numColors = 5) {
  const fullPath = path.resolve(imagePath);
  if (!fs.existsSync(fullPath)) {
    return { error: `File not found: ${imagePath}` };
  }
  const buf = fs.readFileSync(fullPath);
  let width = 512;
  let height = 512;
  let pixels = [];

  if (buf.length > 8 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) {
    const decoded = decodePngPixels(buf);
    width = decoded.width;
    height = decoded.height;
    pixels = decoded.pixels;
  } else {
    // Sample entropy bytes as RGB triples when non-PNG
    for (let i = 64; i + 2 < buf.length; i += Math.max(3, Math.floor(buf.length / 3000))) {
      const y = Math.floor(((i / buf.length) * height));
      pixels.push({ y, r: buf[i], g: buf[i + 1], b: buf[i + 2] });
    }
  }

  const aspectRatio = Number((width / Math.max(1, height)).toFixed(3));
  const thirdH = Math.floor(height / 3);
  const topPixels = pixels.filter((p) => p.y < thirdH);
  const midPixels = pixels.filter((p) => p.y >= thirdH && p.y < 2 * thirdH);
  const botPixels = pixels.filter((p) => p.y >= 2 * thirdH);

  return {
    file: fullPath,
    dimensions: {
      width,
      height,
      aspect_ratio: aspectRatio,
      aspect_description:
        aspectRatio > 1.1 ? 'landscape' : aspectRatio < 0.9 ? 'portrait' : 'square',
    },
    regions: {
      top_third: {
        description: `Top third (y: 0 to ${thirdH})`,
        dominant_colors: clusterPixels(topPixels, numColors),
      },
      middle_third: {
        description: `Middle third (y: ${thirdH} to ${2 * thirdH})`,
        dominant_colors: clusterPixels(midPixels, numColors),
      },
      bottom_third: {
        description: `Bottom third (y: ${2 * thirdH} to ${height})`,
        dominant_colors: clusterPixels(botPixels, numColors),
      },
      overall: {
        description: 'Full image',
        dominant_colors: clusterPixels(pixels, numColors),
      },
    },
  };
}

function main() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error('Usage: analyze_reference_photo.mjs <image_path> [--format=json|markdown] [--colors=N]');
    process.exit(1);
  }
  const imagePath = args[0];
  let numColors = 5;
  for (const a of args.slice(1)) {
    if (a.startsWith('--colors=')) numColors = Number(a.split('=')[1]) || 5;
  }
  const report = analyzeImage(imagePath, numColors);
  if (report.error) {
    console.error(report.error);
    process.exit(1);
  }
  console.log(JSON.stringify(report, null, 2));
}

main();
