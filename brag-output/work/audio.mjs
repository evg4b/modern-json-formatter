// Synthesises music + effects as one piece: 120 BPM, A minor. Writes audio.wav (48k stereo).
import { writeFileSync } from 'node:fs';

const SR = 48000, DUR = 20, N = SR * DUR;
const L = new Float32Array(N), R = new Float32Array(N);
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
const BEAT = 0.5;

function add(t0, buf, gain = 1, pan = 0) {
  const s0 = Math.floor(t0 * SR), gl = gain * Math.cos((pan + 1) * Math.PI / 4), gr = gain * Math.sin((pan + 1) * Math.PI / 4);
  for (let i = 0; i < buf.length; i++) { const j = s0 + i; if (j < 0 || j >= N) continue; L[j] += buf[i] * gl; R[j] += buf[i] * gr; }
}
// simple one-pole lowpass
function lp(buf, fc) { const a = Math.exp(-2 * Math.PI * fc / SR); let y = 0; for (let i = 0; i < buf.length; i++) { y = (1 - a) * buf[i] + a * y; buf[i] = y; } return buf; }

function pluck(m, len = 0.5, bright = 3000, decay = 6) {
  const n = Math.floor(len * SR), b = new Float32Array(n), f = mtof(m);
  for (let i = 0; i < n; i++) { const t = i / SR, env = Math.min(1, t * 400) * Math.exp(-t * decay);
    b[i] = env * (Math.sin(2 * Math.PI * f * t) + 0.35 * Math.sin(4 * Math.PI * f * t) * Math.exp(-t * 10) + 0.12 * Math.sin(6 * Math.PI * f * t) * Math.exp(-t * 16)); }
  return lp(b, bright);
}
function pad(ms, len, fc = 1400) {
  const n = Math.floor(len * SR), b = new Float32Array(n);
  for (const m of ms) for (const d of [-0.08, 0.08]) { const f = mtof(m) * Math.pow(2, d / 12);
    for (let i = 0; i < n; i++) { const t = i / SR; const ph = (f * t) % 1; b[i] += (2 * ph - 1) * 0.5; } }
  for (let i = 0; i < n; i++) { const t = i / SR; b[i] *= Math.min(1, t / 0.4) * Math.min(1, (len - t) / 0.5) / ms.length; }
  return lp(lp(b, fc), fc);
}
function kick() { const n = Math.floor(0.35 * SR), b = new Float32Array(n); let ph = 0;
  for (let i = 0; i < n; i++) { const t = i / SR, f = 48 + 90 * Math.exp(-t * 30); ph += f / SR; b[i] = Math.sin(2 * Math.PI * ph) * Math.exp(-t * 9); } return b; }
function hat() { const n = Math.floor(0.06 * SR), b = new Float32Array(n); let prev = 0;
  for (let i = 0; i < n; i++) { const w = Math.random() * 2 - 1; b[i] = (w - prev) * Math.exp(-i / SR * 60); prev = w; } return lp(b, 9000); }
function bass(m, len) { const n = Math.floor(len * SR), b = new Float32Array(n), f = mtof(m);
  for (let i = 0; i < n; i++) { const t = i / SR; b[i] = (Math.sin(2 * Math.PI * f * t) + 0.3 * Math.sin(4 * Math.PI * f * t)) * Math.min(1, t * 200) * Math.min(1, (len - t) * 20) * Math.exp(-t * 1.5); } return b; }
function whoosh(len) { const n = Math.floor(len * SR), b = new Float32Array(n); let y = 0;
  for (let i = 0; i < n; i++) { const t = i / SR, k = t / len, fc = 300 + 5000 * k * k, a = Math.exp(-2 * Math.PI * fc / SR);
    y = (1 - a) * (Math.random() * 2 - 1) + a * y; b[i] = y * Math.pow(k, 2) * Math.min(1, (len - t) * 30); } return b; }
function bell(m, len = 2.5) { const n = Math.floor(len * SR), b = new Float32Array(n), f = mtof(m);
  for (let i = 0; i < n; i++) { const t = i / SR; b[i] = Math.min(1, t * 300) * (Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 1.6) + 0.25 * Math.sin(2 * Math.PI * f * 2.76 * t) * Math.exp(-t * 5)); } return b; }
function click() { const n = Math.floor(0.03 * SR), b = new Float32Array(n);
  for (let i = 0; i < n; i++) { const t = i / SR; b[i] = Math.sin(2 * Math.PI * 1760 * t) * Math.exp(-t * 220); } return b; }

// Am  F  C  G (2s each)
const CHORDS = [[57, 60, 64], [53, 57, 60], [48, 55, 64], [55, 59, 62]];
const ROOTS = [45, 41, 48, 43];
const ARP = [0, 1, 2, 1, 2, 0, 2, 1];

for (let c = 0; c < 10; c++) {
  const t0 = c * 2, ch = CHORDS[c % 4], end = t0 >= 16.9;
  if (t0 < 17) add(t0, pad(ch.map(m => m), 2.3, t0 < 3 ? 700 : 1500), t0 < 3 ? 0.09 : 0.11);
  // arp in 8ths, an octave up
  for (let k = 0; k < 8 && t0 < 16.9; k++) { const tt = t0 + k * BEAT / 2; if (tt >= 16.9) break;
    add(tt, pluck(ch[ARP[k]] + 12, 0.4, tt < 3 ? 1500 : 3200, 7), 0.07, k % 2 ? 0.35 : -0.35); }
  if (t0 >= 2 && t0 < 16.9) for (let k = 0; k < 4; k++) { const tt = t0 + k * BEAT; if (tt < 3 || tt >= 16.9) continue;
    add(tt, bass(ROOTS[c % 4], BEAT * 0.9), 0.16); }
}
// drums from the reveal until the outro
for (let tt = 3; tt < 16.9; tt += BEAT) { add(tt, kick(), 0.32); add(tt + BEAT / 2, hat(), 0.05, 0.2); }

// effects, in key
add(2.45, whoosh(0.6), 0.22);                       // into reveal
[69, 72, 76].forEach((m, i) => add(3.0 + i * 0.04, bell(m + 12, 2), 0.05, (i - 1) * 0.4));
add(6.85, bell(81, 1.6), 0.05, 0.3);                 // ghost value appears
add(6.9, bell(76, 1.6), 0.04, -0.3);
add(10.45, click(), 0.06); add(14.33, click(), 0.06);
const PENTA = [69, 72, 74, 76, 79, 81];
const Q = '.todos[] | {id, title}';
for (let i = 1; i <= Q.length; i++) { const tt = 10.75 + (i / Q.length) * 1.35 - 1.35 / Q.length; add(tt, pluck(PENTA[i % 6] + 12, 0.15, 5000, 30), 0.025, (Math.random() - 0.5) * 0.6); }
add(12.25, bell(76, 1.2), 0.045);                    // results land
for (let i = 0; i < 10; i++) add(14.35 + i * 0.16, pluck(PENTA[5 - (i % 6)] + 12, 0.2, 3500, 22), 0.035, 0.2);
add(16.55, whoosh(0.45), 0.14);
// outro: Am(add9) bloom
[57, 64, 69, 71, 72, 76].forEach((m, i) => add(16.95 + i * 0.05, bell(m + 12, 3), 0.045, (i / 5 - 0.5) * 0.8));
add(16.95, pad([45, 57, 60, 64, 71], 3.05, 1200), 0.14);
add(16.95, kick(), 0.3);

// reverb: a few feedback delays, then master fade + soft clip
function verb(x, y) { const taps = [0.031, 0.047, 0.061, 0.083], fb = 0.55, out = new Float32Array(N);
  for (const d of taps) { const D = Math.floor(d * SR * 3), buf = new Float32Array(N);
    for (let i = 0; i < N; i++) { buf[i] = x[i] * 0.3 + (i >= D ? buf[i - D] * fb : 0); out[i] += buf[i] * 0.12; } }
  lp(out, 4000); return out; }
const vl = verb(L), vr = verb(R);
const pcm = Buffer.alloc(44 + N * 4);
for (let i = 0; i < N; i++) { const t = i / SR, g = Math.min(1, t / 0.15) * Math.min(1, (DUR - t) / 0.8) * 1.4;
  const l = Math.tanh((L[i] + vl[i]) * g), r = Math.tanh((R[i] + vr[i]) * g);
  pcm.writeInt16LE(Math.round(l * 32000), 44 + i * 4); pcm.writeInt16LE(Math.round(r * 32000), 46 + i * 4); }
pcm.write('RIFF', 0); pcm.writeUInt32LE(36 + N * 4, 4); pcm.write('WAVEfmt ', 8); pcm.writeUInt32LE(16, 16); pcm.writeUInt16LE(1, 20);
pcm.writeUInt16LE(2, 22); pcm.writeUInt32LE(SR, 24); pcm.writeUInt32LE(SR * 4, 28); pcm.writeUInt16LE(4, 32); pcm.writeUInt16LE(16, 34);
pcm.write('data', 36); pcm.writeUInt32LE(N * 4, 40);
writeFileSync('audio.wav', pcm);
console.log('ok');
