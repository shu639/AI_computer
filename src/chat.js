import { C } from './palette.js';
import { fill, rect, lineH, lineV, panel, text, textWidth, typewriter, sprite } from './draw.js';
import { BIT_IDLE, BIT_BLINK } from './sprites.js';

function drawCircuitBackdrop(ctx) {
  for (let y = 12; y < 150; y += 24) lineH(ctx, 0, y, 320, C.charcoal);
  for (let x = 16; x < 320; x += 48) lineV(ctx, x, 0, 150, C.charcoal);
  for (let y = 12; y < 150; y += 24) {
    for (let x = 16; x < 320; x += 48) {
      rect(ctx, x - 1, y - 1, 3, 3, C.slate);
    }
  }
}

export function drawChatWorld(ctx, t, opts = {}) {
  const { answerOverride = null, showStatus = true } = opts;
  fill(ctx, C.ink);
  drawCircuitBackdrop(ctx);

  panel(ctx, 24, 20, 272, 118, { fill: C.navy, border: C.silver, shadow: C.charcoal });
  rect(ctx, 26, 22, 268, 14, C.blue);
  text(ctx, 'AI CHAT', 32, 24, { color: C.white });
  text(ctx, '● LIVE', 288, 24, { color: C.lime, align: 'right' });

  // Typing the user message
  const typed = t < 1.6 ? typewriter('你好，AI', t, 0.3, 4) : '你好，AI';
  rect(ctx, 150, 42, 126, 20, C.blue);
  text(ctx, typed, 158, 46, { color: C.white });
  if (t < 1.6 && Math.floor(t * 4) % 2 === 0) {
    rect(ctx, 158 + Math.round(textWidth(ctx, typed)), 46, 2, 10, C.yellow);
  }

  // Thinking status
  if (showStatus && t >= 1.7 && t < 3.25) {
    const dots = '.'.repeat(1 + (Math.floor(t * 3) % 3));
    rect(ctx, 38, 70, 150, 18, C.charcoal);
    text(ctx, '正在思考' + dots, 46, 74, { color: C.silver });
  }

  // Send button (presses down for 0.15s)
  const pressed = t >= 1.6 && t < 1.75;
  const by = pressed ? 1 : 0;
  rect(ctx, 228, 70 + by, 48, 20, C.orange);
  text(ctx, '发送', 238, 74 + by, { color: C.ink });

  // Answer bubble
  const answer = answerOverride !== null
    ? answerOverride
    : (t >= 3.2 ? typewriter('你好！有什么可以帮你？', t, 3.2, 12) : '');
  if (answerOverride !== null ? answer.length > 0 : t >= 3.2) {
    rect(ctx, 64, 92, 188, 36, C.blue);
    text(ctx, answer.slice(0, 3), 72, 98, { color: C.white });
    text(ctx, answer.slice(3), 72, 111, { color: C.white });
  }

  // BIT idles at the bottom-left
  const blink = Math.floor(t * 2) % 2 === 1;
  sprite(ctx, blink ? BIT_BLINK : BIT_IDLE, 32, 100);
  text(ctx, 'BIT', 32, 114, { color: C.silver });

  // Spark along the bottom trace
  const px = 20 + Math.floor((t / 4) * 276);
  rect(ctx, px, 143, 3, 3, C.yellow);
  rect(ctx, px - 3, 144, 2, 1, C.orange);
  rect(ctx, px + 4, 144, 2, 1, C.orange);
}
