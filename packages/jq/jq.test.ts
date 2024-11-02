import '@testing/browser.mock';
import { tNumber } from '@testing/json';
import { readFileSync } from 'fs';
import { jq } from './index';
import testCases from './jq.test-cases.json';

jest.mock('../shared/wasm_helpers.ts', () => ({
  loadWasm: (_: string, imports: WebAssembly.Imports) => {
    const data = readFileSync('packages/jq/jq.wasm');
    return WebAssembly.instantiate(data, imports);
  },
}));

describe('jq', () => {
  test('should return a TokenizerResponse', async () => {
    const data = await jq('{ "data": 123 }', '.data');

    expect(data).toEqual(tNumber(`123`));
  });

  describe.each(testCases)('$title', ({ sections }) => {
    describe.each(sections as any[])('$title', ({ examples }) => {
      // @ts-ignore
      test.each(examples)('%p', async (test: any) => {
        const data = await jq(test.input, test.query);

        expect(data).toEqual(test.output)
      });
    });
  });
});


const sections = document.querySelectorAll('main section');
Array.from(sections).flatMap((section) => {
  const header = section.querySelector('h2');
  if (!header) {
    return [];
  }

  return {
    title: header.innerText,
    sections: Array.from(section.querySelectorAll('section')).flatMap(subSection => {
      const header = subSection.querySelector('h3');
      if (!header) {
        return [];
      }

      return {
        title: header.innerText,
        items: Array.from(subSection.querySelectorAll('table'))
          .map(example => {
            return Array.from(example.querySelectorAll('tr td'))
              .map(p => p.textContent);
          }),
      };
    }),
  };
});
