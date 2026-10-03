// Store screenshots (1920x1200 → scaled to 1280x800 by ffmpeg) from the video page at settled moments.
import { chromium } from '/Users/evg4b/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.mjs';
import { mkdirSync } from 'node:fs';

const SHOTS = [
  ['01-readable', 4.6], ['02-big-numbers', 7.0], ['03-key-order', 10.0], ['04-links', 12.75],
  ['05-raw', 15.2], ['06-jq', 19.8], ['07-fold', 21.8], ['08-download', 24.1], ['09-logo', 26.5],
];
mkdirSync('screens-raw', { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1920, height: 1200 } });
page.on('pageerror', e => console.error('PAGE ERROR', e.message));
await page.goto('http://127.0.0.1:8765/index.html');
await page.addStyleTag({ content: `html, body { height: 1200px !important; } #win { height: 950px !important; top: 206px !important; }
  #caption { top: 66px !important; } #cursor, #click { display: none !important; } #rawview { font-size: 28px !important; padding-top: 90px !important; }` });
await page.evaluate(() => window.ready);
for (const [name, t] of SHOTS) {
  await page.evaluate(t => window.render(t), t);
  await page.screenshot({ path: `screens-raw/${name}.png` });
}
await browser.close();
