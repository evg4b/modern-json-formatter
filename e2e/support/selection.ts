import type { CDPSession, Page } from '@playwright/test';
import type { ShadowElement } from './shadow';

const POLL_INTERVAL = 100;
const SENTINEL = '<nothing was copied>';

/*
 * Chromium handles select all and copy as editing commands rather than as plain
 * key presses, and Playwright's keyboard sends the keys without them.
 */
const editingCommand = async (cdp: CDPSession, key: string, code: string, command: string) => {
  await cdp.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key, code, commands: [command] });
  await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', key, code });
};

export type CopyAll = (anchor: string) => Promise<string>;
export type CopySelection = () => Promise<string>;

/*
 * The commands are dispatched against whatever the page is showing at that
 * instant, so a view still settling copies nothing. Seeding the clipboard makes
 * that case obvious rather than leaving a stale or empty read to fail later.
 */
const copyWith = async (
  page: Page,
  cdp: CDPSession,
  timeout: number,
  select: () => Promise<void>,
): Promise<string> => {
  await page.evaluate(sentinel => navigator.clipboard.writeText(sentinel), SENTINEL);

  const deadline = Date.now() + timeout;
  for (;;) {
    await select();
    await editingCommand(cdp, 'c', 'KeyC', 'copy');

    const copied = await page.evaluate(() => navigator.clipboard.readText());
    if (copied !== SENTINEL) {
      return copied;
    }

    if (Date.now() >= deadline) {
      throw new Error('Copying left the clipboard untouched');
    }

    await page.waitForTimeout(POLL_INTERVAL);
  }
};

export const selectAllAndCopy = (page: Page, cdp: CDPSession, timeout: number): Promise<string> => {
  return copyWith(page, cdp, timeout, () => editingCommand(cdp, 'a', 'KeyA', 'selectAll'));
};

export const copySelection = (page: Page, cdp: CDPSession, timeout: number): Promise<string> => {
  return copyWith(page, cdp, timeout, () => Promise.resolve());
};

/*
 * Drags from the left edge of `from` to the right edge of `to`, the way a
 * reader would sweep across part of the document.
 */
export const dragSelect = async (page: Page, from: ShadowElement, to: ShadowElement): Promise<void> => {
  const start = await from.box();
  const end = await to.box();

  await page.mouse.move(start.x, start.y + start.height / 2);
  await page.mouse.down();
  await page.mouse.move(end.x + end.width, end.y + end.height / 2, { steps: 10 });
  await page.mouse.up();
};
