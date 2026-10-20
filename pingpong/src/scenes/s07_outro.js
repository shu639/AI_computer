import { C, W } from '../palette.js';
import {
  fill,
  rect,
  lineH,
  lineV,
  text,
  textWidth,
  misprintText,
  grid,
  halftone,
  panel,
  roundRectPath,
  ball,
  spinArc,
  dashedLine,
  curveArrow,
  bezier,
  arrow,
  line,
  circle,
  ring,
  ellipse,
  courtTop,
  stamp,
  tape,
  registrationMark,
  clamp,
  lerp,
  easeOut,
  easeInOut,
  FONT_MONO,
} from '../draw.js';

function fade(t, a, b, d = 0.4) {
  return Math.min(clamp((t - a) / d), clamp((b - t) / d));
}

function tag(ctx, label, x, y, opts = {}) {
  const { color = C.paper, textColor = C.ink, border = C.ink, size = 12, weight = 700, pad = 7 } = opts;
  const w = textWidth(ctx, label, size, weight) + pad * 2;
  const h = size + pad * 1.2;
  rect(ctx, x, y, w, h, color);
  ctx.save();
  ctx.strokeStyle = border;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x, y, w, h);
  ctx.restore();
  text(ctx, label, x + pad, y + pad * 0.45, { size, weight, color: textColor });
  return { x, y, w, h };
}

function paddleIcon(ctx, x, y, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = C.ink;
  ctx.fillRect(-7, 30, 14, 46);
  ctx.fillStyle = C.paper;
  ctx.fillRect(-6, 40, 12, 8);
  ctx.beginPath();
  ctx.ellipse(0, 0, 30, 40, 0, 0, Math.PI * 2);
  ctx.fillStyle = C.red;
  ctx.fill();
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.fillStyle = C.yellow;
  ctx.font = `800 14px ${FONT_MONO}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('R', 0, 0);
  ctx.restore();
}

function miniFlow(ctx, cx, cy, color) {
  for (let i = -2; i <= 2; i++) {
    const y = cy + i * 14;
    const pts = [];
    for (let k = 0; k <= 20; k++) {
      const x = cx - 90 + (k / 20) * 180;
      const bend = 22 * Math.exp(-Math.pow((x - cx) / 34, 2)) * Math.sign(i || 1);
      pts.push([x, y - bend]);
    }
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (const p of pts) ctx.lineTo(p[0], p[1]);
    ctx.stroke();
    ctx.restore();
  }
  circle(ctx, cx, cy, 18, C.paper);
  ring(ctx, cx, cy, 18, C.ink, 3);
  circle(ctx, cx, cy - 5, 3, C.red);
  circle(ctx, cx + 7, cy + 4, 3, C.red);
}

function miniTable(ctx, x, y, color) {
  rect(ctx, x - 80, y + 24, 160, 18, C.green);
  lineH(ctx, x - 80, y + 24, 160, C.paper, 3);
  rect(ctx, x - 80, y + 42, 160, 10, C.green2);
  const p = 0.6;
  curveArrow(ctx, [x - 60, y - 10], [x - 10, y - 44], [x + 30, y + 18], color, {
    width: 3,
    head: 9,
  });
  circle(ctx, x + 30, y + 18, 6, color);
}

export function draw(ctx, t) {
  fill(ctx, C.paper);
  grid(ctx, 0, 64, W, 404, { step: 40, alpha: 0.045 });
  halftone(ctx, 640, 64, 320, 404, C.yellow, { size: 8, radius: 1.5, alpha: 0.09 });
  rect(ctx, 0, 64, 7, 404, C.red);

  // --- Phase A: the principle ------------------------------------------------
  const aA = fade(t, 0, 3.4);
  if (aA > 0) {
    ctx.save();
    ctx.globalAlpha = aA;
    text(ctx, '07 / THE PRINCIPLE', 44, 80, {
      size: 12,
      weight: 800,
      color: C.red,
      letterSpacing: 2.2,
    });
    text(ctx, '力，不穿过球心。', 42, 104, { size: 42, weight: 800, color: C.ink });
    text(ctx, '就有了力矩，也就有了旋转。', 44, 162, { size: 18, weight: 600, color: C.ink2 });

    const cx = 330;
    const cy = 300;
    const r = 100;
    dashedLine(ctx, 120, cy, 540, cy, C.ink2, { width: 2, dash: 7, gap: 5 });
    text(ctx, '球心', 128, cy + 10, { size: 13, weight: 700, color: C.ink3 });
    ball(ctx, cx, cy, r, { angle: t * 3.5, axis: [0.45, 0.55, 0.7], logo: C.red, width: 4 });
    arrow(ctx, 120, 232, 540, 232, C.yellow, { width: 5, head: 16 });
    text(ctx, '力线', 128, 202, { size: 14, weight: 800, color: C.ink });
    dashedLine(ctx, cx, cy, cx, 232, C.ink, { width: 2, dash: 5, gap: 4 });
    tag(ctx, '力臂 d', cx - 54, cy - 44, {
      color: C.paper,
      textColor: C.ink,
      border: C.ink,
      size: 13,
      weight: 800,
    });
    curveArrow(ctx, [cx + 70, cy - 18], [cx + 96, cy - 84], [cx + 30, cy - 116], C.red, {
      width: 3,
      head: 11,
    });
    text(ctx, '力矩', cx + 102, cy - 118, { size: 16, weight: 800, color: C.red });
    tag(ctx, 'τ = r × F', 620, 360, {
      color: C.yellow,
      textColor: C.ink,
      border: C.ink,
      size: 20,
      weight: 800,
    });
    text(ctx, '力线偏离球心越远，转得越狠。', 620, 402, {
      size: 13,
      weight: 600,
      color: C.ink2,
    });
    ctx.restore();
  }

  // --- Phase B: the causal chain --------------------------------------------
  const aB = fade(t, 3.0, 7.9);
  if (aB > 0) {
    ctx.save();
    ctx.globalAlpha = aB;
    text(ctx, '08 / THE CHAIN', 44, 80, {
      size: 12,
      weight: 800,
      color: C.ink2,
      letterSpacing: 2.2,
    });
    text(ctx, '拍 → 空气 → 台面', 42, 102, { size: 40, weight: 800, color: C.ink });
    text(ctx, '一条因果链，三个改写点。', 44, 160, { size: 17, weight: 600, color: C.ink2 });

    const cards = [
      { x: 60, color: C.red, cn: '摩擦', en: 'DIRECTION', live: t >= 3.0 && t < 5.4 },
      { x: 350, color: C.blue, cn: '空气', en: 'CURVE', live: t >= 3.0 && t < 5.4 },
      { x: 640, color: C.green, cn: '台面', en: 'BOUNCE', live: t >= 5.4 },
    ];
    cards.forEach((c, i) => {
      ctx.save();
      ctx.globalAlpha = aB * (c.live ? 1 : 0.42);
      panel(ctx, c.x, 200, 260, 190, {
        fill: C.paper,
        border: c.live ? c.color : C.ink3,
        shadow: c.live ? c.color : C.ink3,
        offset: 6,
        width: 3,
      });
      rect(ctx, c.x, 200, 260, 7, c.live ? c.color : C.ink3);
      text(ctx, c.cn, c.x + 18, 216, { size: 28, weight: 800, color: c.color });
      text(ctx, c.en, c.x + 20, 254, {
        size: 9,
        weight: 800,
        color: C.ink3,
        letterSpacing: 1.8,
      });
      if (i === 0) paddleIcon(ctx, c.x + 130, 314, 0.8);
      if (i === 1) miniFlow(ctx, c.x + 130, 318, C.blue);
      if (i === 2) miniTable(ctx, c.x + 130, 318, C.green);
      text(ctx, i === 0 ? '定方向' : i === 1 ? '改弧线' : '改反弹', c.x + 172, 224, {
        size: 14,
        weight: 800,
        color: c.live ? c.color : C.ink3,
      });
      ctx.restore();
    });
    ctx.restore();
  }

  // --- Phase C: the whole picture --------------------------------------------
  const aC = fade(t, 7.6, 12.9);
  if (aC > 0) {
    ctx.save();
    ctx.globalAlpha = aC;
    text(ctx, '09 / THE WHOLE PICTURE', 44, 80, {
      size: 12,
      weight: 800,
      color: C.ink2,
      letterSpacing: 2.2,
    });
    text(ctx, '三个环节，一起改写。', 42, 102, {
      size: 30,
      weight: 800,
      color: C.ink,
    });
    courtTop(ctx, 250, 150, 460, 230, { fill: C.green, line: C.paper });
    bezier(ctx, [280, 340], [360, 220], [520, 200], [650, 300], C.red, { width: 3 });
    bezier(ctx, [650, 300], [520, 340], [360, 320], [280, 340], C.blue, {
      width: 3,
      dashed: true,
    });
    bezier(ctx, [300, 300], [470, 160], [660, 250], [660, 250], C.paper, { width: 7 });
    curveArrow(ctx, [300, 300], [470, 160], [660, 250], C.yellow, { width: 3, head: 10 });
    ball(ctx, 650, 300, 16, { angle: t * 5, axis: [0, 1, 0], logo: C.red, width: 2 });
    ball(ctx, 300, 300, 16, { angle: -t * 5, axis: [0, 1, 0], logo: C.blue, width: 2 });
    if (t > 10.8) {
      tag(ctx, '下一次，先看拍，再看球。', 44, 388, {
        color: C.yellow,
        textColor: C.ink,
        border: C.ink,
        size: 15,
        weight: 800,
      });
      text(ctx, 'SPIN IS A CONVERSATION', 44, 432, {
        size: 10,
        weight: 800,
        color: C.ink3,
        letterSpacing: 2.2,
      });
    }
    ctx.restore();
  }

  // --- End card --------------------------------------------------------------
  if (t > 12.8) {
    ctx.save();
    rect(ctx, 0, 64, W, 404, C.paper);
    grid(ctx, 0, 64, W, 404, { step: 40, alpha: 0.05 });
    halftone(ctx, 0, 64, 420, 404, C.yellow, { size: 8, radius: 1.6, alpha: 0.16 });
    rect(ctx, 0, 64, 7, 404, C.red);
    text(ctx, 'THE END / 下一球见', 44, 100, {
      size: 12,
      weight: 800,
      color: C.red,
      letterSpacing: 2.6,
    });
    misprintText(ctx, '旋转的', 42, 130, {
      size: 78,
      weight: 800,
      color: C.ink,
      shadow: C.red,
      offset: 5,
    });
    text(ctx, '语言', 42, 214, { size: 78, weight: 800, color: C.ink });
    lineH(ctx, 46, 316, 300, C.ink, 3);
    text(ctx, '两分钟看懂乒乓球旋转', 44, 330, { size: 26, weight: 700, color: C.ink2 });
    text(ctx, 'THE LANGUAGE OF SPIN', 46, 368, {
      size: 12,
      weight: 800,
      color: C.ink3,
      letterSpacing: 2.4,
    });
    ball(ctx, 720, 292, 84, {
      angle: t * 5,
      axis: [0.45, 0.89, 0],
      logo: C.red,
      width: 4,
    });
    spinArc(ctx, 720, 292, 110, -2.4, 0.6, C.red, { width: 5, head: 15 });
    stamp(ctx, 'RISO EDITION', 650, 404, { size: 15, color: C.red, angle: -0.08 });
    tape(ctx, 640, 150, 100, 28, -0.25, C.yellow);
    registrationMark(ctx, 900, 100, C.ink, 5);
    ctx.restore();
  }
}
