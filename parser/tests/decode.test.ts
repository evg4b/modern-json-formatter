import { describe } from '@jest/globals';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { loadWasm } from './load-wasm';

declare function parseJSON(data: string): unknown;

describe('parser.wasm', () => {
  loadWasm();


  test('should be defined', () => {
    expect(parseJSON).toBeDefined();
  });

  describe('parse json', () => {
    let jsonFiles: string[] = [
      'test-case-1.json',
      'test-case-2.json',
      'test-case-3.json',
      'test-case-4.json',
      'test-case-5.json',
      'test-case-6.json',
    ];

    const testCases = jsonFiles.map((file) => ({ file }));
    test.each(testCases)('$file', async ({ file }) => {
      const fileData = await readFile(resolve(__dirname, 'test-cases', file), 'utf-8');
      const parsed = parseJSON(fileData);
      expect(parsed).toMatchSnapshot();
    });
  });

  describe('parse json', () => {
    let jsonFiles: string[] = [
      'negative-test-case-1.json',
      'negative-test-case-2.json',
    ];

    const testCases = jsonFiles.map((file) => ({ file }));
    test.each(testCases)('$file', async ({ file }) => {
      const fileData = await readFile(resolve(__dirname, 'test-cases', file), 'utf-8');
      const parsed = parseJSON(fileData);
      expect(parsed).toMatchSnapshot();
    });
  });
});
