import type { CDPSession, Page } from '@playwright/test';

/*
 * Chromium handles select all and copy as editing commands rather than as plain
 * key presses, and Playwright's keyboard sends the keys without them.
 */
const editingCommand = async (cdp: CDPSession, key: string, code: string, command: string) => {
  await cdp.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key, code, commands: [command] });
  await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', key, code });
};

export type CopyAll = (anchor: string) => Promise<string>;

export const selectAllAndCopy = async (page: Page, cdp: CDPSession): Promise<string> => {
  await editingCommand(cdp, 'a', 'KeyA', 'selectAll');
  await editingCommand(cdp, 'c', 'KeyC', 'copy');

  return page.evaluate(() => navigator.clipboard.readText());
};
