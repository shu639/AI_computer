import { C } from '../palette.js';
import { fill, rect, panel, text } from '../draw.js';
import { drawChatWorld } from '../chat.js';
import { drawChipCity } from '../world.js';

export function draw(ctx, t) {
  if (t < 1.5) {
    drawChatWorld(ctx, 4.0, {
      answerOverride: '你好！有什么可以帮你？',
      showStatus: false,
    });
    return;
  }
  if (t < 1.7) {
    fill(ctx, C.white);
    return;
  }

  drawChipCity(ctx, t);

  // The chat window as a small lit building in the city.
  panel(ctx, 136, 62, 48, 30, { fill: C.navy, border: C.yellow, shadow: C.ink });
  text(ctx, 'AI', 152, 70, { color: C.white });
  text(ctx, '>_', 152, 84, { color: C.lime });

  for (let i = 0; i < 16; i++) {
    const a = i * 0.392 + t * 1.5;
    const r = 26 + 6 * Math.sin(t * 2 + i);
    rect(ctx, Math.round(160 + Math.cos(a) * r), Math.round(78 + Math.sin(a) * r * 0.6), 1, 1, i % 2 ? C.yellow : C.orange);
  }

  if (t > 5.6) {
    const blink = Math.floor(t * 3) % 2 === 0;
    panel(ctx, 238, 36, 66, 18, { fill: C.navy, border: blink ? C.yellow : C.slate, shadow: C.ink });
    text(ctx, 'NEXT', 246, 40, { color: blink ? C.yellow : C.silver });
    text(ctx, '▶', 288, 40, { color: blink ? C.white : C.slate });
  }
}
