import { C, PALETTE_HEX } from './palette.js';

export const FONT_FAMILY = 'Fusion Pixel 12px Monospaced Simplified Chinese';
export const FONT = `12px "${FONT_FAMILY}"`;

export function fill(ctx, color = C.ink) {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 320, 180);
}

export function rect(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

export function lineH(ctx, x, y, w, color) {
  rect(ctx, x, y, w, 1, color);
}

export function lineV(ctx, x, y, h, color) {
  rect(ctx, x, y, 1, h, color);
}

export function panel(ctx, x, y, w, h, opts = {}) {
  const { fill: bg = C.ink, border = C.silver, shadow = C.charcoal } = opts;
  x = Math.round(x);
  y = Math.round(y);
  w = Math.round(w);
  h = Math.round(h);
  if (shadow) rect(ctx, x + 2, y + 2, w, h, shadow);
  rect(ctx, x, y, w, h, border);
  rect(ctx, x + 2, y + 2, w - 4, h - 4, bg);
}

export function text(ctx, str, x, y, opts = {}) {
  const { color = C.white, size = 12, align = 'left', baseline = 'top' } = opts;
  ctx.font = `${size}px "${FONT_FAMILY}"`;
  ctx.textAlign = align;
  ctx.textBaseline = baseline;
  ctx.fillStyle = color;
  // Fusion Pixel's em box sits 3px above the visible glyphs at 12px.
  // Compensate so the caller's y is the visible top of the text.
  const dy = baseline === 'top' ? Math.round(size / 4) : 0;
  ctx.fillText(String(str), Math.round(x), Math.round(y) + dy);
}

export function textWidth(ctx, str, size = 12) {
  ctx.font = `${size}px "${FONT_FAMILY}"`;
  return ctx.measureText(String(str)).width;
}

export function typewriter(str, t, start, cps = 12) {
  if (t <= start) return '';
  const n = Math.floor((t - start) * cps);
  return str.slice(0, Math.max(0, n));
}

const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

const patternCache = new Map();

export function ditherFill(ctx, x, y, w, h, colorA, colorB) {
  const key = colorA + colorB;
  let pattern = patternCache.get(key);
  if (!pattern) {
    const c = document.createElement('canvas');
    c.width = 4;
    c.height = 4;
    const g = c.getContext('2d');
    for (let yy = 0; yy < 4; yy++) {
      for (let xx = 0; xx < 4; xx++) {
        g.fillStyle = (BAYER[yy][xx] + 0.5) / 16 < 0.5 ? colorA : colorB;
        g.fillRect(xx, yy, 1, 1);
      }
    }
    pattern = ctx.createPattern(c, 'repeat');
    patternCache.set(key, pattern);
  }
  ctx.fillStyle = pattern;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

export function sprite(ctx, rows, x, y, opts = {}) {
  const flip = !!opts.flip;
  x = Math.round(x);
  y = Math.round(y);
  for (let r = 0; r < rows.length; r++) {
    const row = rows[r];
    for (let c = 0; c < row.length; c++) {
      const ch = row[c];
      if (ch === '.' || ch === ' ') continue;
      const idx = parseInt(ch, 16);
      if (Number.isNaN(idx) || idx < 0 || idx >= PALETTE_HEX.length) continue;
      ctx.fillStyle = PALETTE_HEX[idx];
      const px = flip ? x + row.length - 1 - c : x + c;
      ctx.fillRect(px, y + r, 1, 1);
    }
  }
}

export function snap(v) {
  return Math.round(v);
}
