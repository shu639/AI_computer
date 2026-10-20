import { C, W } from '../palette.js';
import {
  fill,
  rect,
  lineH,
  lineV,
  text,
  textWidth,
  grid,
  halftone,
  panel,
  roundRectPath,
  ball,
  spinArc,
  dashedLine,
  curveArrow,
  arrow,
  arc,
  line,
  circle,
  ring,
  ellipse,
  courtTop,
  paddleTop,
  stamp,
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

function paddleFace(ctx, x, y, angle, opts = {}) {
  const { face = C.red, w = 34, h = 104, alpha = 1, label = 'R' } = opts;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.globalAlpha = alpha;
  // Handle.
  ctx.fillStyle = C.ink;
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-8, h / 2 - 6);
  ctx.lineTo(8, h / 2 - 6);
  ctx.lineTo(10, h / 2 + 40);
  ctx.lineTo(-10, h / 2 + 40);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = C.paper;
  ctx.fillRect(-7, h / 2 + 6, 14, 10);
  // Blade.
  roundRectPath(ctx, -w / 2, -h / 2, w, h, 8);
  ctx.fillStyle = face;
  ctx.fill();
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.save();
  ctx.globalAlpha = alpha * 0.55;
  ctx.fillStyle = C.paper;
  ctx.fillRect(-w / 2 + 5, -h / 2 + 6, 4, h - 12);
  ctx.restore();
  ctx.fillStyle = C.yellow;
  ctx.font = `800 14px ${FONT_MONO}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, 0, 0);
  ctx.restore();
}

function protractor(ctx, cx, cy, r, angle, color) {
  arc(ctx, cx, cy, r, Math.PI + 0.55, Math.PI * 2 - 0.55, C.ink2, 2);
  for (let i = -6; i <= 6; i++) {
    const a = -Math.PI / 2 + (i / 6) * 0.95;
    const x0 = cx + Math.cos(a) * r;
    const y0 = cy + Math.sin(a) * r;
    const x1 = cx + Math.cos(a) * (r + (i % 3 === 0 ? 9 : 5));
    const y1 = cy + Math.sin(a) * (r + (i % 3 === 0 ? 9 : 5));
    line(ctx, x0, y0, x1, y1, C.ink2, 1);
  }
  const na = -Math.PI / 2 + angle;
  line(ctx, cx, cy, cx + Math.cos(na) * (r + 14), cy + Math.sin(na) * (r + 14), color, 4);
  circle(ctx, cx, cy, 4, C.ink);
}

function checkMark(ctx, x, y, color) {
  ring(ctx, x, y, 14, color, 3);
  line(ctx, x - 6, y, x - 1, y + 6, color, 3);
  line(ctx, x - 1, y + 6, x + 7, y - 6, color, 3);
}

export function draw(ctx, t) {
  fill(ctx, C.paper);
  grid(ctx, 0, 64, W, 404, { step: 40, alpha: 0.045 });
  halftone(ctx, 640, 64, 320, 404, C.red, { size: 8, radius: 1.5, alpha: 0.08 });
  rect(ctx, 0, 64, 7, 404, C.red);

  // --- Phase A: watch the racket --------------------------------------------
  const aA = fade(t, 0, 5.2);
  if (aA > 0) {
    ctx.save();
    ctx.globalAlpha = aA;
    text(ctx, '06 / READ THE RACKET', 44, 80, {
      size: 12,
      weight: 800,
      color: C.red,
      letterSpacing: 2.2,
    });
    text(ctx, '先学会看。', 42, 102, { size: 44, weight: 800, color: C.ink });
    text(ctx, '拍面、触球点，比引拍更可靠。', 44, 160, { size: 17, weight: 600, color: C.ink2 });

    courtTop(ctx, 270, 112, 420, 250, { fill: C.green, line: C.paper });
    // Opponent paddle, with ghosts.
    const swing = Math.sin(t * 1.8) * 0.4;
    for (let i = 2; i >= 1; i--) {
      paddleTop(ctx, 480, 154, Math.PI + swing - i * 0.22, {
        scale: 0.64,
        face: C.ink,
        label: 'B',
        alpha: 0.16,
      });
    }
    paddleTop(ctx, 480, 154, Math.PI + swing, { scale: 0.64, face: C.ink, label: 'B' });
    ball(ctx, 480, 238, 24, { angle: t * 4, axis: [0, 1, 0], logo: C.red });
    paddleTop(ctx, 480, 340, 0, { scale: 0.64, face: C.red, label: 'R' });
    arrow(ctx, 480, 320, 480, 270, C.yellow, { width: 3, head: 10 });
    text(ctx, 'YOU', 540, 344, { size: 10, weight: 800, color: C.paper, letterSpacing: 1.6 });

    // Eye and scanline.
    const ex = 140;
    const ey = 256;
    ctx.save();
    ctx.strokeStyle = C.ink;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(ex - 58, ey);
    ctx.quadraticCurveTo(ex, ey - 50, ex + 58, ey);
    ctx.quadraticCurveTo(ex, ey + 50, ex - 58, ey);
    ctx.stroke();
    ctx.restore();
    circle(ctx, ex, ey, 20, C.paper);
    ring(ctx, ex, ey, 20, C.ink, 3);
    circle(ctx, ex, ey, 8, C.red);
    lineH(ctx, ex - 44, ey + 34, 88, C.red, 2);
    text(ctx, 'LOOK / 看', ex, ey + 44, { size: 11, weight: 800, color: C.red, align: 'center', letterSpacing: 1.6 });

    const rows = [
      { y: 176, cn: '拍面', en: 'BLADE', color: C.red },
      { y: 246, cn: '触球点', en: 'CONTACT', color: C.yellow },
      { y: 316, cn: '第一跳', en: 'BOUNCE', color: C.blue },
    ];
    rows.forEach((r, i) => {
      const on = t > 2.2 + i * 0.8;
      rect(ctx, 742, r.y + 3, 8, 8, on ? r.color : C.ink3);
      text(ctx, r.cn, 760, r.y - 6, { size: 20, weight: 800, color: on ? C.ink : C.ink3 });
      text(ctx, r.en, 762, r.y + 22, {
        size: 9,
        weight: 800,
        color: on ? C.ink3 : C.ink3,
        letterSpacing: 1.8,
      });
    });
    tag(ctx, '触球那一下，信息最多', 270, 382, {
      color: C.yellow,
      textColor: C.ink,
      border: C.ink,
      size: 12,
      weight: 800,
    });
    ctx.restore();
  }

  // --- Phase B: blade + contact point vs logo --------------------------------
  const aB = fade(t, 5.0, 10.4);
  if (aB > 0) {
    ctx.save();
    ctx.globalAlpha = aB;
    text(ctx, '07 / BLADE + CONTACT', 44, 80, {
      size: 12,
      weight: 800,
      color: C.red,
      letterSpacing: 2.2,
    });
    text(ctx, '方向看拍面；球标只判转速。', 44, 102, { size: 30, weight: 800, color: C.ink });

    // Left: macro contact.
    panel(ctx, 44, 158, 430, 286, {
      fill: C.paper,
      border: C.ink,
      shadow: C.red,
      offset: 6,
      width: 2.5,
    });
    const bx = 210;
    const by = 300;
    ball(ctx, bx, by, 82, { angle: t * 4, axis: [0, 0, 1], logo: C.red, width: 4 });
    paddleFace(ctx, 350, 260, -0.48, { w: 34, h: 116, face: C.red });
    const cx = bx + 64;
    const cy = by - 48;
    circle(ctx, cx, cy, 5, C.yellow);
    ring(ctx, cx, cy, 11, C.yellow, 2);
    dashedLine(ctx, bx, by, cx, cy, C.ink, { width: 2, dash: 6, gap: 4 });
    text(ctx, '触球点', cx + 10, cy - 30, { size: 14, weight: 800, color: C.ink });
    text(ctx, '中上部', cx + 10, cy - 12, { size: 12, weight: 600, color: C.ink2 });
    text(ctx, '拍面角度', 60, 184, { size: 14, weight: 800, color: C.red });
    protractor(ctx, 350, 260, 48, -0.48, C.red);
    text(ctx, '-28°', 350, 334, { size: 14, weight: 800, color: C.red, align: 'center', font: FONT_MONO });

    // Right: logo blur.
    panel(ctx, 494, 158, 422, 286, {
      fill: C.paper,
      border: C.ink,
      shadow: C.blue,
      offset: 6,
      width: 2.5,
    });
    for (let i = 4; i >= 1; i--) {
      ctx.save();
      ctx.globalAlpha = 0.12 * i;
      ring(ctx, 700, 292, 40 + i * 9, C.red, 4);
      ctx.restore();
    }
    ball(ctx, 700, 292, 44, { angle: t * 12, axis: [0, 1, 0], logo: C.red, width: 3 });
    text(ctx, '球标糊成环', 554, 190, { size: 16, weight: 800, color: C.ink });
    text(ctx, '只说明：转得快', 554, 212, { size: 16, weight: 800, color: C.red });
    tag(ctx, '方向？看拍面', 554, 372, {
      color: C.blue,
      textColor: C.paper,
      border: C.blue,
      size: 14,
      weight: 800,
    });
    ctx.restore();
  }

  // --- Phase C: return topspin vs backspin -----------------------------------
  const aC = fade(t, 10.0, 20.0);
  if (aC > 0) {
    ctx.save();
    ctx.globalAlpha = aC;
    text(ctx, '08 / RETURN', 44, 80, {
      size: 12,
      weight: 800,
      color: C.ink2,
      letterSpacing: 2.2,
    });
    const panels = [
      {
        x: 44,
        color: C.red,
        cn: '接上旋',
        en: 'VS TOPSPIN',
        angle: -0.48,
        contact: '中上部',
        cue: '压拍 · 前送',
        ticks: ['压拍', '打中上部', '往前送'],
      },
      {
        x: 492,
        color: C.blue,
        cn: '接下旋',
        en: 'VS BACKSPIN',
        angle: 0.48,
        contact: '中下部',
        cue: '亮拍 · 向前上',
        ticks: ['亮拍', '摩擦中下部', '向前上'],
      },
    ];
    panels.forEach((pl, i) => {
      panel(ctx, pl.x, 112, 424, 330, {
        fill: C.paper,
        border: pl.color,
        shadow: pl.color,
        offset: 7,
        width: 3,
      });
      rect(ctx, pl.x, 112, 424, 7, pl.color);
      text(ctx, pl.cn, pl.x + 22, 128, { size: 30, weight: 800, color: pl.color });
      text(ctx, pl.en, pl.x + 24, 166, {
        size: 10,
        weight: 800,
        color: C.ink3,
        letterSpacing: 1.8,
      });

      const bx = pl.x + 120;
      const by = 280;
      ball(ctx, bx, by, 52, {
        angle: (i === 0 ? 1 : -1) * t * 5,
        axis: [0, 0, 1],
        logo: pl.color,
        width: 3,
      });
      spinArc(ctx, bx, by, 62, i === 0 ? -2.2 : 0.2, i === 0 ? 0.4 : 2.8, pl.color, {
        width: 3,
        head: 10,
      });
      paddleFace(ctx, bx + 72, by, pl.angle, { w: 30, h: 100, face: C.red });
      const cx = bx + 48;
      const cy = by + (i === 0 ? -18 : 18);
      circle(ctx, cx, cy, 5, C.yellow);
      ring(ctx, cx, cy, 10, C.yellow, 2);
      text(ctx, pl.contact, bx - 30, i === 0 ? by - 96 : by + 56, {
        size: 12,
        weight: 800,
        color: C.ink,
      });

      // Stroke arrow.
      if (i === 0) {
        arrow(ctx, bx + 112, by + 86, bx + 112, by - 18, pl.color, { width: 4, head: 12 });
      } else {
        arrow(ctx, bx + 112, by + 86, bx + 132, by - 6, pl.color, { width: 4, head: 12 });
      }
      // Protractor.
      protractor(ctx, bx + 72, by, 46, pl.angle, pl.color);
      text(ctx, i === 0 ? '-28°' : '+28°', bx + 72, by + 70, {
        size: 14,
        weight: 800,
        color: pl.color,
        align: 'center',
        font: FONT_MONO,
      });

      pl.ticks.forEach((tick, k) => {
        const on = t > 12.6 + k * 0.35;
        text(ctx, (on ? '✓ ' : '· ') + tick, pl.x + 250, 196 + k * 26, {
          size: 14,
          weight: 700,
          color: on ? C.ink : C.ink3,
        });
      });
      text(ctx, pl.cue, pl.x + 250, 292, { size: 18, weight: 800, color: pl.color });
      text(ctx, i === 0 ? '回球更低、更快' : '回球更高、更转', pl.x + 250, 320, {
        size: 13,
        weight: 600,
        color: C.ink2,
      });
    });

    // The "block vs brush" overlay.
    if (t > 15.2) {
      const p = easeOut((t - 15.2) / 0.4);
      ctx.save();
      ctx.globalAlpha = aC * p;
      tag(ctx, '能咬就咬：主动摩擦', 250, 402, {
        color: C.red,
        textColor: C.paper,
        border: C.red,
        size: 12,
        weight: 800,
      });
      tag(ctx, '来不及：借力挡', 600, 402, {
        color: C.blue,
        textColor: C.paper,
        border: C.blue,
        size: 12,
        weight: 800,
      });
      ctx.restore();
    }
    ctx.restore();
  }

  registrationMark(ctx, 922, 84, C.ink, 5);
  if (t > 19.55) {
    const p = easeInOut((t - 19.55) / 0.45);
    rect(ctx, 0, 64, W * p, 404, C.red);
  }
}
