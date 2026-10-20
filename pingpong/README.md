# 旋转的语言

120 秒代码渲染科普片：**《旋转的语言：两分钟看懂乒乓球旋转》**。

这是一个**完全独立**的子项目：自带 `package.json`、依赖、渲染脚本、音频与输出目录，不与仓库根目录的 AI 芯片短片共用代码。

## 当前状态

- 独立渲染管线已跑通：Canvas → Playwright 截帧 → FFmpeg 编码。
- 视觉系统正在从「像素风」切换为新的方向（见 `docs/style.md`）。
- 剧本文本见 `docs/script.md`，分镜与时间轴随后更新。

## 制作方式

```powershell
cd pingpong
npm install
node render/stills.mjs --times 0,10,30,60,90,115 --scale 1
node render/capture.mjs 120 30
node render/encode.mjs
node render/srt.mjs
node render/qa.mjs
```

- 逻辑画布与帧率在 `src/main.js` / `src/timeline.js`。
- 所有画面只依赖时间 `t`，不依赖计时器、CSS 动画或未设种子的随机数。
- 中文字幕与屏字由 `src/timeline.js` 统一管理。

## 目录

```
pingpong/
  src/        动画源码
  render/     截帧、编码、字幕、QA
  audio/      程序化音频（待实现）
  docs/       脚本、分镜、风格说明
  preview/    预览图与样片
  out/        中间帧与成片（git 忽略）
```
