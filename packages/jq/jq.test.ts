import '@testing/browser.mock';
import { tNumber } from '@testing/json';
import { TokenizerResponse } from '@packages/tokenizer';
import { readFileSync } from 'fs';
import { jq } from './index';
import testCases from './jq.test-cases.json';
import '../../testing/jest-soft-equal';

jest.mock('../shared/wasm_helpers.ts', () => ({
  loadWasm: (_: string, imports: WebAssembly.Imports) => {
    const data = readFileSync('packages/jq/jq.wasm');
    return WebAssembly.instantiate(data, imports);
  },
}));

interface TestCase {
  title: string;
  sections: {
    title: string;
    skip?: boolean;
    examples: {
      query: string;
      input: string;
      skip?: boolean;
      output: TokenizerResponse;
    }[]
  }[];
}

describe('jq', () => {
  test('should return a TokenizerResponse', async () => {
    const data = await jq('{ "data": 123 }', '.data');

    expect(data).toEqual(tNumber(`123`));
  });

  describe.each(testCases as TestCase[])('$title', ({ sections }) => {
    const activeSections = sections.filter(section => !section.skip)
    describe.each(activeSections)('$title', ({ examples }) => {
      const active = examples.filter(p => !p.skip);

      test.each(active)('$input => $query', async ({ input, query, output }) => {
        const data = await jq(input, query);

        expect(data).toSoftEqual(output);
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
