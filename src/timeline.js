export const DURATION = 60;
export const FPS = 30;

export const CHAPTERS = [
  { start: 0, end: 4, label: '01 / 发送' },
  { start: 4, end: 10, label: '02 / 下潜' },
  { start: 10, end: 20, label: '03 / 取指' },
  { start: 20, end: 30, label: '04 / 译码' },
  { start: 30, end: 42, label: '05 / 执行' },
  { start: 42, end: 52, label: '06 / 写回' },
  { start: 52, end: 60, label: '07 / 回答' },
];

export const SUBTITLES = [
  { start: 0.3, end: 2.2, text: '你按下发送键。', cps: 10 },
  { start: 2.4, end: 3.9, text: '0.3 秒后，回答出现了。', cps: 12 },
  { start: 4.4, end: 9.6, text: '0.3 秒里，芯片跑了数十亿次开关。', cps: 12 },
  { start: 10.2, end: 13.5, text: '第一步：取指令。', cps: 10 },
  { start: 13.5, end: 19.8, text: '从内存 0x2A 取出 LOAD。', cps: 12 },
  { start: 20.2, end: 23.5, text: '第二步：译码。', cps: 10 },
  { start: 23.5, end: 29.8, text: '拆成：做什么 + 对谁做。', cps: 12 },
  { start: 30.2, end: 33.5, text: '第三步：执行。', cps: 10 },
  { start: 33.5, end: 41.8, text: '两个数进入 ALU。', cps: 12 },
  { start: 42.2, end: 45.5, text: '第四步：写回。', cps: 10 },
  { start: 45.5, end: 51.8, text: '结果回到内存，回答亮起。', cps: 12 },
  { start: 52.4, end: 57.6, text: '每一次回答，都是几十亿次这样的奔跑。', cps: 12 },
  { start: 57.6, end: 60.0, text: '下集：GPU 为什么能同时做一万件事？', cps: 14 },
];

export const ALL_TEXT =
  '你按下发送键。0.3 秒后，回答出现了。0.3 秒里，芯片跑了数十亿次开关。' +
  '第一步：取指令。从内存 0x2A 取出 LOAD。第二步：译码。拆成：做什么 + 对谁做。' +
  '第三步：执行。两个数进入 ALU。第四步：写回。结果回到内存，回答亮起。' +
  '每一次回答，都是几十亿次这样的奔跑。下集：GPU 为什么能同时做一万件事？' +
  '你好，AI正在思考发送你好！有什么可以帮你？BITR1R2CUXORANDOR' +
  '0123456789ABCDEF';
