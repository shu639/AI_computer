import { drawChatWorld } from '../chat.js';

export function draw(ctx, t) {
  ctx.save();
  // One-pixel shake when the send button is pressed.
  if (t >= 1.6 && t < 1.75) ctx.translate(0, -1);
  drawChatWorld(ctx, t);
  ctx.restore();
}
