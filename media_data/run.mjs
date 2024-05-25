import puppeteer from 'puppeteer';
import { resolve } from "node:path";

const pathToExtension = resolve(process.cwd(), '..', 'dist');

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    ignoreHTTPSErrors: true,
    args: [
      `--disable-extensions-except=${pathToExtension}`,
      `--load-extension=${pathToExtension}`,
      `--window-size=1280,720`
    ],
    defaultViewport: {
      width: 1280,
      height: 720
    }
  });
  const page = await browser.newPage();
  const website_url = 'http://modern-json-formatter.example/numbers.json';

// Open URL in current page
  await page.goto(website_url, { waitUntil: 'networkidle0' })
})();
