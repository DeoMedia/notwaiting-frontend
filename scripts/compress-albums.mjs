#!/usr/bin/env node
/**
 * compress-albums.mjs
 * ────────────────────────────────────────────────────────────────────────
 * Batch-compresses every image in src/imports/albums/** in place.
 *
 * What it does:
 *   1. Resizes anything wider than MAX_WIDTH down to MAX_WIDTH (keeps aspect ratio).
 *   2. Re-encodes JPEGs/PNGs at a sane quality setting.
 *   3. Overwrites the original file (same name, same extension) so no code
 *      changes are needed in Gallery.tsx — the imports keep working as-is.
 *   4. Prints a before/after size table so you can see the savings.
 *
 * USAGE:
 *   npm install --save-dev sharp
 *   node scripts/compress-albums.mjs
 *
 * SAFETY:
 *   Run this on a clean git state (commit first) so you can `git diff` or
 *   `git checkout` if you don't like a result. This script overwrites files.
 */

import sharp from 'sharp';
import { readdir, stat } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ALBUMS_DIR = path.resolve(__dirname, '../src/imports/albums');

const MAX_WIDTH = 1600;       // gallery thumbnails/lightbox never need more than this
const JPEG_QUALITY = 78;      // visually lossless-ish, big size win
const PNG_QUALITY = 80;       // sharp's png compression "quality" (uses palette+compression internally)

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

async function findImages(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await findImages(fullPath)));
    } else if (IMAGE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      files.push(fullPath);
    }
  }
  return files;
}

async function compressImage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const beforeSize = (await stat(filePath)).size;

  const image = sharp(filePath);
  const metadata = await image.metadata();

  let pipeline = image;
  if (metadata.width && metadata.width > MAX_WIDTH) {
    pipeline = pipeline.resize({ width: MAX_WIDTH, withoutEnlargement: true });
  }

  if (ext === '.jpg' || ext === '.jpeg') {
    pipeline = pipeline.jpeg({ quality: JPEG_QUALITY, mozjpeg: true });
  } else if (ext === '.png') {
    pipeline = pipeline.png({ quality: PNG_QUALITY, compressionLevel: 9 });
  } else if (ext === '.webp') {
    pipeline = pipeline.webp({ quality: JPEG_QUALITY });
  }

  // Render to a buffer first — writing directly back to the same path while
  // reading from it can corrupt the file on some platforms.
  const buffer = await pipeline.toBuffer();
  await sharp(buffer).toFile(filePath + '.tmp');

  const { rename } = await import('fs/promises');
  await rename(filePath + '.tmp', filePath);

  const afterSize = (await stat(filePath)).size;
  return { beforeSize, afterSize };
}

async function main() {
  console.log(`Scanning ${ALBUMS_DIR} ...\n`);

  let images;
  try {
    images = await findImages(ALBUMS_DIR);
  } catch (err) {
    console.error(`Could not read ${ALBUMS_DIR}:`, err.message);
    process.exit(1);
  }

  if (images.length === 0) {
    console.log('No images found. Nothing to do.');
    return;
  }

  console.log(`Found ${images.length} image(s). Compressing...\n`);

  let totalBefore = 0;
  let totalAfter = 0;
  const rows = [];

  for (const filePath of images) {
    const relPath = path.relative(ALBUMS_DIR, filePath);
    try {
      const { beforeSize, afterSize } = await compressImage(filePath);
      totalBefore += beforeSize;
      totalAfter += afterSize;
      const savedPct = ((1 - afterSize / beforeSize) * 100).toFixed(0);
      rows.push([relPath, formatBytes(beforeSize), formatBytes(afterSize), `-${savedPct}%`]);
    } catch (err) {
      rows.push([relPath, 'ERROR', err.message, '']);
    }
  }

  // Print a simple aligned table
  const colWidths = [0, 0, 0, 0];
  for (const row of rows) {
    row.forEach((cell, i) => {
      colWidths[i] = Math.max(colWidths[i], String(cell).length);
    });
  }
  for (const row of rows) {
    console.log(row.map((cell, i) => String(cell).padEnd(colWidths[i])).join('   '));
  }

  console.log('\n──────────────────────────────────────────');
  console.log(`Total before: ${formatBytes(totalBefore)}`);
  console.log(`Total after:  ${formatBytes(totalAfter)}`);
  console.log(`Saved:        ${formatBytes(totalBefore - totalAfter)} (${((1 - totalAfter / totalBefore) * 100).toFixed(0)}%)`);
  console.log('──────────────────────────────────────────\n');
  console.log('Done. Review with `git diff --stat` and rebuild to confirm everything still renders.');
}

main();
