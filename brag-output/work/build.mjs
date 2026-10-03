// Reproducible build for the promo video and store screenshots.
// usage: node build.mjs [all|video|screens]   (default: all)
// needs: Google Chrome (stable channel), ffmpeg on PATH, `npm ci` in this folder.
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { copyFileSync, mkdirSync, readFileSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, '../..');
const OUT = resolve(HERE, '..');
const target = process.argv[2] ?? 'all';

const FPS = 30, DURATION = 27, POSTER_T = 6.8;
const SHOTS = [
  ['01-readable', 4.6], ['02-big-numbers', 7.0], ['03-key-order', 10.0], ['04-links', 12.75],
  ['05-raw', 15.2], ['06-jq', 19.8], ['07-fold', 21.8], ['08-download', 24.1], ['09-logo', 26.5],
];
const SCREEN_CSS = `html, body { height: 1200px !important; } #win { height: 950px !important; top: 206px !important; }
  #caption { top: 66px !important; } #cursor, #click { display: none !important; }
  #rawview { font-size: 28px !important; padding-top: 90px !important; }`;

const run = (cmd, args) => execFileSync(cmd, args, { cwd: HERE, stdio: 'inherit' });
const ffmpeg = (...args) => run('ffmpeg', ['-y', '-loglevel', 'error', ...args]);

// 1. assets come from the repo, never committed twice
copyFileSync(join(REPO, 'assets/Monaco.woff'), join(HERE, 'Monaco.woff'));
copyFileSync(join(REPO, 'assets/production/icon512.png'), join(HERE, 'icon512.png'));
copyFileSync(join(REPO, '.github/readme-logo.png'), join(HERE, 'readme-logo.png'));

// 2. static server for the page (fonts need http, not file://)
const TYPES = { '.html': 'text/html', '.woff': 'font/woff', '.png': 'image/png' };
const server = createServer((req, res) => {
  const file = join(HERE, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  let body;
  try { body = readFileSync(file); } catch { res.writeHead(404).end(); return; }
  res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' }).end(body);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const url = `http://127.0.0.1:${server.address().port}/index.html`;

const browser = await chromium.launch({ channel: 'chrome' });
async function openPage(viewport, css) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
  page.on('pageerror', e => { throw e; });
  await page.goto(url);
  if (css) await page.addStyleTag({ content: css });
  await page.evaluate(() => window.ready);
  return page;
}

try {
  if (target === 'all' || target === 'video') {
    run('node', ['audio.mjs']);
    rmSync(join(HERE, 'frames'), { recursive: true, force: true });
    mkdirSync(join(HERE, 'frames'));
    const page = await openPage({ width: 1920, height: 1080 });
    for (let f = 0; f < DURATION * FPS; f++) {
      await page.evaluate(t => window.render(t), f / FPS);
      await page.screenshot({ path: join(HERE, `frames/f${String(f).padStart(4, '0')}.png`) });
      if (f % 90 === 0) console.log(`frame ${f}/${DURATION * FPS}`);
    }
    // poster: a settled frame, baked in as frame 0 so every player shows it as the thumbnail
    const poster = join(HERE, `frames/f${String(Math.round(POSTER_T * FPS)).padStart(4, '0')}.png`);
    copyFileSync(poster, join(HERE, 'frames/f0000.png'));
    ffmpeg('-i', poster, '-q:v', '2', join(OUT, 'brag.jpg'));
    ffmpeg('-framerate', String(FPS), '-i', 'frames/f%04d.png', '-i', 'audio.wav',
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p',
      '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-shortest', '-movflags', '+faststart', join(OUT, 'brag.mp4'));
    console.log('video → brag-output/brag.mp4');
  }

  if (target === 'all' || target === 'screens') {
    rmSync(join(HERE, 'screens-raw'), { recursive: true, force: true });
    mkdirSync(join(HERE, 'screens-raw'));
    mkdirSync(join(OUT, 'screenshots'), { recursive: true });
    const page = await openPage({ width: 1920, height: 1200 }, SCREEN_CSS);
    for (const [name, t] of SHOTS) {
      await page.evaluate(t => window.render(t), t);
      await page.screenshot({ path: join(HERE, `screens-raw/${name}.png`) });
      ffmpeg('-i', `screens-raw/${name}.png`, '-vf', 'scale=1280:800:flags=lanczos', join(OUT, `screenshots/${name}.png`));
    }
    console.log('screenshots → brag-output/screenshots/');
  }
} finally {
  await browser.close();
  server.close();
}
