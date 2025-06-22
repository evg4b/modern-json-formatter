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

jest.mock('./json-detector');
jest.mock('./ui');
jest.mock('@core/ui/helpers');

describe('runExtension', () => {
  let rootContainer: HTMLElement;
  let formatContainer: HTMLElement;
  let rawContainer: HTMLElement;
  let queryContainer: HTMLElement;
  let body: HTMLElement;
  let spy: jest.SpyInstance;

  beforeEach(() => {
    rootContainer = createElement({ element: 'div' });
    formatContainer = createElement({ element: 'div' });
    rawContainer = createElement({ element: 'div' });
    queryContainer = createElement({ element: 'div' });
    body = createElement({ element: 'body' });

    spy = jest.spyOn(document.body, 'attachShadow')
      .mockImplementation(body.attachShadow.bind(body));

    wrapMock(buildContainers)
      .mockReturnValue({ rootContainer, formatContainer, rawContainer, queryContainer });

    wrapMock(ToolboxElement).mockReturnValue(
      Object.assign(document.createElement('div'), {
        onQueryChanged: jest.fn(),
        onTabChanged: jest.fn(),
      }),
    );

    wrapMock(FloatingMessageElement).mockReturnValue(
      createElement({ element: 'div' }),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  test('when code node doesn\'t exists', async () => {
    wrapMock(findNodeWithCode).mockResolvedValue(null);
    const spy = jest.spyOn(document.body, 'attachShadow');

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

    const spy = jest.spyOn(document.body, 'attachShadow');

    await runExtension();

    expect(buildContainers).toHaveBeenCalled();
    expect(spy).toHaveBeenCalled();
    expect(registerStyle).toHaveBeenCalled();
    expect(tokenize).toHaveBeenCalled();

    expect(format).not.toHaveBeenCalled();

    spy.mockRestore();
  });
});
