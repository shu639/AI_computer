# 这类视频是怎么做出来的

一句话：**Opus 5.5 不生成视频，它写代码；浏览器把代码逐帧画出来，FFmpeg 再把帧拼成 MP4。**

## 1. 爆款的生产链路

```
选题 / 脚本
  → 分镜 + 时间轴
  → Opus 5.5 写单页 Canvas / WebGL / Remotion 动画
  → 页面暴露 render(t)：每一帧只是时间 t 的函数
  → Playwright 无头浏览器按 30fps 逐帧截图
  → FFmpeg 合成 H.264 MP4
  → 程序化 BGM / 音效 / 字幕 / 响度归一
```

关键点不是「提示词写得多好」，而是**把视频当成一个确定性程序**：

- 同一 `t` 两次截图必须字节一致。
- 禁止 CSS animation、`setTimeout`、未设种子的随机数。
- 所有运动由 `t` 计算，镜头位移取整到像素。
- 像素风用低分辨率画布 + 整数倍最近邻放大，而不是把 1080p 压糊。

## 2. 为什么像素风特别适合代码

- 代码擅长几何、网格、精灵、UI、地图，像素画正好由这些组成。
- 像素风掩盖了 AI 在写实人脸、手部、毛发上的弱点。
- 16 色色板让每一帧都可以严格量化，跨镜头不偏色。
- 角色和场景可以用代码画，不需要生图模型，角色一致性 100%。
- 成本几乎为零：本片 1800 帧在本机 30 秒左右渲完。

## 3. 本片的工程参数

| 项目 | 参数 |
|---|---|
| 逻辑画布 | 320×180（16:9） |
| 放大 | ×6 最近邻 → 1920×1080 |
| 色板 | Sweetie 16，全片 ≤16 色 |
| 字体 | Fusion Pixel 12px Monospaced SC（OFL-1.1） |
| 时间轴 | 30fps |
| 精灵节奏 | 12fps 步进（每 2.5 帧换一次） |
| 截帧 | playwright-core + 本机 Chrome |
| 编码 | FFmpeg / libx264 / yuv420p / AAC 48kHz |
| 响度 | loudnorm ≈ -14 LUFS |
| 音频 | Node 程序化音效（BGM 可开关），无采样 |

### 确定性渲染

`src/main.js` 暴露：

```js
window.DURATION = 60;
window.FPS = 30;
window.render = (t) => {
  // 只依赖 t 选择场景、计算镜头、绘制
  drawHUD(ctx, t);
  quantize(ctx, 320, 180); // 每帧压回 Sweetie 16
};
```

`render/capture.mjs` 循环调用 `window.render(i / 30)`，用 Playwright 截图到 `out/frames/00001.png ...`。

### 色板量化

浏览器给文字加的抗锯齿、任何渐变，都会在每帧结束时被 `quantize()` 映射到最近的 Sweetie 16 颜色。这样：

- 全片颜色数严格 ≤16；
- 中文字边缘是硬边；
- 不会出现跨镜头的颜色漂移。

### 音频

`audio/synth.mjs` 默认只做**音效**，不铺连续 BGM：

- 键盘、发送、思考提示、回答提示音；
- 下潜 whoosh、两次心跳、脚步、开箱、翻卡、继电器、命中、升级、打字；
- 每个声音都是独立事件，事件之间留白。

需要连续芯片音乐时，设置 `BGM=1` 再运行；它会额外生成 78 BPM 的 Am–F–C–G 循环、低音、琶音和鼓组。全部写入 `out/mix.wav`，再由 FFmpeg 做 `loudnorm` 并混流。

## 4. 如何复用

```powershell
npm install
node audio/synth.mjs
node render/capture.mjs 60 30
node render/encode.mjs --dir out/frames --out out/ai-chip-60s.mp4
node render/srt.mjs
node render/qa.mjs
```

换主题时，主要改三处：

1. `src/timeline.js`：章节、字幕、时长；
2. `src/scenes/`：场景绘制；
3. `audio/synth.mjs`：BGM 段落与音效时间点。

像素规格、渲染管线、量化、编码都不用动。

## 5. 常见坑

- **非整数倍放大**：2.5×、4.5× 会让像素行粗细不均；宁可加黑边。
- **只在最后一步最近邻**：前面用了 bilinear，等于先糊后锐，边缘救不回来。
- **文字字号不是 12 的整数倍**：像素字体会发糊；用 12/24/36/48px。
- **每帧有帧间状态**：例如「上一帧画到哪」，逐帧截图会漂移；每帧从 `t` 重算。
- **随机数没种子**：粒子每帧乱跳；用固定种子 PRNG。
- **yuv420p 的 1px 饱和红/蓝线**：压缩后会有色斑；母版可用 yuv444p，交付再转 420。
- **先写死时间码再配音**：TTS 时长一变，字幕全错；先定音频再回填时间轴。
- **把开源 Skill 当一键出片**：通常要 2 轮以上迭代；复杂 shader 会让渲染时间翻倍。

## 6. 参考来源

- 腾讯云：《用 Claude Opus 5.5 写代码做视频：7 类技术路线、5 个案例拆解》  
  https://cloud.tencent.com.cn/developer/article/2755944
- 阿里云：《Opus 5.5 生成视频的真相：它不生成视频，是写代码让浏览器逐帧画出来》  
  https://developer.aliyun.com/article/1767954
- joeseesun/opus-video-prompts  
  https://github.com/joeseesun/opus-video-prompts
- HRuiCcc/RuiC-pixel-explainer  
  https://github.com/HRuiCcc/RuiC-pixel-explainer
- xiazhuo123456789/vibe-knowledge-video  
  https://github.com/xiazhuo123456789/vibe-knowledge-video
- alchaincyf/huashu-art-motion  
  https://github.com/alchaincyf/huashu-art-motion
- billyhetech/awesome-opus5-5-videos  
  https://github.com/billyhetech/awesome-opus5-5-videos
- Lospec：Sweetie 16  
  https://lospec.com/palette-list/sweetie-16
- Chrome：image-rendering: pixelated  
  https://developer.chrome.com/blog/pixelated?hl=zh-cn
- Fusion Pixel Font  
  https://github.com/TakWolf/fusion-pixel-font
