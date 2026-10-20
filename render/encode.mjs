import path from 'node:path';
import { existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ROOT = path.resolve(import.meta.dirname, '..');
const args = process.argv.slice(2);

function arg(name, fallback) {
  const i = args.indexOf('--' + name);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
}

const fps = Number(arg('fps', 30));
const framesDir = path.resolve(ROOT, arg('dir', 'out/frames'));
const output = path.resolve(ROOT, arg('out', 'out/ai-chip-60s.mp4'));
const audio = arg('audio', 'out/mix.wav');
const audioPath = path.resolve(ROOT, audio);
const crf = arg('crf', '18');
const pixFmt = arg('pix-fmt', 'yuv420p');

function findFfmpeg() {
  const candidates = [
    process.env.FFMPEG_PATH,
    path.join(process.env.LOCALAPPDATA || '', 'Microsoft', 'WinGet', 'Links', 'ffmpeg.exe'),
    path.join(process.env.ProgramFiles || '', 'ffmpeg', 'bin', 'ffmpeg.exe'),
    path.join(process.env.LOCALAPPDATA || '', 'Microsoft', 'WinGet', 'Packages', 'Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe', 'ffmpeg-9.0.2-full_build', 'bin', 'ffmpeg.exe'),
    'node_modules/@ffmpeg-installer/win32-x64/ffmpeg.exe',
  ].filter(Boolean);
  for (const c of candidates) {
    if (existsSync(c)) return c;
  }
  return 'ffmpeg';
}

const ffmpeg = findFfmpeg();
const scale = 'scale=1920:1080:flags=neighbor';
const vin = ['-y', '-framerate', String(fps), '-i', path.join(framesDir, '%05d.png')];

const vArgs = [
  ...vin,
  '-vf', scale,
  '-c:v', 'libx264',
  '-preset', 'slow',
  '-crf', crf,
  '-pix_fmt', pixFmt,
  '-movflags', '+faststart',
];

if (existsSync(audioPath)) {
  const mixed = path.resolve(ROOT, 'out', 'video-no-audio.mp4');
  execFileSync(ffmpeg, [...vArgs, mixed], { stdio: 'inherit' });
  execFileSync(
    ffmpeg,
    [
      '-y',
      '-i', mixed,
      '-i', audioPath,
      '-c:v', 'copy',
      '-af', 'highpass=f=60,treble=g=2,loudnorm=I=-16:TP=-2.0:LRA=11',
      '-ar', '48000',
      '-c:a', 'aac',
      '-b:a', '192k',
      '-shortest',
      '-movflags', '+faststart',
      output,
    ],
    { stdio: 'inherit' }
  );
  console.log('encoded with audio ->', output);
} else {
  execFileSync(ffmpeg, [...vArgs, output], { stdio: 'inherit' });
  console.log('encoded (no audio) ->', output);
}
