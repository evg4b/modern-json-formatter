import { afterEach, beforeEach, describe, expect, rstest, test } from '@rstest/core';
import '@testing/browser.mock';
import '@testing/background.mock';
import { download, format, jq, pushHistory, tokenize } from '@core/background';
import { sendMessage } from '@core/browser';
import { createElement } from '@core/dom';
import { registerStyle } from '@core/ui/helpers';
import { tNull, tObject, tProperty, tString } from '@testing/json';
import { wrapMock } from '@testing/helpers';
import { LIMIT, runExtension } from './extension';
import { ToolboxElement } from './ui/toolbox/toolbox';
import { findNodeWithCode } from './json-detector';
import { buildContainers } from './ui';

rstest.mock('./json-detector', () => ({
  findNodeWithCode: rstest.fn().mockName('findNodeWithCode'),
}));

rstest.mock('./ui', () => ({
  buildContainers: rstest.fn().mockName('buildContainers'),
}));

rstest.mock('@core/ui/helpers', () => ({
  registerStyle: rstest.fn().mockName('registerStyle'),
  FloatingMessageElement: rstest.fn().mockName('FloatingMessageElement'),
}));

describe('runExtension', () => {
  let rootContainer: HTMLElement;
  let formatContainer: HTMLElement;
  let rawContainer: HTMLElement;
  let queryContainer: HTMLElement;
  let body: HTMLElement;
  let attachShadowSpy: ReturnType<typeof rstest.spyOn>;

  beforeEach(() => {
    rootContainer = createElement({ element: 'div' });
    formatContainer = createElement({ element: 'div' });
    rawContainer = createElement({ element: 'div' });
    queryContainer = createElement({ element: 'div' });
    body = createElement({ element: 'body' });

    attachShadowSpy = rstest.spyOn(document.body, 'attachShadow')
      .mockImplementation(body.attachShadow.bind(body));

    wrapMock(buildContainers)
      .mockReturnValue({ rootContainer, formatContainer, rawContainer, queryContainer });
  });

  afterEach(() => {
    rstest.clearAllMocks();
    rstest.resetAllMocks();
  });

  test('when code node doesn\'t exists', async () => {
    wrapMock(findNodeWithCode).mockResolvedValue(null);

    await runExtension();

    expect(buildContainers).not.toHaveBeenCalled();
    expect(attachShadowSpy).not.toHaveBeenCalled();
    expect(registerStyle).not.toHaveBeenCalled();
  });

  test('when content is too large', async () => {
    const preNode = createElement({
      element: 'pre',
      content: 'X'.repeat(LIMIT + 10),
    });

    wrapMock(findNodeWithCode).mockResolvedValue(preNode);
    wrapMock(sendMessage).mockResolvedValue(tNull());
    wrapMock(format).mockResolvedValue('formatted');

    await runExtension();

    expect(buildContainers).toHaveBeenCalled();
    expect(attachShadowSpy).toHaveBeenCalled();
    expect(registerStyle).toHaveBeenCalled();
    expect(format).toHaveBeenCalled();

    expect(tokenize).not.toHaveBeenCalled();
  });

  test('when content is too large and format returns error', async () => {
    const preNode = createElement({
      element: 'pre',
      content: 'X'.repeat(LIMIT + 10),
    });

    wrapMock(findNodeWithCode).mockResolvedValue(preNode);
    wrapMock(format).mockRejectedValue({ type: 'error', scope: 'worker', error: 'Invalid JSON' });

    await runExtension();

    expect(format).toHaveBeenCalled();
    expect(rawContainer.querySelector('.error')).not.toBeNull();
    expect(tokenize).not.toHaveBeenCalled();
  });

  test('when content is base', async () => {
    const preNode = createElement({
      element: 'pre',
      content: '{ "key": "value" }',
    });

    wrapMock(findNodeWithCode).mockResolvedValue(preNode);
    wrapMock(sendMessage).mockResolvedValue(tNull());
    wrapMock(tokenize).mockResolvedValue(
      tObject(
        tProperty('key', tString('value')),
      ),
    );

    await runExtension();

    expect(buildContainers).toHaveBeenCalled();
    expect(attachShadowSpy).toHaveBeenCalled();
    expect(registerStyle).toHaveBeenCalled();
    expect(tokenize).toHaveBeenCalled();

    expect(format).not.toHaveBeenCalled();
  });

  test('when tokenize returns error response', async () => {
    const preNode = createElement({
      element: 'pre',
      content: '{ invalid }',
    });

    wrapMock(findNodeWithCode).mockResolvedValue(preNode);
    wrapMock(tokenize).mockRejectedValue({ type: 'error', scope: 'worker', error: 'Parse error' });

    await runExtension();

    expect(tokenize).toHaveBeenCalled();
    expect(formatContainer.querySelector('.error')).not.toBeNull();
  });

  describe('toolbox event handlers', () => {
    let toolboxElement: ToolboxElement;

    beforeEach(async () => {
      rstest.useFakeTimers();

      // Use prototype directly to avoid infinite recursion when spy is reset between tests
      const nativeCreate = Document.prototype.createElement;
      rstest.spyOn(document, 'createElement').mockImplementation((tag: string) => {
        const el = nativeCreate.call(document, tag);
        if (tag === 'mjf-toolbox') {
          toolboxElement = el as ToolboxElement;
        }
        return el;
      });

      const preNode = createElement({ element: 'pre', content: '{ "key": "value" }' });
      wrapMock(findNodeWithCode).mockResolvedValue(preNode);
      wrapMock(tokenize).mockResolvedValue(tObject(tProperty('key', tString('value'))));

      await runExtension();
      rstest.runAllTimers();
      rstest.useRealTimers();
    });

    test('tab-changed: query', () => {
      toolboxElement.dispatchEvent(new CustomEvent('tab-changed', { detail: 'query' }));

      expect(rootContainer.classList.contains('query')).toBe(true);
      expect(rootContainer.classList.contains('raw')).toBe(false);
      expect(rootContainer.classList.contains('formatted')).toBe(false);
    });

    test('tab-changed: raw', () => {
      toolboxElement.dispatchEvent(new CustomEvent('tab-changed', { detail: 'raw' }));

      expect(rootContainer.classList.contains('raw')).toBe(true);
    });

    test('tab-changed: formatted', () => {
      toolboxElement.dispatchEvent(new CustomEvent('tab-changed', { detail: 'formatted' }));

      expect(rootContainer.classList.contains('formatted')).toBe(true);
    });

    test('download event: raw', async () => {
      wrapMock(download).mockResolvedValue(undefined);
      toolboxElement.dispatchEvent(new CustomEvent('download', { detail: 'raw' }));
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(download).toHaveBeenCalledWith('raw', expect.any(String), expect.stringContaining('.json'));
    });

    test('download event: formatted adds suffix', async () => {
      wrapMock(download).mockResolvedValue(undefined);
      toolboxElement.dispatchEvent(new CustomEvent('download', { detail: 'formatted' }));
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(download).toHaveBeenCalledWith('formatted', expect.any(String), expect.stringContaining('_formatted'));
    });

    test('download event: errors are rendered', async () => {
      wrapMock(download).mockRejectedValue({ type: 'error', scope: 'worker', error: 'failed' });
      toolboxElement.dispatchEvent(new CustomEvent('download', { detail: 'formatted' }));
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(rootContainer.querySelector('.error')).not.toBeNull();
    });

    test('jq-query: success calls jq and pushHistory', async () => {
      wrapMock(jq).mockResolvedValue(tObject(tProperty('key', tString('value'))));
      wrapMock(pushHistory).mockResolvedValue(undefined);

      toolboxElement.dispatchEvent(new CustomEvent('jq-query', { detail: '.key' }));
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(jq).toHaveBeenCalledWith(expect.any(String), '.key');
      expect(pushHistory).toHaveBeenCalled();
    });

    test('jq-query error: jq scope sets toolbox error', async () => {
      wrapMock(jq).mockRejectedValue({ type: 'error', scope: 'jq', error: 'syntax error' });

      toolboxElement.dispatchEvent(new CustomEvent('jq-query', { detail: '.invalid' }));
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(toolboxElement.error).toBe('syntax error');
    });

    test('jq-query error: non-jq scope appends error to root', async () => {
      const consoleSpy = rstest.spyOn(console, 'error').mockImplementation(() => undefined);
      wrapMock(jq).mockRejectedValue({ type: 'error', scope: 'worker', error: 'worker error', stack: 'stack' });

      toolboxElement.dispatchEvent(new CustomEvent('jq-query', { detail: '.key' }));
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(rootContainer.children.length).toBeGreaterThan(0);
      expect(consoleSpy).not.toHaveBeenCalled();
    });

    test('jq-query error: non-ErrorNode logs to console', async () => {
      const consoleSpy = rstest.spyOn(console, 'error').mockImplementation(() => undefined);
      wrapMock(jq).mockRejectedValue('unexpected error');

      toolboxElement.dispatchEvent(new CustomEvent('jq-query', { detail: '.key' }));
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(consoleSpy).toHaveBeenCalledWith('unexpected error');
    });
  });
});
