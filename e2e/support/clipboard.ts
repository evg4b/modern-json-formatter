import type { CDPSession, Page } from '@playwright/test';

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

/*
 * The commands are dispatched against whatever the page is showing at that
 * instant, so a view still settling copies nothing. Seeding the clipboard makes
 * that case obvious rather than leaving a stale or empty read to fail later.
 */
export const selectAllAndCopy = async (page: Page, cdp: CDPSession, timeout: number): Promise<string> => {
  await page.evaluate(sentinel => navigator.clipboard.writeText(sentinel), SENTINEL);

  const deadline = Date.now() + timeout;
  for (;;) {
    await editingCommand(cdp, 'a', 'KeyA', 'selectAll');
    await editingCommand(cdp, 'c', 'KeyC', 'copy');

    const copied = await page.evaluate(() => navigator.clipboard.readText());
    if (copied !== SENTINEL) {
      return copied;
    }

    if (Date.now() >= deadline) {
      throw new Error('Select all and copy left the clipboard untouched');
    }

    await page.waitForTimeout(POLL_INTERVAL);
  }
};
