import { afterEach, beforeEach, describe, expect, test } from '@rstest/core';
import { ContainerElement } from './container';

describe('ContainerElement', () => {
  let container: ContainerElement;

  beforeEach(async () => {
    container = document.createElement('mjf-container') as ContainerElement;
    document.body.appendChild(container);
    await container.updateComplete;
  });

  const renderRoot = () => Reflect.get(container, 'renderRoot') as ShadowRoot;

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

  test('setRawContent replaces raw container children', async () => {
    const child = document.createElement('pre');
    container.setRawContent(child);
    container.type = 'raw';
    await container.updateComplete;

    expect(renderRoot().contains(child)).toBe(true);
  });

  test('setFormattedContent replaces formatted container children', () => {
    const child = document.createElement('div');
    container.setFormattedContent(child);

    expect(renderRoot().contains(child)).toBe(true);
  });

  test('setQueryContent replaces query container children', async () => {
    const child = document.createElement('div');
    container.setQueryContent(child);
    container.type = 'query';
    await container.updateComplete;

    expect(renderRoot().contains(child)).toBe(true);
  });

  test('set content replaces previous children', () => {
    const first = document.createElement('div');
    const second = document.createElement('div');
    container.setFormattedContent(first);
    container.setFormattedContent(second);

    expect(renderRoot().contains(first)).toBe(false);
    expect(renderRoot().contains(second)).toBe(true);
  });

  test('message appends mjf-floating-message to shadow DOM', () => {
    container.message('Header', 'Body text');
    expect(renderRoot().querySelector('mjf-floating-message')).not.toBeNull();
  });
});
