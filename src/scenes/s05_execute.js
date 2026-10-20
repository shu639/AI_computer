import { C } from '../palette.js';
import { fill, rect, lineH, lineV, panel, text } from '../draw.js';

const easeOut = (x) => 1 - Math.pow(1 - Math.max(0, Math.min(1, x)), 3);

function drawArena(ctx, t) {
  fill(ctx, C.ink);

  // Tiered stands
  for (let i = 0; i < 5; i++) {
    rect(ctx, 0, 22 + i * 12, 320, 2, C.charcoal);
  }
  for (let i = 0; i < 90; i++) {
    const x = (i * 37) % 320;
    const y = 24 + ((i * 17) % 56);
    const on = (i * 5 + Math.floor(t * 3)) % 13 === 0;
    rect(ctx, x, y, 1, 1, on ? C.yellow : C.slate);
  }

  // Torches
  for (const x of [18, 298]) {
    rect(ctx, x, 80, 3, 22, C.slate);
    const flame = Math.floor(t * 6) % 2;
    rect(ctx, x - 1, 74 - flame, 5, 6, C.orange);
    rect(ctx, x, 72 - flame, 3, 4, C.yellow);
  }

  // Floor
  rect(ctx, 0, 120, 320, 60, C.charcoal);
  lineH(ctx, 0, 120, 320, C.silver);
  lineH(ctx, 0, 124, 320, C.charcoal);

  // ALU sign
  panel(ctx, 120, 18, 80, 22, { fill: C.navy, border: C.yellow, shadow: C.ink });
  text(ctx, 'ALU', 148, 23, { color: C.yellow });

  // Gate creatures
  const gates = [
    { x: 34, y: 58, label: 'AND', color: C.green },
    { x: 134, y: 50, label: 'OR', color: C.sky },
    { x: 234, y: 58, label: 'XOR', color: C.plum },
  ];
  const cycle = t > 3.8 && t < 7.6 ? Math.floor((t - 3.8) / 0.6) % 3 : -1;
  gates.forEach((g, i) => {
    const active = cycle === i;
    panel(ctx, g.x, g.y, 52, 20, {
      fill: active ? C.white : C.navy,
      border: active ? C.yellow : g.color,
      shadow: C.ink,
    });
    text(ctx, g.label, g.x + 8, g.y + 5, { color: active ? C.ink : g.color });
  });
}

export function draw(ctx, t) {
  drawArena(ctx, t);

  // ALU machine
  const charging = t > 6.5 && t < 8.0;
  panel(ctx, 128, 84, 64, 40, {
    fill: C.navy,
    border: charging ? C.yellow : C.silver,
    shadow: C.ink,
  });
  text(ctx, 'ALU', 146, 90, { color: charging ? C.yellow : C.white });
  rect(ctx, 136, 104, 12, 10, C.charcoal);
  rect(ctx, 172, 104, 12, 10, C.charcoal);
  if (charging) {
    rect(ctx, 136, 104, 12, 10, Math.floor(t * 8) % 2 ? C.orange : C.yellow);
    rect(ctx, 172, 104, 12, 10, Math.floor(t * 8) % 2 ? C.yellow : C.orange);
  }

  // The two numbers enter
  const enter = easeOut(Math.min(1, t / 3));
  let x3 = 20 + enter * 88;
  let x5 = 276 - enter * 88;
  let y3 = 88;
  let y5 = 88;
  let visible = t < 5.4;
  if (t > 3.2) {
    const into = easeOut(Math.min(1, (t - 3.2) / 2.2));
    x3 = 108 + into * 28;
    x5 = 188 - into * 28;
    y3 = 88 + into * 8;
    y5 = 88 + into * 8;
  }
  if (visible) {
    text(ctx, '3', x3, y3, { color: C.white, size: 24 });
    text(ctx, '5', x5, y5, { color: C.white, size: 24 });
    if (t > 2.6 && t < 5.4) {
      text(ctx, '+', 154, 90, { color: C.yellow, size: 24 });
    }
  }

  // Result pops out
  if (t > 7.6) {
    const pop = easeOut(Math.min(1, (t - 7.6) / 0.5));
    const ry = Math.round(64 - pop * 8 + (t > 9 ? Math.floor(t * 2) % 2 : 0));
    text(ctx, '8', 202, ry, { color: C.yellow, size: 24 });
    if (t > 8.0) {
      for (let i = 0; i < 10; i++) {
        const a = i * 0.628 + t * 2;
        const r = 14 + 6 * Math.sin(t * 3 + i);
        rect(ctx, Math.round(210 + Math.cos(a) * r), Math.round(ry + 10 + Math.sin(a) * r * 0.6), 1, 1, i % 2 ? C.orange : C.white);
      }
    }
  }

  // Input labels on the machine
  text(ctx, 'IN', 134, 120, { color: C.slate });
  text(ctx, 'OUT', 184, 120, { color: C.slate });
}
