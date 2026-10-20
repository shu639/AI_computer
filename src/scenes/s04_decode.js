import { C } from '../palette.js';
import { fill, rect, lineH, lineV, panel, text, sprite } from '../draw.js';
import { CU_WIZARD } from '../sprites.js';

const easeOut = (x) => 1 - Math.pow(1 - Math.max(0, Math.min(1, x)), 3);

function drawChamber(ctx) {
  fill(ctx, C.ink);
  // Machine frame
  panel(ctx, 62, 24, 196, 104, { fill: C.charcoal, border: C.slate, shadow: C.ink });
  rect(ctx, 66, 28, 188, 2, C.slate);
  // Pipes and indicator lights
  lineH(ctx, 0, 36, 62, C.charcoal);
  lineH(ctx, 258, 36, 62, C.charcoal);
  lineV(ctx, 30, 36, 40, C.charcoal);
  lineV(ctx, 290, 36, 40, C.charcoal);
  for (let i = 0; i < 6; i++) {
    rect(ctx, 70 + i * 30, 116, 3, 3, i % 2 ? C.teal : C.slate);
  }
  // Floor
  rect(ctx, 0, 138, 320, 42, C.charcoal);
  lineH(ctx, 0, 138, 320, C.silver);
}

export function draw(ctx, t) {
  drawChamber(ctx);

  // CU wizard
  sprite(ctx, CU_WIZARD, 32, 120);
  text(ctx, 'CU', 50, 126, { color: C.silver });
  // Pointing staff
  lineH(ctx, 48, 124, 22, C.slate);
  lineV(ctx, 70, 100, 24, C.slate);
  const pulse = (t * 2) % 1;
  rect(ctx, 70, Math.round(124 - pulse * 24), 1, 1, C.yellow);

  // Instruction card: full, then split into opcode + operand
  const split = easeOut(Math.min(1, Math.max(0, (t - 3.5) / 1.2)));
  const bob = Math.floor(t * 2) % 2;

  if (split < 0.02) {
    panel(ctx, 96, 48 + bob, 128, 34, { fill: C.navy, border: C.yellow, shadow: C.ink });
    text(ctx, 'LOAD R1,[0x2A]', 104, 57 + bob, { color: C.yellow });
    if (t > 0.5) text(ctx, '指令卡', 104, 38 + bob, { color: C.silver });
  } else {
    const lx = Math.round(96 - 26 * split);
    const rx = Math.round(166 + 20 * split);
    panel(ctx, lx, 48, 64, 34, { fill: C.navy, border: C.yellow, shadow: C.ink });
    panel(ctx, rx, 48, 64, 34, { fill: C.navy, border: C.yellow, shadow: C.ink });
    text(ctx, 'LOAD', lx + 8, 57, { color: C.yellow });
    text(ctx, '0x2A', rx + 8, 57, { color: C.yellow });
    // Split seam
    if (Math.floor(t * 6) % 2 === 0) lineV(ctx, 160, 44, 42, C.white);
    if (t > 4.8) {
      text(ctx, '做什么', lx + 8, 88, { color: C.white });
      text(ctx, '对谁做', rx + 8, 88, { color: C.white });
    }
    if (t > 5.4) {
      lineV(ctx, 218, 82, 28, C.slate);
      lineH(ctx, 218, 110, 28, C.slate);
      const p = (t * 2) % 1;
      if (p < 0.5) rect(ctx, 218, Math.round(82 + p * 56), 2, 2, C.yellow);
      else rect(ctx, Math.round(218 + (p - 0.5) * 56), 110, 2, 2, C.yellow);
    }
  }

  // Register panel R1
  panel(ctx, 246, 92, 58, 44, { fill: C.navy, border: C.silver, shadow: C.ink });
  text(ctx, 'R1', 252, 98, { color: C.white });
  const lit = t < 6.5 ? 0 : Math.min(8, Math.floor((t - 6.5) * 4));
  for (let i = 0; i < 8; i++) {
    const x = 252 + (i % 4) * 12;
    const y = 110 + Math.floor(i / 4) * 10;
    rect(ctx, x, y, 8, 8, i < lit ? C.yellow : C.charcoal);
    if (i < lit) rect(ctx, x + 2, y + 2, 4, 4, C.orange);
  }
}
