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

// Draft cue list. Timings are tuned after the research pass.
export const SUBTITLES = [
  { start: 0.4, end: 2.4, text: '这一球，看起来会拐弯。', cps: 12 },
  { start: 2.6, end: 4.4, text: '它没有长翅膀。', cps: 12 },
  { start: 4.6, end: 6.8, text: '是旋转，悄悄改了它的路线。', cps: 12 },
  { start: 7.0, end: 7.9, text: '旋转，是乒乓球的第二语言。', cps: 12 },
  { start: 8.6, end: 11.2, text: '旋转，就是球绕着一根轴，自己转。', cps: 12 },
  { start: 11.4, end: 13.6, text: '轴的方向，决定旋转的名字。', cps: 12 },
  { start: 13.8, end: 16.2, text: '上旋、下旋、侧旋。', cps: 12 },
  { start: 16.4, end: 18.2, text: '职业选手的球，每秒能转一百多次。', cps: 12 },
  { start: 18.4, end: 21.8, text: '你看到的弧线，是它转出来的。', cps: 12 },
  { start: 22.6, end: 24.8, text: '旋转不是天生的，是球拍“刷”出来的。', cps: 12 },
  { start: 25.0, end: 27.4, text: '拍面正撞球心，球主要往前飞。', cps: 12 },
  { start: 27.6, end: 30.0, text: '拍面擦过球的边缘，力就有了力臂。', cps: 12 },
  { start: 30.2, end: 32.8, text: '胶皮咬住球，把切向的力变成转动。', cps: 12 },
  { start: 33.0, end: 35.6, text: '往上刷，上旋；往下切，下旋。', cps: 12 },
  { start: 35.8, end: 38.2, text: '同样的力量，摩擦越多，旋转越强。', cps: 12 },
  { start: 38.4, end: 41.8, text: '所以高手击球，声音很轻，转速很高。', cps: 12 },
  { start: 42.6, end: 45.0, text: '球飞出去，空气也在参与。', cps: 12 },
  { start: 45.2, end: 47.6, text: '球表面带着一层空气一起转。', cps: 12 },
  { start: 47.8, end: 50.4, text: '一侧空气被加速，一侧被拖慢。', cps: 12 },
  { start: 50.6, end: 53.0, text: '压力差，把球往侧面推。', cps: 12 },
  { start: 53.2, end: 55.6, text: '这个力，永远垂直于旋转轴和飞行方向。', cps: 12 },
  { start: 55.8, end: 58.4, text: '上旋被往下压，弧线更早下坠。', cps: 12 },
  { start: 58.6, end: 61.2, text: '下旋被往上托，球会“飘”。', cps: 12 },
  { start: 61.4, end: 63.8, text: '侧旋，就在空中画出一道弧。', cps: 12 },
  { start: 64.6, end: 67.0, text: '旋转真正发脾气，是在落台的一瞬间。', cps: 12 },
  { start: 67.2, end: 69.6, text: '球和台面，也在互相摩擦。', cps: 12 },
  { start: 69.8, end: 72.2, text: '上旋球的底部，正往后“刨”。', cps: 12 },
  { start: 72.4, end: 74.8, text: '台面把它往前推，第二跳更冲、更低。', cps: 12 },
  { start: 75.0, end: 77.4, text: '下旋球相反：它会被台面“刹车”。', cps: 12 },
  { start: 77.6, end: 80.0, text: '转速掉下来，球可能往回走。', cps: 12 },
  { start: 80.2, end: 82.4, text: '侧旋落台，会突然往旁边拐。', cps: 12 },
  { start: 82.6, end: 83.9, text: '同一张台，三种脾气。', cps: 12 },
  { start: 84.6, end: 87.0, text: '那怎么接？先学会看。', cps: 12 },
  { start: 87.2, end: 89.6, text: '看对手的拍：从哪儿起，往哪儿挥。', cps: 12 },
  { start: 89.8, end: 92.2, text: '看他摩擦的是球的哪一侧。', cps: 12 },
  { start: 92.4, end: 94.8, text: '再看球的标志，转起来是一条模糊的环。', cps: 12 },
  { start: 95.0, end: 97.4, text: '接上旋，拍面压一点，往前送。', cps: 12 },
  { start: 97.6, end: 100.0, text: '接下旋，拍面亮一点，往上兜。', cps: 12 },
  { start: 100.2, end: 102.4, text: '别只是“碰”球，要让胶皮再咬一口。', cps: 12 },
  { start: 102.6, end: 103.9, text: '你怎么转它，它就怎么回来。', cps: 12 },
  { start: 104.6, end: 107.4, text: '旋转，是力没有穿过球心。', cps: 12 },
  { start: 107.6, end: 110.4, text: '摩擦给它方向，空气放大它的弧线。', cps: 12 },
  { start: 110.6, end: 113.4, text: '台面，再把它变成一次变向。', cps: 12 },
  { start: 113.6, end: 116.6, text: '看懂旋转，你就看懂了乒乓球的另一半。', cps: 12 },
  { start: 116.8, end: 119.6, text: '下一次，先看拍，再看球。', cps: 12 },
];

export const ALL_TEXT =
  SUBTITLES.map((s) => s.text).join('') +
  '拐弯一根轴摩擦空气落台读拍收束旋转的语言乒乓球入门上旋下旋侧旋' +
  '马格努斯效应压力差速度力矩胶皮球拍台面第一跳第二跳转速' +
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ%+×·：，。！？（）“”/';
