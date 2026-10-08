import { describe, expect, test } from '@rstest/core';
import { extractDomainKey, extractFileName } from './helpers';

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

describe('extractDomainKey', () => {
  const cases = [
    { url: null, expected: '' },
    { url: undefined, expected: '' },
    { url: '', expected: '' },
    { url: 'https://example.com/api/data.json', expected: 'example.com' },
    { url: 'https://api.example.com/v1/users', expected: 'api.example.com' },
    { url: 'http://localhost:3000/data.json', expected: 'localhost' },
    { url: 'file:///Users/user/data.json', expected: '/Users/user/data.json' },
    { url: 'file:///data.json', expected: '/data.json' },
    { url: 'file:///path/to/my-file.json', expected: '/path/to/my-file.json' },
    { url: 'file:///C:/Users/user/data.json', expected: '/C:/Users/user/data.json' },
  ];

  test.each(cases)('$url → $expected', ({ url, expected }) => {
    expect(extractDomainKey(url)).toBe(expected);
  });
});
