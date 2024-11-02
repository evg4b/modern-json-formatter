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
      const active = examples.filter((p: { skip: boolean }) => !p.skip) as Record<string, string>[]
      test.each(active)('%p', async ({ input, query, output }: any) => {
        const data = await jq(input, query);

        expect(data).toEqual(output)
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
