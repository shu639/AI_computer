# AI_computer

用代码逐帧绘制画面的像素风科普短片。Playwright 截帧，FFmpeg 编码为 1920×1080 / 30fps / H.264。

## 作品

| 作品 | 时长 | 状态 | 入口 |
|---|---|---|---|
| 《AI 回答你之前，芯片里发生了什么？》 | 60 秒 | 完成 | 本目录 |
| 《旋转的语言：两分钟看懂乒乓球旋转》 | 120 秒 | 制作中 | [`pingpong/`](pingpong/)（独立子项目，自带依赖与渲染管线） |

---

## AI 芯片篇（60 秒）

## 当前进度

- **Phase 0 完成**：320×180 逻辑画布、Sweetie 16 色、Fusion Pixel 12px 中文像素字体、Playwright 截帧、FFmpeg 编码链路全部跑通。
- **Phase 1 完成**：8 秒样片（开场聊天 → 像素下潜 → 内存长廊），`preview/sample-8s.mp4`。
- **Phase 2 完成**：60 秒全片，七个场景（发送/下潜/取指/译码/执行/写回/回答），**音效为主、BGM 默认关闭**，1920×1080 H.264 + AAC 48kHz，响度约 -16 LUFS。
- 需要连续芯片音乐时：`$env:BGM='1'; node audio/synth.mjs`，再重新编码。
- 全片：`preview/ai-chip-60s.mp4`；海报：`preview/poster.png`；联系表：`preview/contact-sheet.png`。
- 字幕：`docs/subtitles.srt`。
- 制作原理与复用方法：[`docs/how-it-was-made.md`](docs/how-it-was-made.md)。

## 技术栈

| 环节 | 工具 |
|---|---|
| 动画 | 原生 Canvas 2D，`window.render(t)` 纯时间函数 |
| 截帧 | `playwright-core` + 本机 Chrome / 缓存 Chromium |
| 编码 | `@ffmpeg-installer/ffmpeg`（H.264 / libx264） |
| 字体 | Fusion Pixel 12px Monospaced SC（OFL-1.1） |
| 色板 | Sweetie 16（16 色，全片锁死） |
| 音乐 | 程序化芯片音乐（待实现） |

## 目录

```
src/                  动画源码（320×180）
  index.html
  main.js             window.DURATION / FPS / render(t)
  palette.js          Sweetie 16 + 每帧色板量化
  draw.js             矩形/文字/面板/精灵/抖动
render/
  capture.mjs         Playwright 逐帧截图
  encode.mjs          FFmpeg 合成 MP4
docs/
  script.md           60 秒屏字脚本
  storyboard.md       分镜表
preview/              阶段性预览产物
```

## 构建

```powershell
npm install
node render/capture.mjs 2 30          # 截 2 秒（帧写入 out/frames）
node render/encode.mjs --dir out/frames --out out/test.mp4
```

`render/encode.mjs` 会优先使用系统 ffmpeg、winget 安装的 ffmpeg，最后回退到 `node_modules/@ffmpeg-installer/.../ffmpeg.exe`。

## 规范

- 逻辑分辨率 320×180，×6 最近邻放大到 1920×1080。
- 每帧绘制完成后量化到 Sweetie 16，颜色数 ≤16。
- 中文字体只用 12/24/36/48px 整数倍字号。
- 动画只依赖 `t`，禁止 CSS 动画、计时器、未设种子的随机数。
- 角色与场景全部代码绘制，不依赖外部图片。
