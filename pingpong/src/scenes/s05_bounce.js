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
  ball,
  spinArc,
  dashedLine,
  curveArrow,
  bezier,
  arrow,
  circle,
  ring,
  ellipse,
  tableSide,
  netSide,
  courtTop,
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

function bubble(ctx, label, x, y, color) {
  const w = textWidth(ctx, label, 13, 800) + 18;
  rect(ctx, x, y, w, 24, color);
  text(ctx, label, x + 9, y + 5, { size: 13, weight: 800, color: C.paper });
}

function bar(ctx, x, y, w, label, value, color, max = 1) {
  text(ctx, label, x, y - 18, { size: 11, weight: 800, color: C.ink2, letterSpacing: 1.4 });
  rect(ctx, x, y, w, 14, C.paper2);
  ctx.save();
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x, y, w, 14);
  ctx.restore();
  rect(ctx, x, y, w * clamp(value / max), 14, color);
}

function magnifier(ctx, x, y, r, opts = {}) {
  const { color = C.red, frictionRight = true, bottom = 'back', label = '' } = opts;
  ctx.save();
  circle(ctx, x, y, r, C.paper);
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.clip();
  // Table surface.
  rect(ctx, x - r, y + r * 0.22, r * 2, r, C.green);
  lineH(ctx, x - r, y + r * 0.22, r * 2, C.paper, 3);
  // Ball underside.
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y - r * 0.25, r * 0.72, 0, Math.PI * 2);
  ctx.clip();
  ball(ctx, x, y - r * 0.25, r * 0.72, { angle: 0, axis: [0, 0, 1], logo: color, width: 3 });
  ctx.restore();
  ring(ctx, x, y - r * 0.25, r * 0.72, C.ink, 4);
  // Contact arrows.
  const cy = y + r * 0.24;
  arrow(ctx, x - r * 0.2, cy - 18, x + r * 0.55, cy - 18, color, { width: 3, head: 10 });
  text(ctx, bottom === 'back' ? '球底相对球心：后滑' : '球底相对球心：前滑', x - r * 0.2, cy - 42, {
    size: 11,
    weight: 800,
    color,
  });
  arrow(
    ctx,
    frictionRight ? x - r * 0.1 : x + r * 0.5,
    cy + 10,
    frictionRight ? x + r * 0.6 : x - r * 0.2,
    cy + 10,
    C.yellow,
    { width: 4, head: 12 }
  );
  text(ctx, frictionRight ? '台面摩擦：向前' : '台面摩擦：向后', x - r * 0.2, cy + 28, {
    size: 11,
    weight: 800,
    color: C.ink,
  });
  ctx.restore();
  ring(ctx, x, y, r, C.ink, 4);
  if (label) {
    const w = textWidth(ctx, label, 11, 800) + 16;
    rect(ctx, x - w / 2, y + r - 18, w, 22, C.ink);
    text(ctx, label, x, y + r - 14, { size: 11, weight: 800, color: C.paper, align: 'center' });
  }
  ctx.restore();
}

function sideScene(ctx, opts = {}) {
  const { color = C.red, incoming = true, kick = true, back = false } = opts;
  tableSide(ctx, 50, 380, 560, 14);
  netSide(ctx, 570, 310, 394);
  // Incoming arc.
  bezier(ctx, [245, 252], [300, 296], [370, 350], [430, 380], color, { width: 4 });
  // Reference and outcomes.
  dashedLine(ctx, 430, 380, 610, 300, C.ink2, { width: 2, dash: 7, gap: 6 });
  if (!back) {
    if (kick) {
      bezier(ctx, [430, 380], [520, 330], [580, 300], [650, 330], color, { width: 4 });
    } else {
      bezier(ctx, [430, 380], [520, 300], [580, 300], [650, 290], C.ink2, {
        width: 3,
        dashed: true,
      });
    }
  } else {
    bezier(ctx, [430, 380], [520, 280], [590, 250], [660, 280], color, { width: 4 });
  }
  ball(ctx, 250, 264, 36, { angle: 3, axis: [0, 0, 1], logo: color, width: 3 });
  text(ctx, '第一跳', 440, 404, { size: 11, weight: 800, color: C.ink2, letterSpacing: 1.4 });
}

export function draw(ctx, t) {
  fill(ctx, C.paper);
  grid(ctx, 0, 64, W, 404, { step: 40, alpha: 0.045 });
  halftone(ctx, 0, 64, 320, 404, C.green, { size: 8, radius: 1.5, alpha: 0.08 });
  rect(ctx, 0, 64, 7, 404, C.green);

  // --- Phase A: the moment of contact ---------------------------------------
  const aA = fade(t, 0, 3.2);
  if (aA > 0) {
    ctx.save();
    ctx.globalAlpha = aA;
    text(ctx, '05 / THE BOUNCE', 44, 80, {
      size: 12,
      weight: 800,
      color: C.green,
      letterSpacing: 2.2,
    });
    text(ctx, '落台', 42, 104, { size: 58, weight: 800, color: C.ink });
    text(ctx, 'THE MOMENT OF TRUTH', 44, 174, {
      size: 11,
      weight: 800,
      color: C.ink3,
      letterSpacing: 2.2,
    });
    text(ctx, '旋转在飞行中一直在工作；落台，是最明显的一次改写。', 44, 202, {
      size: 18,
      weight: 600,
      color: C.ink2,
    });
    sideScene(ctx, { color: C.red, kick: true });
    // Impact flash.
    if (t > 1.8) {
      const p = clamp((t - 1.8) / 0.4);
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        const r0 = 10;
        const r1 = 14 + p * 30;
        lineH(ctx, 430 + Math.cos(a) * r0, 380 + Math.sin(a) * r0, 1, C.yellow, 2);
        circle(ctx, 430 + Math.cos(a) * r1, 380 + Math.sin(a) * r1, 3, C.yellow);
      }
    }
    magnifier(ctx, 780, 190, 92, { color: C.red, frictionRight: true, label: '×0.01' });
    tag(ctx, '落台瞬间 / CONTACT', 44, 330, {
      color: C.yellow,
      textColor: C.ink,
      border: C.ink,
      size: 13,
      weight: 800,
    });
    ctx.restore();
  }

  // --- Phase B: topspin, and the omegaR vs vx condition ----------------------
  const aB = fade(t, 3.0, 11.2);
  if (aB > 0) {
    ctx.save();
    ctx.globalAlpha = aB;
    text(ctx, '06 / TOPSPIN BOUNCE', 44, 78, {
      size: 12,
      weight: 800,
      color: C.red,
      letterSpacing: 2.2,
    });
    text(ctx, '上旋落台：先看谁更快。', 44, 100, { size: 30, weight: 800, color: C.ink });
    const forward = t > 5.6 && t < 8.3;
    sideScene(ctx, { color: C.red, kick: forward });
    magnifier(ctx, 780, 190, 92, {
      color: C.red,
      frictionRight: forward,
      label: forward ? 'ωR > vx' : 'vx > ωR',
    });

    // Condition bars.
    text(ctx, forward ? '转得比前进快' : '前进比转得快', 640, 300, {
      size: 16,
      weight: 800,
      color: forward ? C.red : C.ink2,
    });
    bar(ctx, 640, 352, 300, 'ωR / 表面速度', forward ? 0.86 : 0.35, C.red);
    bar(ctx, 640, 392, 300, 'vx / 前进速度', forward ? 0.45 : 0.8, C.blue);
    bubble(ctx, forward ? '台面往前推 → 球更冲' : '台面往后拖 → 球变慢', 640, 428, forward ? C.red : C.ink2);

    tag(ctx, '球底相对球心：向后转', 64, 286, {
      color: C.paper,
      textColor: C.red,
      border: C.red,
      size: 13,
      weight: 800,
    });
    ctx.restore();
  }

  // --- Phase C: backspin, ordinary vs strong ---------------------------------
  const aC = fade(t, 11.0, 16.4);
  if (aC > 0) {
    ctx.save();
    ctx.globalAlpha = aC;
    text(ctx, '07 / BACKSPIN BOUNCE', 44, 78, {
      size: 12,
      weight: 800,
      color: C.blue,
      letterSpacing: 2.2,
    });
    text(ctx, '下旋落台：被台面“刹车”。', 44, 100, { size: 30, weight: 800, color: C.ink });
    sideScene(ctx, { color: C.blue, back: true });
    magnifier(ctx, 780, 190, 92, {
      color: C.blue,
      frictionRight: false,
      label: '摩擦向后',
    });
    text(ctx, '球底相对球心：向前转', 640, 300, {
      size: 15,
      weight: 800,
      color: C.blue,
    });
    bar(ctx, 640, 352, 300, 'vx / 前进速度', 0.35, C.blue);
    text(ctx, '强下旋 + 足够摩擦：水平速度可能归零', 640, 392, {
      size: 12,
      weight: 600,
      color: C.ink2,
    });
    tag(ctx, '普通下旋：减速 / 冒高', 64, 286, {
      color: C.paper,
      textColor: C.blue,
      border: C.blue,
      size: 12,
      weight: 700,
    });
    // Return path for strong backspin.
    dashedLine(ctx, 430, 380, 300, 320, C.blue, { width: 3, dash: 7, gap: 5 });
    arrow(ctx, 360, 340, 300, 322, C.blue, { width: 3, head: 10 });
    text(ctx, '强下旋：可能回跳', 250, 300, { size: 13, weight: 800, color: C.blue });
    ctx.restore();
  }

  // --- Phase D: pure sidespin ------------------------------------------------
  const aD = fade(t, 16.0, 18.4);
  if (aD > 0) {
    ctx.save();
    ctx.globalAlpha = aD;
    text(ctx, '08 / SIDESPIN BOUNCE', 44, 78, {
      size: 12,
      weight: 800,
      color: C.green,
      letterSpacing: 2.2,
    });
    text(ctx, '纯侧旋落台，只轻轻侧跳。', 44, 100, { size: 30, weight: 800, color: C.ink });
    courtTop(ctx, 250, 138, 460, 240, { fill: C.green, line: C.paper });
    bezier(ctx, [270, 330], [400, 230], [560, 220], [650, 270], C.paper, { width: 7 });
    bezier(ctx, [270, 330], [400, 230], [560, 220], [650, 270], C.yellow, { width: 3 });
    ball(ctx, 650, 270, 18, { angle: t * 5, axis: [0, 1, 0], logo: C.green, width: 3 });
    arrow(ctx, 650, 270, 700, 280, C.yellow, { width: 3, head: 10 });
    text(ctx, '侧跳很小', 704, 266, { size: 13, weight: 800, color: C.yellow });
    tag(ctx, '突然横拐 = 轴倾斜 / 复合旋转', 250, 396, {
      color: C.paper,
      textColor: C.ink,
      border: C.green,
      size: 12,
      weight: 700,
    });
    ctx.restore();
  }

  // --- Phase E: three tempers ------------------------------------------------
  const aE = fade(t, 18.0, 20.0);
  if (aE > 0) {
    ctx.save();
    ctx.globalAlpha = aE;
    text(ctx, '同一张台，三种结果。', 44, 100, { size: 34, weight: 800, color: C.ink });
    const chips = [
      { x: 60, color: C.red, cn: '上旋', line: '前冲 / 或拖慢' },
      { x: 350, color: C.blue, cn: '下旋', line: '刹车 / 或回跳' },
      { x: 640, color: C.green, cn: '侧旋', line: '空中弯 / 轻跳' },
    ];
    chips.forEach((c) => {
      panel(ctx, c.x, 190, 260, 178, {
        fill: C.paper,
        border: c.color,
        shadow: c.color,
        offset: 6,
        width: 3,
      });
      rect(ctx, c.x, 190, 260, 8, c.color);
      text(ctx, c.cn, c.x + 20, 214, { size: 30, weight: 800, color: c.color });
      text(ctx, c.line, c.x + 20, 266, { size: 18, weight: 700, color: C.ink });
      text(ctx, 'BOUNCE LOGIC', c.x + 20, 304, {
        size: 9,
        weight: 800,
        color: C.ink3,
        letterSpacing: 1.8,
      });
    });
    ctx.restore();
  }

  registrationMark(ctx, 922, 84, C.ink, 5);
  if (t > 19.55) {
    const p = easeInOut((t - 19.55) / 0.45);
    rect(ctx, 0, 64, W * p, 404, C.green);
  }
}
