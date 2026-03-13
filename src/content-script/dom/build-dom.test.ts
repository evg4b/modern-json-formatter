import { tArray, tBool, tNull, tNumber, tObject, tProperty, tString, tTuple } from '@testing/json';
import { type TokenNode } from '@wasm/types';
import assert from 'node:assert';
import { buildDom } from './build-dom';
import { describe, expect, rstest, test } from '@rstest/core';

describe('buildDom', () => {
  const parsedJson: TokenNode = {
    type: 'object',
    properties: [
      {
        key: 'links',
        value: {
          type: 'array',
          items: [
            {
              type: 'string',
              value: 'https://www.youtube.com/watch?v=QH2-TGUlwu4',
              variant: 'url',
            },
            {
              type: 'string',
              value: '/json-formatter/examples/2-array-root.json',
              variant: 'url',
            },
          ],
        },
      },
      { key: 'foo', value: { type: 'string', value: 'bar' } },
      {
        key: 'baz',
        value: {
          type: 'object',
          properties: [
            {
              key: 'empty object',
              value: { type: 'object', properties: [] },
            },
            {
              key: 'primitives',
              value: {
                type: 'array',
                items: [
                  { type: 'null' },
                  { type: 'boolean', value: true },
                  {
                    value: false,
                    type: 'boolean',
                  },
                  { type: 'number', value: '1' },
                  { type: 'number', value: '1234567890' },
                  {
                    value: '1.23456789',
                    type: 'number',
                  },
                ],
              },
            },
            {
              key: 'emoji',
              value: { type: 'string', value: '🐔 🐝 🐲 ☎️ 🫠 🕵️‍♂️ 🦓' },
            },
            {
              key: 'long text',
              value: {
                type: 'string',
                value:
                  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n\nSed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?',
              },
            },
            {
              key: 'non-latin text',
              value: {
                type: 'string',
                value:
                  '待ヌ歌討属実チ拠総ぼおっ女結ゆ並一件た県合ヘケカサ時物札アヨトコ両情ホ新9情ろめの難気ぞ振近ヲウミイ優感たイうろ本金ヤテセソ先9量時フめひの。核リフ真朝7員え強展さたざ記元ぽみ帯検や道査ラミア局藏転司かあう全紀ユルホキ明吉ウニ普動むびえ都記そ国山あぞりく馬吉ー意後ロコ就前テノヤラ毎徐けや一録よな',
              },
            },
            {
              key: 'deeper',
              value: {
                type: 'object',
                properties: [
                  {
                    key: '1',
                    value: {
                      properties: [
                        {
                          value: {
                            type: 'object',
                            properties: [
                              {
                                key: '3',
                                value: {
                                  type: 'object',
                                  properties: [
                                    {
                                      key: '4',
                                      value: {
                                        type: 'object',
                                        properties: [
                                          {
                                            key: '5',
                                            value: {
                                              type: 'object',
                                              properties: [
                                                {
                                                  key: '6',
                                                  value: {
                                                    type: 'object',
                                                    properties: [
                                                      {
                                                        key: '7',
                                                        value: {
                                                          type: 'boolean',
                                                          value: true,
                                                        },
                                                      },
                                                    ],
                                                  },
                                                },
                                              ],
                                            },
                                          },
                                        ],
                                      },
                                    },
                                  ],
                                },
                              },
                            ],
                          },
                          key: '2',
                        },
                      ],
                      type: 'object',
                    },
                  },
                  {
                    key: 'deeper',
                    value: {
                      properties: [
                        {
                          key: 'deeper',
                          value: {
                            type: 'object',
                            properties: [
                              {
                                key: 'deeper',
                                value: {
                                  type: 'object',
                                  properties: [
                                    {
                                      value: {
                                        type: 'object',
                                        properties: [
                                          {
                                            key: 'deeper',
                                            value: {
                                              type: 'object',
                                              properties: [
                                                {
                                                  key: 'deeper',
                                                  value: {
                                                    type: 'boolean',
                                                    value: false,
                                                  },
                                                },
                                              ],
                                            },
                                          },
                                        ],
                                      },
                                      key: 'deeper',
                                    },
                                  ],
                                },
                              },
                            ],
                          },
                        },
                      ],
                      type: 'object',
                    },
                  },
                ],
              },
            },
            { key: 'empty array', value: { type: 'array', items: [] } },
          ],
        },
      },
    ],
  };

  const expected = {
    links: ['https://www.youtube.com/watch?v=QH2-TGUlwu4', '/json-formatter/examples/2-array-root.json'],
    foo: 'bar',
    baz: {
      'empty array': [] as unknown[],
      'empty object': {},
      'primitives': [null, true, false, 1, 1234567890, 1.23456789],
      'emoji': '🐔 🐝 🐲 ☎️ 🫠 🕵️‍♂️ 🦓',
      'long text':
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n\nSed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?',
      'non-latin text':
        '待ヌ歌討属実チ拠総ぼおっ女結ゆ並一件た県合ヘケカサ時物札アヨトコ両情ホ新9情ろめの難気ぞ振近ヲウミイ優感たイうろ本金ヤテセソ先9量時フめひの。核リフ真朝7員え強展さたざ記元ぽみ帯検や道査ラミア局藏転司かあう全紀ユルホキ明吉ウニ普動むびえ都記そ国山あぞりく馬吉ー意後ロコ就前テノヤラ毎徐けや一録よな',
      'deeper': {
        deeper: {
          deeper: {
            deeper: {
              deeper: {
                deeper: {
                  deeper: false,
                },
              },
            },
          },
        },
        1: {
          2: {
            3: {
              4: {
                5: {
                  6: {
                    7: true,
                  },
                },
              },
            },
          },
        },
      },
    },
  };

  test('should render valid JSON', () => {
    const result = buildDom(parsedJson);

    const invisibleElements = [
      ...Array.from(result.querySelectorAll('.toggle')),
      ...Array.from(result.querySelectorAll('.ellipsis')),
      ...Array.from(result.querySelectorAll('.properties-count')),
      ...Array.from(result.querySelectorAll('.items-count')),
    ];

    invisibleElements.forEach(element => element.remove());

    const text = result.textContent;
    assert(!!text, 'No text content found');
    const parsed = JSON.parse(text) as unknown;

    expect(parsed).toEqual(expected);
  });

  test('should throw error for invalid type', () => {
    const invalidJson = {
      ...parsedJson,
      type: 'invalid',
    } as unknown as TokenNode;

    expect(() => buildDom(invalidJson)).toThrow('Unknown type');
  });

  describe('tuple', () => {
    test('should render a div with class tuple for TupleNode', () => {
      const tuple = tTuple(tString('a'), tNumber('1'));
      const dom = buildDom(tuple as unknown as TokenNode);

      expect(dom.tagName.toLowerCase()).toBe('div');
      expect(dom.classList.contains('tuple')).toBe(true);
    });

    test('should render children for each tuple item', () => {
      const tuple = tTuple(tString('x'), tBool(true), tNull());
      const dom = buildDom(tuple as unknown as TokenNode);

      expect(dom.children).toHaveLength(3);
    });
  });

  describe('event handlers', () => {
    describe('keydown / keyup — active-links class', () => {
      test('should add active-links class on Meta keydown', () => {
        const dom = buildDom(tString('test'));
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Meta', bubbles: true }));
        expect(dom.classList.contains('active-links')).toBe(true);
        document.dispatchEvent(new KeyboardEvent('keyup', { key: 'Meta', bubbles: true }));
      });

      test('should add active-links class on Control keydown', () => {
        const dom = buildDom(tString('test'));
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Control', bubbles: true }));
        expect(dom.classList.contains('active-links')).toBe(true);
        document.dispatchEvent(new KeyboardEvent('keyup', { key: 'Control', bubbles: true }));
      });

      test('should not add active-links for other keys', () => {
        const dom = buildDom(tString('test'));
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Shift', bubbles: true }));
        expect(dom.classList.contains('active-links')).toBe(false);
      });

      test('should remove active-links class on Meta keyup', () => {
        const dom = buildDom(tString('test'));
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Meta', bubbles: true }));
        document.dispatchEvent(new KeyboardEvent('keyup', { key: 'Meta', bubbles: true }));
        expect(dom.classList.contains('active-links')).toBe(false);
      });

      test('should remove active-links class on Control keyup', () => {
        const dom = buildDom(tString('test'));
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Control', bubbles: true }));
        document.dispatchEvent(new KeyboardEvent('keyup', { key: 'Control', bubbles: true }));
        expect(dom.classList.contains('active-links')).toBe(false);
      });

      test('should not remove active-links for other keys on keyup', () => {
        const dom = buildDom(tString('test'));
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Meta', bubbles: true }));
        document.dispatchEvent(new KeyboardEvent('keyup', { key: 'Shift', bubbles: true }));
        expect(dom.classList.contains('active-links')).toBe(true);
        // cleanup
        document.dispatchEvent(new KeyboardEvent('keyup', { key: 'Meta', bubbles: true }));
      });
    });

    describe('click — toggle collapse', () => {
      test('should toggle collapsed class on parent when toggle element is clicked', () => {
        const dom = buildDom(tObject(tProperty('key', tString('val'))));
        const toggleEl = dom.querySelector('.toggle') as HTMLElement;
        const parent = toggleEl.parentNode as HTMLElement;

        toggleEl.click();

        expect(parent.classList.contains('collapsed')).toBe(true);
      });

      test('should un-toggle collapsed class on second click', () => {
        const dom = buildDom(tObject(tProperty('key', tString('val'))));
        const toggleEl = dom.querySelector('.toggle') as HTMLElement;
        const parent = toggleEl.parentNode as HTMLElement;

        toggleEl.click();
        toggleEl.click();

        expect(parent.classList.contains('collapsed')).toBe(false);
      });

      test('should open url link when Meta+click on url element', () => {
        const openSpy = rstest.spyOn(window, 'open').mockImplementation(() => null);

        const dom = buildDom(tString('https://example.com', 'url'));
        const urlEl = dom.querySelector('.url') as HTMLElement;
        urlEl.setAttribute('href', 'https://example.com');

        document.body.appendChild(dom);
        urlEl.dispatchEvent(new MouseEvent('click', { bubbles: true, metaKey: true }));
        document.body.removeChild(dom);

        expect(openSpy).toHaveBeenCalledWith('https://example.com', '_blank', 'noopener,noreferrer');
        openSpy.mockRestore();
      });

      test('should open email link when Ctrl+click on email element', () => {
        const openSpy = rstest.spyOn(window, 'open').mockImplementation(() => null);

        const dom = buildDom(tString('test@example.com', 'email'));
        const emailEl = dom.querySelector('.email') as HTMLElement;
        emailEl.setAttribute('href', 'mailto:test@example.com');

        document.body.appendChild(dom);
        emailEl.dispatchEvent(new MouseEvent('click', { bubbles: true, ctrlKey: true }));
        document.body.removeChild(dom);

        expect(openSpy).toHaveBeenCalledWith('mailto:test@example.com', '_blank', 'noopener,noreferrer');
        openSpy.mockRestore();
      });

      test('should not open url without Meta/Ctrl key', () => {
        const openSpy = rstest.spyOn(window, 'open').mockImplementation(() => null);

        const dom = buildDom(tString('https://example.com', 'url'));
        const urlEl = dom.querySelector('.url') as HTMLElement;
        urlEl.setAttribute('href', 'https://example.com');

        document.body.appendChild(dom);
        urlEl.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        document.body.removeChild(dom);

        expect(openSpy).not.toHaveBeenCalled();
        openSpy.mockRestore();
      });
    });
  });

  describe('expand/collapse', () => {
    describe('should not render toggle', () => {
      const table: { name: string; input: TokenNode }[] = [
        { name: 'empty object', input: tObject() },
        { name: 'empty array', input: tArray() },
        { name: 'string', input: tString('foo') },
        { name: 'number', input: tNumber('1') },
        { name: 'boolean', input: tBool(true) },
        { name: 'null', input: tNull() },
      ];

      test.each(table)('for $name', ({ input }) => {
        const dom = buildDom(input);

        expect(dom.querySelector('.toggle')).toBeNull();
      });
    });

    describe('should render toggle', () => {
      const table: { name: string; input: TokenNode; expected: number }[] = [
        {
          name: 'object with properties',
          input: tObject(tProperty('foo', tString('bar'))),
          expected: 1,
        },
        {
          name: 'object with nested objects',
          input: tObject(tProperty('foo', tObject(tProperty('bar', tObject(tProperty('baz', tString('baz'))))))),
          expected: 3,
        },
        {
          name: 'object with nested arrays',
          input: tObject(
            tProperty('foo', tObject(tProperty('bar', tArray(tString('baz'), tString('qux'), tString('quux'))))),
          ),
          expected: 3,
        },
        {
          name: 'array with elements',
          input: tArray(tString('foo')),
          expected: 1,
        },
        {
          name: 'array with objects',
          input: tArray(tObject(tProperty('foo', tString('bar')))),
          expected: 2,
        },
        {
          name: 'array with nested objects',
          input: tArray(
            tObject(tProperty('foo', tObject(tProperty('bar', tObject(tProperty('baz', tString('baz'))))))),
          ),
          expected: 4,
        },
        {
          name: 'array with nested arrays',
          input: tArray(
            tArray(tString('baz'), tString('qux'), tString('quux')),
            tArray(tString('baz'), tString('qux'), tString('quux')),
          ),
          expected: 3,
        },
      ];

      test.each(table)('for $name', ({ input, expected }) => {
        const dom = buildDom(input);

        const toggles = dom.querySelectorAll('.toggle');

        expect(toggles.length).toEqual(expected);
      });
    });

    describe('should not render info node', () => {
      const table: { name: string; input: TokenNode }[] = [
        { name: 'empty object', input: tObject() },
        { name: 'empty array', input: tArray() },
        { name: 'string', input: tString('foo') },
        { name: 'number', input: tNumber('1') },
        { name: 'boolean', input: tBool(true) },
        { name: 'null', input: tNull() },
      ];

      test.each(table)('for $name', ({ input }) => {
        const dom = buildDom(input);

        expect(dom.querySelector('.properties-count')).toBeNull();
        expect(dom.querySelector('.items-count')).toBeNull();
      });
    });

    describe('should render info node', () => {
      describe('properties count', () => {
        const table: { name: string; input: TokenNode; expected: number }[] = [
          {
            name: 'object with properties',
            input: tObject(tProperty('foo', tString('bar'))),
            expected: 1,
          },
          {
            name: 'object with nested objects',
            input: tObject(tProperty('foo', tObject(tProperty('bar', tObject(tProperty('baz', tString('baz'))))))),
            expected: 3,
          },
          {
            name: 'object with nested arrays',
            input: tObject(
              tProperty('foo', tObject(tProperty('bar', tArray(tString('baz'), tString('qux'), tString('quux'))))),
            ),
            expected: 2,
          },
        ];

        test.each(table)('for $name', ({ input, expected }) => {
          const dom = buildDom(input);

          const toggles = dom.querySelectorAll('.properties-count');

          expect(toggles.length).toEqual(expected);
        });
      });

      describe('items count', () => {
        const table: { name: string; input: TokenNode; expected: number }[] = [
          {
            name: 'array with elements',
            input: tArray(tString('foo')),
            expected: 1,
          },
          {
            name: 'array with objects',
            input: tArray(tObject(tProperty('foo', tString('bar')))),
            expected: 1,
          },
          {
            name: 'array with nested objects',
            input: tArray(
              tObject(tProperty('foo', tObject(tProperty('bar', tObject(tProperty('baz', tString('baz'))))))),
            ),
            expected: 1,
          },
          {
            name: 'array with nested arrays',
            input: tArray(
              tArray(tString('baz'), tString('qux'), tString('quux')),
              tArray(tString('baz'), tString('qux'), tString('quux')),
            ),
            expected: 3,
          },
        ];

        test.each(table)('for $name', ({ input, expected }) => {
          const dom = buildDom(input);

          const toggles = dom.querySelectorAll('.items-count');

          expect(toggles.length).toEqual(expected);
        });
      });
    });
  });
});
