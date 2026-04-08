import { afterEach, beforeEach, describe, expect, rstest, test } from '@rstest/core';
import '@testing/browser.mock';
import '@testing/background.mock';
import '@testing/settings.mock';
import { download, format, jq, pushHistory, tokenize } from '@core/background';
import { getSettings } from '@core/settings';
import { sendMessage } from '@core/browser';
import { createElement } from '@core/dom';
import { registerStyle } from '@core/ui/helpers';
import { tNull, tObject, tProperty, tString } from '@testing/json';
import { wrapMock } from '@testing/helpers';
import { LIMIT, ONE_MEGABYTE_LENGTH, runExtension } from './extension';
import { ToolboxElement } from './ui/toolbox/toolbox';
import { findNodeWithCode } from './json-detector';
import type { ContainerElement } from './ui/container/container';

rstest.mock('./json-detector', () => ({
  findNodeWithCode: rstest.fn().mockName('findNodeWithCode'),
}));

rstest.mock('@core/ui/helpers', () => ({
  registerStyle: rstest.fn().mockName('registerStyle'),
  FloatingMessageElement: rstest.fn().mockName('FloatingMessageElement'),
}));

describe('runExtension', () => {
  let shadowRoot: ShadowRoot;
  let body: HTMLElement;
  let attachShadowSpy: ReturnType<typeof rstest.spyOn>;

  beforeEach(() => {
    body = createElement({ element: 'body' });

    const boundAttachShadow = body.attachShadow.bind(body);
    attachShadowSpy = rstest.spyOn(document.body, 'attachShadow')
      .mockImplementation((init: ShadowRootInit) => {
        shadowRoot = boundAttachShadow(init);
        return shadowRoot;
      });
  });

  afterEach(() => {
    rstest.clearAllMocks();
    rstest.resetAllMocks();
  });

  test('when code node doesn\'t exists', async () => {
    wrapMock(findNodeWithCode).mockResolvedValue(null);

    await runExtension();

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

    expect(attachShadowSpy).toHaveBeenCalled();
    expect(registerStyle).toHaveBeenCalled();
    expect(format).toHaveBeenCalled();

    expect(tokenize).not.toHaveBeenCalled();
  });

  test('when content is too large and format returns error object', async () => {
    const preNode = createElement({
      element: 'pre',
      content: 'X'.repeat(LIMIT + 10),
    });

    wrapMock(findNodeWithCode).mockResolvedValue(preNode);
    wrapMock(format).mockResolvedValue({ type: 'error', scope: 'worker', error: 'Invalid JSON' });

    await runExtension();

    const containerElement = shadowRoot.querySelector('mjf-container') as ContainerElement;
    expect(format).toHaveBeenCalled();
    expect(containerElement.type).toBe('raw');
    expect(tokenize).not.toHaveBeenCalled();
  });

  test('when content is too large and format throws', async () => {
    const preNode = createElement({
      element: 'pre',
      content: 'X'.repeat(LIMIT + 10),
    });

    const consoleSpy = rstest.spyOn(console, 'error').mockImplementation(() => undefined);
    wrapMock(findNodeWithCode).mockResolvedValue(preNode);
    wrapMock(format).mockRejectedValue({ type: 'error', scope: 'worker', error: 'Invalid JSON' });

    await runExtension();

    expect(format).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalled();
    expect(tokenize).not.toHaveBeenCalled();
  });

  test('when content is within a custom maxFileSize setting, tokenizes normally', async () => {
    wrapMock(getSettings).mockResolvedValue({
      buttons: { query: true, formatted: true, raw: true, download: true },
      downloadMode: 'dropdown',
      maxFileSize: 5,
    });

    const preNode = createElement({
      element: 'pre',
      // 4 MB — above default 3 MB limit but below the custom 5 MB limit
      content: 'X'.repeat(ONE_MEGABYTE_LENGTH * 4),
    });

    wrapMock(findNodeWithCode).mockResolvedValue(preNode);
    wrapMock(tokenize).mockResolvedValue(tObject(tProperty('key', tString('value'))));

    await runExtension();

    expect(tokenize).toHaveBeenCalled();
    expect(format).not.toHaveBeenCalled();
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

    expect(attachShadowSpy).toHaveBeenCalled();
    expect(registerStyle).toHaveBeenCalled();
    expect(tokenize).toHaveBeenCalled();

    expect(format).not.toHaveBeenCalled();
  });

  test('when tokenize resolves with error-type response', async () => {
    const consoleSpy = rstest.spyOn(console, 'error').mockImplementation(() => undefined);
    const preNode = createElement({
      element: 'pre',
      content: '{ invalid }',
    });

    wrapMock(findNodeWithCode).mockResolvedValue(preNode);
    wrapMock(tokenize).mockResolvedValue({ type: 'error', error: 'Parse error', scope: 'worker' });

    await runExtension();

    expect(tokenize).toHaveBeenCalled();
    expect(consoleSpy).not.toHaveBeenCalled();
  });

  test('when tokenize returns error response', async () => {
    const preNode = createElement({
      element: 'pre',
      content: '{ invalid }',
    });

    const consoleSpy = rstest.spyOn(console, 'error').mockImplementation(() => undefined);
    wrapMock(findNodeWithCode).mockResolvedValue(preNode);
    wrapMock(tokenize).mockRejectedValue({ type: 'error', scope: 'worker', error: 'Parse error' });

    await runExtension();

    expect(tokenize).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalled();
  });

  describe('toolbox event handlers', () => {
    let containerElement: ContainerElement;
    let toolboxElement: ToolboxElement;

    beforeEach(async () => {
      rstest.useFakeTimers();

      const preNode = createElement({ element: 'pre', content: '{ "key": "value" }' });
      wrapMock(findNodeWithCode).mockResolvedValue(preNode);
      wrapMock(tokenize).mockResolvedValue(tObject(tProperty('key', tString('value'))));

      await runExtension();
      rstest.runAllTimers();
      rstest.useRealTimers();

      containerElement = shadowRoot.querySelector('mjf-container') as ContainerElement;
      toolboxElement = shadowRoot.querySelector('mjf-toolbox') as ToolboxElement;
    });

    test('tab-changed: query', () => {
      toolboxElement.dispatchEvent(new CustomEvent('tab-changed', { detail: 'query' }));

      expect(containerElement.type).toBe('query');
    });

    test('tab-changed: raw', () => {
      toolboxElement.dispatchEvent(new CustomEvent('tab-changed', { detail: 'raw' }));

      expect(containerElement.type).toBe('raw');
    });

    test('tab-changed: formatted', () => {
      toolboxElement.dispatchEvent(new CustomEvent('tab-changed', { detail: 'formatted' }));

      expect(containerElement.type).toBe('formatted');
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

      expect(containerElement.querySelector('mjf-floating-message')).not.toBeNull();
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

      expect(containerElement.children.length).toBeGreaterThan(0);
      expect(consoleSpy).not.toHaveBeenCalled();
    });

    test('jq-query error: non-jq scope without stack trace', async () => {
      rstest.spyOn(console, 'error').mockImplementation(() => undefined);
      wrapMock(jq).mockRejectedValue({ type: 'error', scope: 'worker', error: 'worker error' });

      toolboxElement.dispatchEvent(new CustomEvent('jq-query', { detail: '.key' }));
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(containerElement.children.length).toBeGreaterThan(0);
    });

    test('jq-query error: non-ErrorNode logs to console', async () => {
      const consoleSpy = rstest.spyOn(console, 'error').mockImplementation(() => undefined);
      wrapMock(jq).mockRejectedValue('unexpected error');

      toolboxElement.dispatchEvent(new CustomEvent('jq-query', { detail: '.key' }));
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(consoleSpy).toHaveBeenCalledWith('unexpected error');
    });

    test('download error: falls back to error.message when error.error is absent', async () => {
      wrapMock(download).mockRejectedValue({ message: 'network failure' });
      toolboxElement.dispatchEvent(new CustomEvent('download', { detail: 'formatted' }));
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(containerElement.querySelector('mjf-floating-message')).not.toBeNull();
    });

    test('download error: falls back to raw error when both error and message are absent', async () => {
      wrapMock(download).mockRejectedValue('raw string error');
      toolboxElement.dispatchEvent(new CustomEvent('download', { detail: 'formatted' }));
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(containerElement.querySelector('mjf-floating-message')).not.toBeNull();
    });
  });
});
