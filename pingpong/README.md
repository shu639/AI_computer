# 旋转的语言

120 秒代码渲染科普片：**《旋转的语言：两分钟看懂乒乓球旋转》**。

这是一个**完全独立**的子项目：自带 `package.json`、依赖、渲染脚本、音频与输出目录，不与仓库根目录的 AI 芯片短片共用代码。

## 成片

- 时长：120 秒
- 画幅：1920×1080 / 30fps / H.264
- 声音：程序化音效（无配音、无连续 BGM），AAC 48kHz
- 预览：[`preview/pingpong-spin-120s.mp4`](preview/pingpong-spin-120s.mp4)
- 海报：[`preview/poster.png`](preview/poster.png)
- 联系表：[`preview/contact-sheet.png`](preview/contact-sheet.png)
- 字幕：[`docs/subtitles.srt`](docs/subtitles.srt)

## 视觉

**RISO 孔版运动杂志**：纸色背景、五色套印、半调网点、胶带/撕纸/套准十字；中文标题用 Microsoft YaHei，数字用 Bahnschrift。

- 逻辑画布 960×540，Canvas 以 2× 渲染，输出 1920×1080。
- 不用像素网格，不做 16 色量化。
- 全片固定色义：朱红=上旋/力量，蓝=下旋/空气，绿=侧旋/球台，芥末黄=力线/高光。
- 所有运动只依赖时间 `t`，逐帧确定性渲染。

## 制作

```powershell
cd pingpong
npm install
npm run audio       # 生成 out/mix.wav（120 秒程序化音效）
npm run capture     # 3600 帧 -> out/frames（1920×1080）
npm run encode      # out/pingpong-spin-120s.mp4
npm run srt         # docs/subtitles.srt
npm run qa          # 帧数、时长、分辨率、帧率、音频检查
```

一次跑完：

```powershell
npm run build
```

局部预览：

```powershell
node render/stills.mjs --times 0,15,35,55,75,95,115 --scale 1
node render/capture.mjs 10 30 --scale 1 --start 30   # 从 30s 开始截 10s
```

## 结构

```
pingpong/
  src/
    main.js          window.render(t) 入口
    timeline.js      120 秒章节、47 条屏字
    palette.js       RISO 色板
    draw.js          圆/箭头/贝塞尔/网点/纸纹/球/拍/球台等图元
    hud.js           报头、章节、进度、字幕条
    scenes/          s01–s07 七个场景
  render/            Playwright 截帧、FFmpeg 编码、SRT、QA
  audio/synth.mjs    程序化音效
  docs/              脚本、分镜、视觉方向、字幕
  preview/           成片、海报、联系表、关键帧
  out/               中间帧与混音（git 忽略）
```

## 事实核查

脚本经过物理与教练实践核查，重点修正了：弧线主骨架是重力而不是旋转；“压力差往侧面推”只对侧旋成立；上旋落台是否前冲取决于 `ωR` 与 `v_x`；纯侧旋落台只轻侧跳；声音不能判断转速。详见 [`docs/script.md`](docs/script.md) 与 [`docs/storyboard.md`](docs/storyboard.md)。
