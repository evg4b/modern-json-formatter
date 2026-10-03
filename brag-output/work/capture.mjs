// usage: node capture.mjs stills t1 t2 ...   |   node capture.mjs frames
import { chromium } from '/Users/evg4b/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.mjs';
import { mkdirSync } from 'node:fs';

const [mode, ...times] = process.argv.slice(2);
const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
page.on('pageerror', e => console.error('PAGE ERROR', e.message));
await page.goto('http://127.0.0.1:8765/index.html');
await page.evaluate(() => window.ready);

if (mode === 'stills') {
  mkdirSync('stills', { recursive: true });
  for (const t of times) {
    await page.evaluate(t => window.render(t), +t);
    await page.screenshot({ path: `stills/t${t}.png` });
  }
} else {
  mkdirSync('frames', { recursive: true });
  const FPS = 30, N = 27 * FPS;
  for (let f = 0; f < N; f++) {
    await page.evaluate(t => window.render(t), f / FPS);
    await page.screenshot({ path: `frames/f${String(f).padStart(4, '0')}.png` });
    if (f % 60 === 0) console.log('frame', f);
  }
}
await browser.close();
