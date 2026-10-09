import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, test } from '@rstest/core';
import { throws } from '../content-script/helpers';
import { wait } from './helpers';
import { clearHistory, extractDomainKey, getDomains, getHistory, pushHistory } from './history';

const cleanup = async () => {
  const items = await indexedDB.databases();
  for (const item of items) {
    const request = indexedDB.deleteDatabase(item.name ?? '');
    request.onblocked = () => throws('Database is blocked');
    await wait(request);
  }
};

describe('getHistory', () => {
  beforeEach(cleanup);

  describe('when history is empty', () => {
    test('should return empty array', async () => {
      const history = await getHistory({ url: 'https://unknown/', prefix: '' });
      expect(history).toEqual([]);
    });
  });

  describe('when history has some records', () => {
    beforeEach(async () => {
      await pushHistory({ url: 'https://example.com/', query: '.' });
      await pushHistory({ url: 'https://example.com/', query: '.[]' });
      await pushHistory({ url: 'https://another.com/', query: '.' });
    });

    test('should return all records', async () => {
      const history = await getHistory({ url: 'https://example.com/', prefix: '' });
      expect(history).toEqual(['.[]', '.']);
    });

    test('should return only matched records', async () => {
      const history = await getHistory({ url: 'https://example.com/', prefix: '.[' });
      expect(history).toEqual(['.[]']);
    });
  });

  describe('when history has many records', () => {
    beforeEach(async () => {
      for (let i = 0; i < 50; i++) {
        await pushHistory({ url: 'https://example.com/', query: `.[${i}]` });
      }
    });

    test('should return only 10 records', async () => {
      const history = await getHistory({ url: 'https://example.com/', prefix: '' });
      expect(history).toHaveLength(10);
      expect(history).toEqual([
        '.[49]',
        '.[48]',
        '.[47]',
        '.[46]',
        '.[45]',
        '.[44]',
        '.[43]',
        '.[42]',
        '.[41]',
        '.[40]',
      ]);
    });
  });
});

describe('pushHistory', () => {
  beforeEach(cleanup);

  test('should push history', async () => {
    await pushHistory({ url: 'https://example.com/', query: 'query1' });
    const history = await getHistory({ url: 'https://example.com/', prefix: '' });
    expect(history).toEqual(['query1']);
  });

  test('should deduplicate history entries', async () => {
    await pushHistory({ url: 'https://example.com/', query: '.' });
    await pushHistory({ url: 'https://example.com/', query: '.[]' });
    await pushHistory({ url: 'https://example.com/', query: '.' });
    const history = await getHistory({ url: 'https://example.com/', prefix: '' });
    expect(history).toEqual(['.', '.[]']);
  });
});

describe('clearHistory', () => {
  beforeEach(cleanup);

  beforeEach(async () => {
    for (let i = 0; i < 50; i++) {
      await pushHistory({ url: 'https://example.com/', query: `.[${i}]` });
    }
  });

  test('should clear history', async () => {
    await clearHistory();
    const history = await getHistory({ url: 'https://example.com/', prefix: '' });
    expect(history).toEqual([]);
  });
});

describe('getDomains', () => {
  beforeEach(cleanup);

  beforeEach(async () => {
    for (let i = 0; i < 3; i++) {
      await pushHistory({ url: 'https://example.com/', query: `.[${i}]` });
    }

    await pushHistory({ url: 'https://sub.example.com/', query: '.[0]' });

    for (let i = 0; i < 5; i++) {
      await pushHistory({ url: 'https://test.com/', query: `.[${i}]` });
    }

    for (let i = 0; i < 2; i++) {
      await pushHistory({ url: 'https://other.net/', query: `.[${i}]` });
    }
  });

  test('should return all domains', async () => {
    const domains = await getDomains();
    expect(domains).toEqual([
      { domain: 'test.com', count: 5 },
      { domain: 'example.com', count: 3 },
      { domain: 'other.net', count: 2 },
      { domain: 'sub.example.com', count: 1 },
    ]);
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
