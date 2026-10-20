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
  ball,
  spinArc,
  dashedLine,
  curveArrow,
  bezier,
  arrow,
  circle,
  ring,
  ellipse,
  bigNumber,
  stamp,
  registrationMark,
  clamp,
  lerp,
  easeOut,
  easeInOut,
  FONT_MONO,
} from '../draw.js';

const INK = [C.red, C.blue, C.green];
const NAMES = [
  { cn: '上旋', en: 'TOPSPIN', desc: '球往前滚，弧线更早下坠' },
  { cn: '下旋', en: 'BACKSPIN', desc: '球往后滚，弧线会“飘”' },
  { cn: '侧旋', en: 'SIDESPIN', desc: '绕竖轴转，落点往旁边拐' },
];

function fade(t, a, b, d = 0.35) {
  return Math.min(clamp((t - a) / d), clamp((b - t) / d));
}

function card(ctx, x, y, w, h, i, local, delay) {
  const p = easeOut(clamp((local - delay) / 0.55));
  const color = INK[i];
  ctx.save();
  ctx.globalAlpha = p;
  ctx.translate(0, (1 - p) * 46);
  panel(ctx, x, y, w, h, { fill: C.paper, border: color, shadow: color, offset: 7, width: 3 });
  rect(ctx, x, y, w, 8, color);
  text(ctx, `0${i + 1}`, x + 18, y + 22, {
    size: 12,
    weight: 800,
    color,
    font: FONT_MONO,
    letterSpacing: 1.4,
  });
  text(ctx, NAMES[i].cn, x + 48, y + 14, { size: 32, weight: 800, color: C.ink });
  text(ctx, NAMES[i].en, x + 50, y + 51, {
    size: 11,
    weight: 800,
    color: C.ink3,
    letterSpacing: 2,
  });

  const cx = x + w / 2;
  const cy = y + 128;
  const r = 47;
  if (i === 2) {
    // Vertical axis: dotted line through the poles.
    dashedLine(ctx, cx, cy - r - 25, cx, cy + r + 25, color, { dash: 5, gap: 5, width: 2 });
    ball(ctx, cx, cy, r, { angle: local * 3.6, axis: [0, 1, 0], logo: color });
    spinArc(ctx, cx, cy, r + 12, -0.2, 2.6, color, { width: 3, head: 11 });
  } else {
    // Horizontal axis into the page, shown as a dashed line.
    dashedLine(ctx, cx - r - 22, cy, cx + r + 22, cy, color, { dash: 5, gap: 5, width: 2 });
    ball(ctx, cx, cy, r, {
      angle: (i === 0 ? 1 : -1) * local * 3.6,
      axis: [0, 0, 1],
      logo: color,
    });
    if (i === 0) {
      curveArrow(ctx, [cx - 34, cy - r - 18], [cx, cy - r - 42], [cx + 34, cy - r - 18], color, {
        width: 3,
        head: 10,
      });
    } else {
      curveArrow(ctx, [cx + 34, cy + r + 18], [cx, cy + r + 42], [cx - 34, cy + r + 18], color, {
        width: 3,
        head: 10,
      });
    }
  }

  // Mini trajectory.
  const by = y + h - 58;
  if (i === 0) {
    curveArrow(ctx, [x + 26, by], [x + w / 2, by - 34], [x + w - 24, by + 6], color, {
      width: 2.5,
      head: 9,
    });
  } else if (i === 1) {
    curveArrow(ctx, [x + 26, by + 6], [x + w / 2, by - 26], [x + w - 24, by - 20], color, {
      width: 2.5,
      head: 9,
    });
  } else {
    rect(ctx, x + 26, by - 18, w - 52, 36, C.green2);
    dashedLine(ctx, x + w / 2, by - 18, x + w / 2, by + 18, C.paper, { dash: 4, gap: 4, width: 1 });
    curveArrow(ctx, [x + 26, by + 8], [x + w / 2, by - 12], [x + w - 24, by - 4], color, {
      width: 2.5,
      head: 9,
    });
  }
  text(ctx, NAMES[i].desc, x + 22, y + h - 30, { size: 14, weight: 600, color: C.ink2 });
  ctx.restore();
}

export function draw(ctx, t) {
  fill(ctx, C.paper);
  grid(ctx, 0, 64, W, 404, { step: 40, alpha: 0.045 });
  halftone(ctx, 640, 64, 320, 404, C.blue, { size: 8, radius: 1.5, alpha: 0.09 });
  rect(ctx, 0, 64, 7, 404, C.blue);

  // Phase A: big ball and definition.
  const aA = fade(t, 0, 4.5);
  if (aA > 0) {
    ctx.save();
    ctx.globalAlpha = aA;
    text(ctx, '02 / THE AXIS', 44, 82, {
      size: 12,
      weight: 800,
      color: C.blue,
      letterSpacing: 2.2,
    });
    misprintText(ctx, '一根轴', 42, 100, {
      size: 66,
      weight: 800,
      color: C.ink,
      shadow: C.blue,
      offset: 4,
    });
    text(ctx, '所有旋转，都绕着它发生。', 44, 178, { size: 24, weight: 700, color: C.ink });
    lineH(ctx, 46, 216, 260, C.ink, 3);

    const cx = 300;
    const cy = 338;
    const r = 94;
    dashedLine(ctx, cx - 140, cy + 72, cx + 140, cy - 72, C.ink, { dash: 8, gap: 6, width: 2 });
    ball(ctx, cx, cy, r, {
      angle: t * 2.2,
      axis: [0.55, 0.83, 0],
      face: C.paper,
      line: C.ink,
      logo: C.red,
      width: 4,
    });
    spinArc(ctx, cx, cy, r + 25, -2.45, 0.55, C.red, { width: 5, head: 16 });
    text(ctx, '轴', cx + 152, cy - 84, { size: 20, weight: 800, color: C.blue });
    text(ctx, 'AXIS', cx + 146, cy - 60, {
      size: 10,
      weight: 800,
      color: C.ink3,
      letterSpacing: 2,
    });
    text(ctx, '自转', cx + 120, cy + 72, { size: 20, weight: 800, color: C.red });
    text(ctx, 'ROTATION', cx + 114, cy + 96, {
      size: 10,
      weight: 800,
      color: C.ink3,
      letterSpacing: 1.6,
    });

    const rows = [
      ['一根轴', 'ONE AXIS'],
      ['两个旋转方向', 'TWO DIRECTIONS'],
      ['无数种轴角度', 'INFINITE AXES'],
    ];
    rows.forEach(([cn, en], i) => {
      const y = 292 + i * 40;
      rect(ctx, 456, y + 4, 9, 9, i === 0 ? C.red : i === 1 ? C.blue : C.green);
      text(ctx, cn, 476, y, { size: 18, weight: 700, color: C.ink });
      text(ctx, en, 640, y + 3, { size: 10, weight: 700, color: C.ink3, letterSpacing: 1.4 });
    });
    ctx.restore();
  }

  // Phase B: three cards.
  const aB = fade(t, 4.0, 8.6);
  if (aB > 0) {
    ctx.save();
    ctx.globalAlpha = aB;
    text(ctx, 'THREE NAMES / 三种名字', 44, 78, {
      size: 12,
      weight: 800,
      color: C.ink2,
      letterSpacing: 2.2,
    });
    card(ctx, 44, 112, 278, 330, 0, t, 4.15);
    card(ctx, 342, 112, 278, 330, 1, t, 4.35);
    card(ctx, 640, 112, 278, 330, 2, t, 4.55);
    ctx.restore();
  }

  // Phase C: RPM meter.
  const aC = fade(t, 8.2, 12.0);
  if (aC > 0) {
    ctx.save();
    ctx.globalAlpha = aC;
    text(ctx, '03 / REVOLUTIONS', 44, 82, {
      size: 12,
      weight: 800,
      color: C.ink2,
      letterSpacing: 2.2,
    });
    text(ctx, '每秒，转多少次？', 44, 108, { size: 40, weight: 800, color: C.ink });

    const rpm = Math.round(120 * easeOut(clamp((t - 8.15) / 1.3)));
    rect(ctx, 44, 178, 330, 190, C.yellow);
    bigNumber(ctx, rpm, 70, 178, { size: 150, color: C.ink, shadow: C.red, weight: 800 });
    text(ctx, 'REV / SEC', 74, 332, {
      size: 16,
      weight: 800,
      color: C.ink,
      letterSpacing: 3,
    });
    text(ctx, '≈ ' + rpm * 60 + ' RPM', 74, 356, { size: 20, weight: 700, color: C.ink2 });

    const bx = 430;
    const by = 236;
    const bw = 460;
    rect(ctx, bx, by, bw, 34, C.paper2);
    ctx.save();
    ctx.strokeStyle = C.ink;
    ctx.lineWidth = 2;
    ctx.strokeRect(bx, by, bw, 34);
    ctx.restore();
    rect(ctx, bx, by, bw * clamp(rpm / 150), 34, C.red);
    for (let i = 0; i <= 15; i++) {
      const x = bx + (bw * i) / 15;
      lineV(ctx, x, by + 34, i % 5 === 0 ? 12 : 6, C.ink, i % 5 === 0 ? 2 : 1);
    }
    text(ctx, '0', bx, by + 44, { size: 12, weight: 700, color: C.ink3, font: FONT_MONO });
    text(ctx, '150', bx + bw, by + 44, {
      size: 12,
      weight: 700,
      color: C.ink3,
      align: 'right',
      font: FONT_MONO,
    });
    text(ctx, '顶尖选手的强上旋', bx, by + 74, { size: 22, weight: 700, color: C.ink });
    text(ctx, '不是每一板；发球约 40–60 转/秒', bx, by + 102, {
      size: 13,
      weight: 600,
      color: C.ink2,
    });
    text(ctx, 'HIGH-SPEED CAMERA / SLOW MOTION', bx, by + 126, {
      size: 10,
      weight: 800,
      color: C.ink3,
      letterSpacing: 1.8,
    });

    // A ball with a motion-blur halo.
    const hx = 790;
    const hy = 168;
    for (let i = 3; i >= 1; i--) {
      ctx.save();
      ctx.globalAlpha = 0.12 * i;
      ring(ctx, hx, hy, 24 + i * 8, C.red, 3);
      ctx.restore();
    }
    ball(ctx, hx, hy, 24, { angle: t * 5, axis: [0, 1, 0], logo: C.red });
    spinArc(ctx, hx, hy, 34, -0.4, 2.4, C.red, { width: 2.5, head: 8 });
    ctx.restore();
  }

  // Phase D: recap.
  const aD = fade(t, 11.8, 14);
  if (aD > 0) {
    ctx.save();
    ctx.globalAlpha = aD;
    text(ctx, '重力画弧，旋转改写它。', 44, 100, { size: 34, weight: 800, color: C.ink });
    panel(ctx, 96, 148, 768, 286, {
      fill: C.paper,
      border: C.ink,
      shadow: C.blue,
      offset: 7,
      width: 3,
    });
    grid(ctx, 96, 148, 768, 286, { step: 32, alpha: 0.05 });

    // Gravity-only reference.
    bezier(ctx, [140, 356], [320, 196], [640, 196], [820, 356], C.ink2, {
      width: 3,
      dashed: true,
      dash: 9,
      gap: 7,
    });
    text(ctx, '无旋 / 只有重力', 560, 176, {
      size: 12,
      weight: 700,
      color: C.ink2,
      align: 'right',
    });

    // Topspin dips below the reference.
    bezier(ctx, [140, 356], [320, 240], [640, 268], [820, 404], C.red, { width: 4 });
    text(ctx, '上旋：更早下坠', 650, 390, { size: 14, weight: 800, color: C.red });

    // Backspin floats above it.
    bezier(ctx, [140, 356], [320, 170], [640, 176], [820, 300], C.blue, { width: 4 });
    rect(ctx, 646, 244, 128, 24, C.paper);
    text(ctx, '下旋：落得更慢', 652, 248, { size: 14, weight: 800, color: C.blue });

    // Gravity arrow and axes.
    arrow(ctx, 164, 190, 164, 258, C.ink, { width: 3, head: 11 });
    text(ctx, 'g', 176, 216, { size: 20, weight: 800, color: C.ink, font: FONT_MONO });
    text(ctx, 'DISTANCE →', 760, 412, {
      size: 10,
      weight: 800,
      color: C.ink3,
      align: 'right',
      letterSpacing: 2,
    });
    text(ctx, 'HEIGHT ↑', 114, 170, {
      size: 10,
      weight: 800,
      color: C.ink3,
      letterSpacing: 1.8,
    });
    ball(ctx, 140, 356, 16, { angle: t * 5, axis: [0, 0, 1], logo: C.red, width: 2 });
    ball(ctx, 820, 404, 16, { angle: t * 5, axis: [0, 0, 1], logo: C.red, width: 2 });
    ball(ctx, 820, 300, 16, { angle: -t * 5, axis: [0, 0, 1], logo: C.blue, width: 2 });
    text(ctx, '实战中，三种旋转常叠在一起。', 96, 450, {
      size: 12,
      weight: 600,
      color: C.ink2,
    });
    ctx.restore();
  }

  registrationMark(ctx, 922, 84, C.ink, 5);
  if (t > 13.55) {
    const p = easeInOut((t - 13.55) / 0.45);
    rect(ctx, 0, 64, W * p, 404, C.blue);
  }
}
