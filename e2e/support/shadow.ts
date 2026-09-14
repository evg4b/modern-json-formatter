import type { CDPSession, Page } from '@playwright/test';

const PIERCE = '>>>';
const POLL_INTERVAL = 100;

export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class ShadowElement {
  public constructor(
    private readonly page: Page,
    private readonly cdp: CDPSession,
    private readonly objectId: string,
  ) {}

  public async text(): Promise<string> {
    return this.evaluate<string>('function () { return this.innerText; }');
  }

  // `declaration` is the source of a function called with the element as `this`.
  public async evaluate<T>(declaration: string): Promise<T> {
    const { result } = await this.cdp.send('Runtime.callFunctionOn', {
      objectId: this.objectId,
      functionDeclaration: declaration,
      returnByValue: true,
    });

    return result.value as T;
  }

  public async click(): Promise<void> {
    const { x, y, width, height } = await this.box();
    await this.page.mouse.click(x + width / 2, y + height / 2);
  }

  public async box(): Promise<Box> {
    await this.cdp.send('DOM.scrollIntoViewIfNeeded', { objectId: this.objectId });
    const { model } = await this.cdp.send('DOM.getBoxModel', { objectId: this.objectId });
    const [x, y, right, , , bottom] = model.border;

    return { x, y, width: right - x, height: bottom - y };
  }
}

const shadowRootOf = async (cdp: CDPSession, nodeId: number, selector: string): Promise<number> => {
  const { node } = await cdp.send('DOM.describeNode', { nodeId, pierce: true });
  const [shadowRoot] = node.shadowRoots ?? [];
  if (!shadowRoot) {
    throw new Error(`Element "${selector}" has no shadow root`);
  }

  const { nodeIds } = await cdp.send('DOM.pushNodesByBackendIdsToFrontend', {
    backendNodeIds: [shadowRoot.backendNodeId],
  });

  return nodeIds[0];
};

/*
 * Node ids are discarded every time the document is re-read, so the match is
 * turned into a remote object handle that stays valid for the whole page.
 */
const resolve = async (cdp: CDPSession, path: string): Promise<string> => {
  const selectors = path.split(PIERCE).map(selector => selector.trim());
  const { root } = await cdp.send('DOM.getDocument', { depth: 0 });
  let nodeId = root.nodeId;

  for (const [index, selector] of selectors.entries()) {
    const { nodeId: found } = await cdp.send('DOM.querySelector', { nodeId, selector });
    if (!found) {
      throw new Error(`No element matching "${selector}" in "${path}"`);
    }

    nodeId = index === selectors.length - 1
      ? found
      : await shadowRootOf(cdp, found, selector);
  }

  const { object } = await cdp.send('DOM.resolveNode', { nodeId });

  return object.objectId as string;
};

export interface ShadowDom {
  find(path: string): Promise<ShadowElement>;
  exists(path: string): Promise<boolean>;
}

/*
 * Playwright locators stop at closed shadow roots, and the extension builds its
 * whole UI inside them. CDP still walks through, so paths are resolved by hand:
 * segments separated by `>>>`, each queried inside the shadow root of the
 * previous match.
 */
export const shadowDom = (page: Page, cdp: CDPSession, timeout: number): ShadowDom => ({
  async find(path) {
    const deadline = Date.now() + timeout;
    for (;;) {
      try {
        return new ShadowElement(page, cdp, await resolve(cdp, path));
      } catch (error: unknown) {
        if (Date.now() >= deadline) {
          throw error;
        }

        await page.waitForTimeout(POLL_INTERVAL);
      }
    }
  },

  async exists(path) {
    return resolve(cdp, path).then(() => true, () => false);
  },
});
