import { afterEach, beforeEach, describe, expect, rstest, test } from "@rstest/core";
import '@testing/browser.mock';
import '@testing/background.mock';
import { format, tokenize } from '@core/background';
import { sendMessage } from '@core/browser';
import { createElement } from '@core/dom';
import { registerStyle } from '@core/ui/helpers';
import { tNull, tObject, tProperty, tString } from '@testing';
import { wrapMock } from '@testing/helpers';
import { LIMIT, runExtension } from './extension';
import { findNodeWithCode } from './json-detector';
import { buildContainers, FloatingMessageElement, ToolboxElement } from './ui';

rstest.mock('./json-detector', () => ({
  findNodeWithCode: rstest.fn().mockName('findNodeWithCode')
}));

rstest.mock('./ui', () => ({
  buildContainers: rstest.fn().mockName('buildContainers'),
}));

rstest.mock('@core/ui/helpers', () => ({
  registerStyle: rstest.fn().mockName('registerStyle'),
  ToolboxElement: rstest.fn().mockName('ToolboxElement'),
  FloatingMessageElement: rstest.fn().mockName('FloatingMessageElement')
}));

describe.skip('runExtension', () => {
  let rootContainer: HTMLElement;
  let formatContainer: HTMLElement;
  let rawContainer: HTMLElement;
  let queryContainer: HTMLElement;
  let body: HTMLElement;
  let spy: ReturnType<typeof rstest.spyOn>;

  beforeEach(() => {
    rootContainer = createElement({ element: 'div' });
    formatContainer = createElement({ element: 'div' });
    rawContainer = createElement({ element: 'div' });
    queryContainer = createElement({ element: 'div' });
    body = createElement({ element: 'body' });

    spy = rstest.spyOn(document.body, 'attachShadow')
      .mockImplementation(body.attachShadow.bind(body));

    wrapMock(buildContainers)
      .mockReturnValue({ rootContainer, formatContainer, rawContainer, queryContainer });

    console.log(ToolboxElement);

    wrapMock(ToolboxElement).mockReturnValue(
      Object.assign(document.createElement('div'), {
        onQueryChanged: rstest.fn(),
        onTabChanged: rstest.fn(),
      }),
    );

    wrapMock(FloatingMessageElement).mockReturnValue(
      createElement({ element: 'div' }),
    );
  });

  afterEach(() => {
    rstest.clearAllMocks();
    rstest.resetAllMocks();
  });

  test('when code node doesn\'t exists', async () => {
    wrapMock(findNodeWithCode).mockResolvedValue(null);
    const spy = rstest.spyOn(document.body, 'attachShadow');

    await runExtension();

    expect(buildContainers).not.toHaveBeenCalled();
    expect(spy).not.toHaveBeenCalled();
    expect(registerStyle).not.toHaveBeenCalled();

    spy.mockRestore();
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
    expect(spy).toHaveBeenCalled();
    expect(registerStyle).toHaveBeenCalled();
    expect(format).toHaveBeenCalled();

    expect(tokenize).not.toHaveBeenCalled();

    spy.mockRestore();
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

    const spy = rstest.spyOn(document.body, 'attachShadow');

    await runExtension();

    expect(buildContainers).toHaveBeenCalled();
    expect(spy).toHaveBeenCalled();
    expect(registerStyle).toHaveBeenCalled();
    expect(tokenize).toHaveBeenCalled();

    expect(format).not.toHaveBeenCalled();

    spy.mockRestore();
  });
});
