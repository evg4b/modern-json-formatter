import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, test } from '@rstest/core';
import { throws } from '../content-script/helpers';
import { wait } from './helpers';
import { clearHistory, getDomains, getHistory, pushHistory } from './history';

const cleanup = async () => {
  const items = await indexedDB.databases();
  for (const item of items) {
    const request = indexedDB.deleteDatabase(item.name ?? '');
    request.onblocked = () => throws('Database is blocked');
    await wait(indexedDB.deleteDatabase(item.name ?? ''));
  }
};

describe('getHistory', () => {
  beforeEach(cleanup);

  describe('when history is empty', () => {
    test('should return empty array', async () => {
      const history = await getHistory({ domain: 'unknown', prefix: '' });
      expect(history).toEqual([]);
    });
  });

  describe('when history has some records', () => {
    beforeEach(async () => {
      await pushHistory({ domain: 'example.com', query: '.' });
      await pushHistory({ domain: 'example.com', query: '.[]' });
      await pushHistory({ domain: 'another.com', query: '.' });
    });

    test('should return all records', async () => {
      const history = await getHistory({ domain: 'example.com', prefix: '' });
      expect(history).toEqual(['.[]', '.']);
    });

    test('should return only matched records', async () => {
      const history = await getHistory({ domain: 'example.com', prefix: '.[' });
      expect(history).toEqual(['.[]']);
    });
  });

  describe('when history has many records', () => {
    beforeEach(async () => {
      for (let i = 0; i < 50; i++) {
        await pushHistory({ domain: 'example.com', query: `.[${ i }]` });
      }
    });

    test('should return only 10 records', async () => {
      const history = await getHistory({ domain: 'example.com', prefix: '' });
      expect(history).toHaveLength(10);
      expect(history).toEqual([
        '.[49]', '.[48]', '.[47]', '.[46]', '.[45]',
        '.[44]', '.[43]', '.[42]', '.[41]', '.[40]',
      ]);
    });
  });
});


describe('pushHistory', () => {
  beforeEach(cleanup);

  test('should push history', async () => {
    await pushHistory({ domain: 'example.com', query: 'query1' });
    const history = await getHistory({ domain: 'example.com', prefix: '' });
    expect(history).toEqual(['query1']);
  });

  test('should push history', async () => {
    await pushHistory({ domain: 'example.com', query: '.' });
    await pushHistory({ domain: 'example.com', query: '.[]' });
    await pushHistory({ domain: 'example.com', query: '.' });
    const history = await getHistory({ domain: 'example.com', prefix: '' });
    expect(history).toEqual(['.', '.[]']);
  });
});

describe('clearHistory', () => {
  beforeEach(cleanup);

  beforeEach(async () => {
    for (let i = 0; i < 50; i++) {
      await pushHistory({ domain: 'example.com', query: `.[${ i }]` });
    }
  });

  test('should clear history', async () => {
    await clearHistory();
    const history = await getHistory({ domain: 'example.com', prefix: '' });
    expect(history).toEqual([]);
  });
});


describe('getDomains', () => {
  beforeEach(cleanup);

  beforeEach(async () => {
    for (let i = 0; i < 3; i++) {
      await pushHistory({ domain: 'example.com', query: `.[${ i }]` });
    }

    await pushHistory({ domain: 'sub.example.com', query: `.[0]` });

    for (let i = 0; i < 5; i++) {
      await pushHistory({ domain: 'test.com', query: `.[${ i }]` });
    }

    for (let i = 0; i < 2; i++) {
      await pushHistory({ domain: 'other.net', query: `.[${ i }]` });
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
