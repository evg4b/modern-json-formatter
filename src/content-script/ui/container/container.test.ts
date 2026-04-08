import { afterEach, beforeEach, describe, expect, rstest, test } from '@rstest/core';
import { ContainerElement } from './container';

describe('ContainerElement', () => {
  let container: ContainerElement;

  beforeEach(async () => {
    container = document.createElement('mjf-container') as ContainerElement;
    document.body.appendChild(container);
    await container.updateComplete;
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  test('should be an instance of ContainerElement', () => {
    expect(container).toBeInstanceOf(ContainerElement);
  });

  test('type defaults to formatted', () => {
    expect(container.type).toBe('formatted');
  });

  test('type can be changed to raw', async () => {
    container.type = 'raw';
    await container.updateComplete;

    expect(container.type).toBe('raw');
  });

  test('type can be changed to query', async () => {
    container.type = 'query';
    await container.updateComplete;

    expect(container.type).toBe('query');
  });

  test('startLoading sets loading attribute', () => {
    container.startLoading();
    expect(container.getAttribute('loading')).toBe('true');
  });

  test('stopLoading removes loading attribute', () => {
    container.startLoading();
    container.stopLoading();
    expect(container.hasAttribute('loading')).toBe(false);
  });

  test('setError calls console.error', () => {
    const consoleSpy = rstest.spyOn(console, 'error').mockImplementation(() => undefined);
    container.setError(new Error('fail'));
    expect(consoleSpy).toHaveBeenCalledWith(new Error('fail'));
  });

  test('setRawContent replaces raw container children', () => {
    const child = document.createElement('pre');
    container.setRawContent(child);
    container.type = 'raw';
  });

  test('setFormattedContent replaces formatted container children', () => {
    const child = document.createElement('div');
    container.setFormattedContent(child);
  });

  test('setQueryContent replaces query container children', () => {
    const child = document.createElement('div');
    container.setQueryContent(child);
  });

  test('message appends mjf-floating-message to shadow DOM', () => {
    container.message('Header', 'Body text');
    expect((container as ContainerElement & { renderRoot: ShadowRoot }).renderRoot.querySelector('mjf-floating-message')).not.toBeNull();
  });
});
