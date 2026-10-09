import { afterEach, beforeEach, describe, expect, rstest, test } from '@rstest/core';
import '@testing/browser.mock';
import '@testing/background.mock';
import '@testing/settings.mock';
import { download, format, jq, tokenize } from '@core/background';
import { getSettings } from '@core/settings';
import { createElement } from '@core/dom';
import { registerStyle } from '@core/ui/helpers';
import { tErrorNode, tObject, tProperty, tString, tTuple } from '@testing/json';
import { wrapMock } from '@testing/helpers';
import { runExtension } from './extension';
import { ONE_MEGABYTE_LENGTH } from './document/json-document';
import { ToolboxElement } from './ui/toolbox/toolbox';
import { findNodeWithCode } from './json-detector';
import { ContainerElement } from './ui/container/container';
import { type ErrorNodeElement } from './ui/error-node';

rstest.mock('./json-detector', () => ({
  findNodeWithCode: rstest.fn().mockName('findNodeWithCode'),
}));

rstest.mock('@core/ui/helpers', () => ({
  registerStyle: rstest.fn().mockName('registerStyle'),
  FloatingMessageElement: rstest.fn().mockName('FloatingMessageElement'),
}));

const settings = (maxFileSize: number) => ({
  buttons: { query: true, formatted: true, raw: true, download: true },
  downloadMode: 'dropdown' as const,
  maxFileSize,
});

const tick = () => new Promise(resolve => setTimeout(resolve, 0));

describe('runExtension', () => {
  let shadowRoot: ShadowRoot;
  let attachShadowSpy: ReturnType<typeof rstest.spyOn>;
  let messageSpy: ReturnType<typeof rstest.spyOn>;
  let formattedSpy: ReturnType<typeof rstest.spyOn>;
  let rawSpy: ReturnType<typeof rstest.spyOn>;
  let querySpy: ReturnType<typeof rstest.spyOn>;

  const container = () => shadowRoot.querySelector('mjf-container') as ContainerElement;
  const lastElement = (spy: ReturnType<typeof rstest.spyOn>) => spy.mock.lastCall?.[0] as HTMLElement;

  beforeEach(() => {
    const body = createElement({ element: 'body' });
    const boundAttachShadow = body.attachShadow.bind(body);
    attachShadowSpy = rstest.spyOn(document.body, 'attachShadow')
      .mockImplementation((init: ShadowRootInit) => {
        shadowRoot = boundAttachShadow(init);
        return shadowRoot;
      });

    messageSpy = rstest.spyOn(ContainerElement.prototype, 'message').mockImplementation(() => undefined);
    formattedSpy = rstest.spyOn(ContainerElement.prototype, 'setFormattedContent');
    rawSpy = rstest.spyOn(ContainerElement.prototype, 'setRawContent');
    querySpy = rstest.spyOn(ContainerElement.prototype, 'setQueryContent');
  });

  afterEach(() => {
    rstest.clearAllMocks();
    rstest.resetAllMocks();
  });

  test('leaves the page alone when no code node exists', async () => {
    wrapMock(findNodeWithCode).mockResolvedValue(null);

    await runExtension();

    expect(attachShadowSpy).not.toHaveBeenCalled();
    expect(registerStyle).not.toHaveBeenCalled();
  });

  test('renders the tree into the formatted view', async () => {
    const preNode = createElement({ element: 'pre', content: '{ "key": "value" }' });
    wrapMock(findNodeWithCode).mockResolvedValue(preNode);
    wrapMock(tokenize).mockResolvedValue(tObject(tProperty('key', tString('value'))));

    await runExtension();

    expect(tokenize).toHaveBeenCalledWith('{ "key": "value" }');
    expect(rawSpy).toHaveBeenCalledWith(preNode);
    expect(lastElement(formattedSpy).classList.contains('root')).toBe(true);
  });

  test('shows an error node in the formatted view for invalid JSON', async () => {
    wrapMock(findNodeWithCode).mockResolvedValue(createElement({ element: 'pre', content: '{ "broken": ' }));
    wrapMock(tokenize).mockRejectedValue(tErrorNode('expected value', 'tokenizer'));

    await runExtension();

    const errorNode = lastElement(formattedSpy) as ErrorNodeElement;
    expect(errorNode.tagName).toBe('MJF-ERROR-NODE');
    expect(errorNode.header).toBe('Invalid JSON file.');
    expect(errorNode.lines).toEqual(['expected value']);
  });

  describe('oversized document', () => {
    let preNode: HTMLPreElement;

    beforeEach(() => {
      preNode = createElement({ element: 'pre', content: 'X'.repeat(ONE_MEGABYTE_LENGTH * 3 + 10) });
      wrapMock(getSettings).mockResolvedValue(settings(3));
      wrapMock(findNodeWithCode).mockResolvedValue(preNode);
    });

    test('shows the formatted text in the raw view with a notice', async () => {
      wrapMock(format).mockResolvedValue('formatted');

      await runExtension();

      expect(container().type).toBe('raw');
      expect(preNode.isConnected).toBe(false);
      expect(lastElement(rawSpy).textContent).toBe('formatted');
      expect(messageSpy).toHaveBeenCalledWith('File is too large', expect.stringContaining('More than 3MB'));
      expect(tokenize).not.toHaveBeenCalled();
    });

    test('shows an error node in the raw view when formatting fails', async () => {
      wrapMock(format).mockRejectedValue(tErrorNode('trailing comma', 'tokenizer'));

      await runExtension();

      expect((lastElement(rawSpy) as ErrorNodeElement).header).toBe('Invalid JSON file.');
      expect(messageSpy).not.toHaveBeenCalled();
    });

    test('does not mount the toolbar', async () => {
      rstest.useFakeTimers();
      wrapMock(format).mockResolvedValue('formatted');

      await runExtension();
      rstest.runAllTimers();
      rstest.useRealTimers();

      expect(shadowRoot.querySelector('mjf-toolbox')).toBeNull();
    });
  });

  describe('toolbar', () => {
    let toolbox: ToolboxElement;

    beforeEach(async () => {
      rstest.useFakeTimers();
      wrapMock(findNodeWithCode).mockResolvedValue(createElement({ element: 'pre', content: '{ "key": "value" }' }));
      wrapMock(tokenize).mockResolvedValue(tObject(tProperty('key', tString('value'))));

      await runExtension();
      rstest.runAllTimers();
      rstest.useRealTimers();

      toolbox = shadowRoot.querySelector('mjf-toolbox') as ToolboxElement;
    });

    test.each(['query', 'raw', 'formatted'] as const)('tab-changed switches to %s', tab => {
      toolbox.dispatchEvent(new CustomEvent('tab-changed', { detail: tab }));

      expect(container().type).toBe(tab);
    });

    test('download saves the document', async () => {
      toolbox.dispatchEvent(new CustomEvent('download', { detail: 'formatted' }));
      await tick();

      expect(download).toHaveBeenCalledWith('formatted', '{ "key": "value" }', expect.stringContaining('_formatted.json'));
      expect(messageSpy).not.toHaveBeenCalled();
    });

    test('download failure shows a notice', async () => {
      wrapMock(download).mockRejectedValue(tErrorNode('failed'));

      toolbox.dispatchEvent(new CustomEvent('download', { detail: 'raw' }));
      await tick();

      expect(messageSpy).toHaveBeenCalledWith('Unable to download file', 'failed');
    });

    test('jq-query renders the result into the query view', async () => {
      wrapMock(jq).mockResolvedValue(tTuple(tString('value')));

      toolbox.dispatchEvent(new CustomEvent('jq-query', { detail: '.key' }));
      await tick();

      expect(jq).toHaveBeenCalledWith('{ "key": "value" }', '.key', globalThis.location.href);
      expect(lastElement(querySpy).classList.contains('tuple')).toBe(true);
    });

    test('jq-query shows an invalid query under the input', async () => {
      wrapMock(jq).mockRejectedValue(tErrorNode('syntax error', 'jq'));

      toolbox.dispatchEvent(new CustomEvent('jq-query', { detail: '.invalid' }));
      await tick();

      expect(toolbox.error).toBe('syntax error');
      expect(messageSpy).not.toHaveBeenCalled();
    });

    test('jq-query shows other failures as a notice', async () => {
      wrapMock(jq).mockRejectedValue({ ...tErrorNode('worker error'), stack: 'stack' });

      toolbox.dispatchEvent(new CustomEvent('jq-query', { detail: '.key' }));
      await tick();

      expect(messageSpy).toHaveBeenCalledWith('Error worker error in worker', 'Stack trace: stack');
      expect(toolbox.error).toBeNull();
    });
  });
});
