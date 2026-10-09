import { describe, expect, test } from '@rstest/core';
import { extractFileName } from './helpers';

describe('extractFileName', () => {
  const cases = [
    { url: null, expected: 'data' },
    { url: undefined, expected: 'data' },
    { url: '', expected: 'data' },
    { url: 'https://example.com/api/data.json', expected: 'data' },
    { url: 'https://example.com/api/response', expected: 'response' },
    { url: 'https://example.com/', expected: 'example-com' },
    { url: 'https://api.example.com/v1/users', expected: 'users' },
    { url: 'https://example.com/data.json?foo=bar', expected: 'data' },
    { url: 'file:///Users/user/data.json', expected: 'data' },
    { url: 'file:///Users/user/response', expected: 'response' },
    { url: 'file:///data.json', expected: 'data' },
    { url: 'file:///path/to/my-file.json', expected: 'my-file' },
  ];

  test.each(cases)('$url → $expected', ({ url, expected }) => {
    expect(extractFileName(url)).toBe(expected);
  });
});
