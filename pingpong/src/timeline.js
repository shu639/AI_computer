export const DURATION = 120;
export const FPS = 30;

export const CHAPTERS = [
  { start: 0, end: 8, label: '01 / 拐弯' },
  { start: 8, end: 22, label: '02 / 一根轴' },
  { start: 22, end: 42, label: '03 / 摩擦' },
  { start: 42, end: 64, label: '04 / 空气' },
  { start: 64, end: 84, label: '05 / 落台' },
  { start: 84, end: 104, label: '06 / 读拍' },
  { start: 104, end: 120, label: '07 / 收束' },
];

// 47 cues: 1.8s title card + 45 body lines + 3.2s end card.
// Body lines are 4.0-5.0 characters per second at 30px; max 19 characters.
export const SUBTITLES = [
  { start: 0, end: 1.8, text: '旋转的语言', kind: 'title' },
  { start: 2.0, end: 4.0, text: '这一球，看起来会拐弯。' },
  { start: 4.2, end: 5.6, text: '它没有长翅膀。' },
  { start: 5.8, end: 7.8, text: '是旋转，改了它的路线。' },
  { start: 8.0, end: 10.4, text: '旋转，是乒乓球的第二语言。' },
  { start: 10.6, end: 12.6, text: '旋转，就是球绕轴自转。' },
  { start: 12.8, end: 15.0, text: '轴和转向，决定旋转的名字。' },
  { start: 15.2, end: 17.2, text: '常见三种：上旋、下旋、侧旋。' },
  { start: 17.4, end: 19.8, text: '顶尖强上旋，每秒可超一百转。' },
  { start: 20.0, end: 21.9, text: '重力画弧，旋转改写它。' },
  { start: 22.2, end: 24.8, text: '旋转不是天生，是球拍刷出来的。' },
  { start: 25.0, end: 27.4, text: '拍面正撞球心，球主要前飞。' },
  { start: 27.6, end: 30.0, text: '擦得偏一点，力就偏离球心。' },
  { start: 30.2, end: 32.6, text: '胶皮咬住球，摩擦带它转。' },
  { start: 32.8, end: 35.4, text: '从球后往上刷，上旋；往下切，下旋。' },
  { start: 35.6, end: 38.2, text: '要更转：先咬住，再分力给摩擦。' },
  { start: 38.4, end: 40.8, text: '蹭得太薄，容易打滑；先咬住球。' },
  { start: 42.2, end: 44.4, text: '球飞出去，空气也在参与。' },
  { start: 45.0, end: 47.4, text: '贴球的空气，被带着一起转。' },
  { start: 47.6, end: 50.2, text: '一侧空气加速，一侧被拖慢。' },
  { start: 50.4, end: 52.8, text: '压力差，把球推向低压侧。' },
  { start: 53.0, end: 55.8, text: '马格努斯力，垂直于轴和飞行方向。' },
  { start: 56.0, end: 58.4, text: '上旋，被空气往下压，更早下坠。' },
  { start: 58.6, end: 61.0, text: '下旋，被空气往上托，落得更慢。' },
  { start: 61.2, end: 63.8, text: '侧旋，让球在空中向侧面弯。' },
  { start: 64.6, end: 67.0, text: '旋转真正发脾气，是在落台。' },
  { start: 67.2, end: 69.4, text: '上旋球底，相对球心往后转。' },
  { start: 69.6, end: 72.2, text: '转得比前进快，台面才往前推。' },
  { start: 72.4, end: 74.8, text: '不够快，摩擦反而拖慢它。' },
  { start: 75.0, end: 77.4, text: '下旋球底往前滑，台面往后刹。' },
  { start: 77.6, end: 80.0, text: '强下旋，才可能真的回跳。' },
  { start: 80.2, end: 82.2, text: '纯侧旋落台，只轻轻侧跳。' },
  { start: 82.3, end: 83.9, text: '同一张台，三种脾气。' },
  { start: 84.4, end: 86.4, text: '那怎么接？先学会看。' },
  { start: 86.6, end: 89.0, text: '先看拍面，再看触球那一下。' },
  { start: 89.2, end: 91.4, text: '看他摩擦球的哪一侧。' },
  { start: 91.6, end: 94.0, text: '球标糊成环，只说明转得快。' },
  { start: 94.2, end: 96.6, text: '接上旋：压拍，打中上部，前送。' },
  { start: 96.8, end: 99.4, text: '接下旋：亮拍，摩擦中下部，向前上。' },
  { start: 99.6, end: 101.6, text: '能咬就咬；来不及，借力挡。' },
  { start: 101.8, end: 103.8, text: '旋转会延续，也会被改写。' },
  { start: 104.4, end: 106.6, text: '旋转，是力没有穿过球心。' },
  { start: 106.8, end: 109.2, text: '摩擦给方向，空气把弧线吹弯。' },
  { start: 109.4, end: 111.8, text: '落台，再改写它的方向和速度。' },
  { start: 112.0, end: 114.6, text: '看懂旋转，就看懂乒乓的另一半。' },
  { start: 114.8, end: 116.8, text: '下一次，先看拍，再看球。' },
  { start: 116.8, end: 120.0, text: '旋转的语言', kind: 'title' },
];

export const ALL_TEXT =
  SUBTITLES.map((s) => s.text).join('') +
  '拐弯一根轴摩擦空气落台读拍收束旋转的语言乒乓球入门上旋下旋侧旋' +
  '马格努斯效应压力差速度力矩胶皮球拍台面第一跳第二跳转速重力' +
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ%+×·：，。！？（）“”/–';
