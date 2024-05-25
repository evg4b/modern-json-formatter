import assert from 'node:assert';
import { tArray, tBool, tNull, tNumber, tObject, tProperty, tString } from '../../testing';
import { buildDom } from './build-dom';

describe('buildDom', () => {
  const parsedJson: ParsedJSON = {
    'type': 'object',
    'properties': [{
      'key': 'links',
      'value': {
        'type': 'array',
        'items': [{ 'type': 'string', 'value': 'https://www.youtube.com/watch?v=QH2-TGUlwu4' }, {
          'type': 'string',
          'value': '/json-formatter/examples/2-array-root.json',
        }],
      },
    }, { 'key': 'foo', 'value': { 'type': 'string', 'value': 'bar' } }, {
      'key': 'baz', 'value': {
        'type': 'object',
        'properties': [{
          'key': 'empty object',
          'value': { 'type': 'object', 'properties': [] },
        }, {
          'key': 'primitives',
          'value': {
            'type': 'array',
            'items': [{ 'type': 'null' }, { 'type': 'bool', 'value': true }, {
              'value': false,
              'type': 'bool',
            }, { 'type': 'number', 'value': '1' }, { 'type': 'number', 'value': '1234567890' }, {
              'value': '1.23456789',
              'type': 'number',
            }],
          },
        }, { 'key': 'emoji', 'value': { 'type': 'string', 'value': '🐔 🐝 🐲 ☎️ 🫠 🕵️‍♂️ 🦓' } }, {
          'key': 'long text',
          'value': {
            'type': 'string',
            'value': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n\nSed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?',
          },
        }, {
          'key': 'non-latin text',
          'value': {
            'type': 'string',
            'value': '待ヌ歌討属実チ拠総ぼおっ女結ゆ並一件た県合ヘケカサ時物札アヨトコ両情ホ新9情ろめの難気ぞ振近ヲウミイ優感たイうろ本金ヤテセソ先9量時フめひの。核リフ真朝7員え強展さたざ記元ぽみ帯検や道査ラミア局藏転司かあう全紀ユルホキ明吉ウニ普動むびえ都記そ国山あぞりく馬吉ー意後ロコ就前テノヤラ毎徐けや一録よな',
          },
        }, {
          'key': 'deeper',
          'value': {
            'type': 'object',
            'properties': [{
              'key': '1',
              'value': {
                'properties': [{
                  'value': {
                    'type': 'object',
                    'properties': [{
                      'key': '3',
                      'value': {
                        'type': 'object',
                        'properties': [{
                          'key': '4',
                          'value': {
                            'type': 'object',
                            'properties': [{
                              'key': '5',
                              'value': {
                                'type': 'object',
                                'properties': [{
                                  'key': '6',
                                  'value': {
                                    'type': 'object',
                                    'properties': [{ 'key': '7', 'value': { 'type': 'bool', 'value': true } }],
                                  },
                                }],
                              },
                            }],
                          },
                        }],
                      },
                    }],
                  }, 'key': '2',
                }], 'type': 'object',
              },
            }, {
              'key': 'deeper',
              'value': {
                'properties': [{
                  'key': 'deeper',
                  'value': {
                    'type': 'object',
                    'properties': [{
                      'key': 'deeper',
                      'value': {
                        'type': 'object',
                        'properties': [{
                          'value': {
                            'type': 'object',
                            'properties': [{
                              'key': 'deeper',
                              'value': {
                                'type': 'object',
                                'properties': [{ 'key': 'deeper', 'value': { 'type': 'bool', 'value': false } }],
                              },
                            }],
                          }, 'key': 'deeper',
                        }],
                      },
                    }],
                  },
                }], 'type': 'object',
              },
            }],
          },
        }, { 'key': 'empty array', 'value': { 'type': 'array', 'items': [] } }],
      },
    }],
  };

  const expected = {
    'links': [
      'https://www.youtube.com/watch?v=QH2-TGUlwu4',
      '/json-formatter/examples/2-array-root.json',
    ],
    'foo': 'bar',
    'baz': {
      'empty array': [],
      'empty object': {},
      'primitives': [
        null,
        true,
        false,
        1,
        1234567890,
        1.23456789,
      ],
      'emoji': '🐔 🐝 🐲 ☎️ 🫠 🕵️‍♂️ 🦓',
      'long text': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n\nSed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?',
      'non-latin text': '待ヌ歌討属実チ拠総ぼおっ女結ゆ並一件た県合ヘケカサ時物札アヨトコ両情ホ新9情ろめの難気ぞ振近ヲウミイ優感たイうろ本金ヤテセソ先9量時フめひの。核リフ真朝7員え強展さたざ記元ぽみ帯検や道査ラミア局藏転司かあう全紀ユルホキ明吉ウニ普動むびえ都記そ国山あぞりく馬吉ー意後ロコ就前テノヤラ毎徐けや一録よな',
      'deeper': {
        'deeper': {
          'deeper': {
            'deeper': {
              'deeper': {
                'deeper': {
                  'deeper': false,
                },
              },
            },
          },
        },
        '1': {
          '2': {
            '3': {
              '4': {
                '5': {
                  '6': {
                    '7': true,
                  },
                },
              },
            },
          },
        },
      },
    },
  };

  it('should render valid JSON', () => {
    const result = buildDom(parsedJson);

    const invisibleElements = [
      ...result.querySelectorAll('.toggle') ?? [],
      ...result.querySelectorAll('.ellipsis') ?? [],
      ...result.querySelectorAll('.properties-count') ?? [],
      ...result.querySelectorAll('.items-count') ?? [],
    ];

    invisibleElements.forEach((element) => element.remove());

    const text = result.textContent;
    assert(!!text, 'No text content found');
    const parsed = JSON.parse(text);

    expect(parsed).toEqual(expected);
  });

  it('should throw error for invalid type', () => {
    const invalidJson = { ...parsedJson, type: 'invalid' } as unknown as ParsedJSON;

    expect(() => buildDom(invalidJson)).toThrow('Unknown type');
  });

  describe('expand/collapse', () => {
    describe('should not render toggle', () => {
      const table: { name: string, input: ParsedJSON }[] = [
        { name: 'empty object', input: tObject() },
        { name: 'empty array', input: tArray() },
        { name: 'string', input: tString('foo') },
        { name: 'number', input: tNumber('1') },
        { name: 'bool', input: tBool(true) },
        { name: 'null', input: tNull() },
      ];

      test.each(table)('for $name', ({ input }) => {
        const dom = buildDom(input);

        expect(dom.querySelector('.toggle')).toBeNull();
      });
    });

    describe('should render toggle', () => {
      const table: { name: string, input: ParsedJSON, expected: number }[] = [
        {
          name: 'object with properties',
          input: tObject(
            tProperty('foo', tString('bar')),
          ),
          expected: 1,
        },
        {
          name: 'object with nested objects',
          input: tObject(
            tProperty('foo', tObject(
              tProperty('bar', tObject(
                tProperty('baz', tString('baz')),
              )),
            )),
          ),
          expected: 3,
        },
        {
          name: 'object with nested arrays',
          input: tObject(
            tProperty('foo', tObject(
              tProperty('bar', tArray(
                tString('baz'),
                tString('qux'),
                tString('quux'),
              )),
            )),
          ),
          expected: 3,
        },
        {
          name: 'empty with elements',
          input: tArray(
            tString('foo'),
          ),
          expected: 1,
        },
        {
          name: 'array with objects',
          input: tArray(
            tObject(
              tProperty('foo', tString('bar')),
            ),
          ),
          expected: 2,
        },
        {
          name: 'array with nested objects',
          input: tArray(
            tObject(
              tProperty('foo', tObject(
                tProperty('bar', tObject(
                  tProperty('baz', tString('baz')),
                )),
              )),
            ),
          ),
          expected: 4,
        },
        {
          name: 'array with nested arrays',
          input: tArray(
            tArray(
              tString('baz'),
              tString('qux'),
              tString('quux'),
            ),
            tArray(
              tString('baz'),
              tString('qux'),
              tString('quux'),
            ),
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
      const table: { name: string, input: ParsedJSON }[] = [
        { name: 'empty object', input: tObject() },
        { name: 'empty array', input: tArray() },
        { name: 'string', input: tString('foo') },
        { name: 'number', input: tNumber('1') },
        { name: 'bool', input: tBool(true) },
        { name: 'null', input: tNull() },
      ];

      test.each(table)('for $name', ({ input }) => {
        const dom = buildDom(input);

        expect(dom.querySelector('.properties-count')).toBeNull();
        expect(dom.querySelector('.items-count')).toBeNull();
      });
    });
  });
});

