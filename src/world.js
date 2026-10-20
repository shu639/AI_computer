import { C } from './palette.js';
import { fill, rect, lineH, lineV, text, sprite } from './draw.js';
import { CHEST_CLOSED, CHEST_OPEN } from './sprites.js';

const CHEST_SPACING = 56;

function hex2(n) {
  return n.toString(16).toUpperCase().padStart(2, '0');
}

export function drawCorridor(ctx, scrollX, opts = {}) {
  const { openIndex = -1, showLabels = true } = opts;
  fill(ctx, C.ink);

  // Ceiling and wall panels
  rect(ctx, 0, 0, 320, 16, C.charcoal);
  lineH(ctx, 0, 16, 320, C.slate);
  for (let x = -(scrollX % 32); x < 320; x += 32) {
    lineV(ctx, x, 16, 122, C.charcoal);
    rect(ctx, x + 14, 24, 4, 4, C.slate);
  }

  // Pipes
  lineH(ctx, 0, 24, 320, C.slate);
  lineH(ctx, 0, 27, 320, C.charcoal);

  // Floor
  rect(ctx, 0, 138, 320, 42, C.charcoal);
  lineH(ctx, 0, 138, 320, C.silver);
  for (let x = -(scrollX % 16); x < 320; x += 16) {
    lineV(ctx, x, 138, 42, C.ink);
  }

  // Chests on the floor
  const first = Math.floor(scrollX / CHEST_SPACING) - 1;
  for (let i = 0; i < 9; i++) {
    const index = first + i;
    if (index < 0) continue;
    const x = Math.round(index * CHEST_SPACING - scrollX + 24);
    if (x < -24 || x > 320) continue;
    const open = index === openIndex;
    sprite(ctx, open ? CHEST_OPEN : CHEST_CLOSED, x, 128);
    if (showLabels) {
      text(ctx, '0x' + hex2(index), x + 1, 118, { color: C.slate });
    }
  }

  // Floating dust motes (deterministic)
  for (let i = 0; i < 18; i++) {
    const seed = i * 97;
    const x = (seed * 13 + Math.floor(scrollX * (0.3 + (i % 3) * 0.1))) % 320;
    const y = 30 + ((seed * 7 + Math.floor(scrollX * 0.2)) % 100);
    rect(ctx, (x + 320) % 320, y, 1, 1, i % 4 === 0 ? C.silver : C.slate);
  }
}

export function drawChipCity(ctx, t) {
  fill(ctx, C.ink);
  // Night sky
  for (let i = 0; i < 48; i++) {
    const x = (i * 53) % 320;
    const y = 6 + ((i * 29) % 52);
    const twinkle = (i + Math.floor(t * 2)) % 9 === 0;
    rect(ctx, x, y, 1, 1, twinkle ? C.white : C.slate);
  }
  // A skyline of chip blocks
  for (let i = 0; i < 14; i++) {
    const w = 18 + (i * 7) % 22;
    const h = 24 + (i * 13) % 60;
    const x = i * 24 - 10;
    rect(ctx, x, 180 - h, w, h, i % 2 ? C.charcoal : C.navy);
    rect(ctx, x + 3, 180 - h + 3, w - 6, 2, C.slate);
    for (let wy = 180 - h + 8; wy < 176; wy += 8) {
      for (let wx = x + 4; wx < x + w - 4; wx += 6) {
        const on = (wx * 3 + wy * 5 + Math.floor(t * 4)) % 11 === 0;
        rect(ctx, wx, wy, 1, 1, on ? C.yellow : C.slate);
      }
    }
  }
  // Sparks running along the streets
  for (let i = 0; i < 12; i++) {
    const x = (i * 29 + Math.floor(t * (9 + i))) % 320;
    const y = 150 + (i % 4) * 7;
    rect(ctx, x, y, 2, 2, i % 3 === 0 ? C.cyan : C.yellow);
  }
}
