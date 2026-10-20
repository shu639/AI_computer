import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { SUBTITLES } from '../src/timeline.js';

function ms(t) {
  return String(Math.round(t * 1000) % 1000).padStart(3, '0');
}
function ts(t) {
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = Math.floor(t % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${ms(t)}`;
}

const body = SUBTITLES.map((s, i) => `${i + 1}\n${ts(s.start)} --> ${ts(s.end)}\n${s.text}\n`).join('\n');
const out = path.resolve(import.meta.dirname, '..', 'docs', 'subtitles.srt');
writeFileSync(out, body, 'utf8');
console.log('wrote', out, SUBTITLES.length, 'cues');
