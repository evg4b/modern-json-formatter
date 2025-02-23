import { beforeEach, describe, expect, test } from '@jest/globals';
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
      const history = await getHistory('unknown', '');
      expect(history).toEqual([]);
    });
  });

  describe('when history has some records', () => {
    beforeEach(async () => {
      await pushHistory('example.com', '.');
      await pushHistory('example.com', '.[]');
      await pushHistory('another.com', '.');
    });

    test('should return all records', async () => {
      const history = await getHistory('example.com', '');
      expect(history).toEqual(['.[]', '.']);
    });

    test('should return only matched records', async () => {
      const history = await getHistory('example.com', '.[');
      expect(history).toEqual(['.[]']);
    });
  });

  describe('when history has many records', () => {
    beforeEach(async () => {
      for (let i = 0; i < 50; i++) {
        await pushHistory('example.com', `.[${ i }]`);
      }
    });

    test('should return only 10 records', async () => {
      const history = await getHistory('example.com', '');
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
    await pushHistory('example.com', 'query1');
    const history = await getHistory('example.com', '');
    expect(history).toEqual(['query1']);
  });

  test('should push history', async () => {
    await pushHistory('example.com', '.');
    await pushHistory('example.com', '.[]');
    await pushHistory('example.com', '.');
    const history = await getHistory('example.com', '');
    expect(history).toEqual(['.', '.[]']);
  });
});

describe('clearHistory', () => {
  beforeEach(cleanup);

  beforeEach(async () => {
    for (let i = 0; i < 50; i++) {
      await pushHistory('example.com', `.[${ i }]`);
    }
  });

  test('should clear history', async () => {
    await clearHistory();
    const history = await getHistory('example.com', '');
    expect(history).toEqual([]);
  });
});


describe('getDomains', () => {
  beforeEach(cleanup);

  beforeEach(async () => {
    for (let i = 0; i < 3; i++) {
      await pushHistory('example.com', `.[${ i }]`);
    }

    await pushHistory('sub.example.com', `.[0]`);

    for (let i = 0; i < 5; i++) {
      await pushHistory('test.com', `.[${ i }]`);
    }

    for (let i = 0; i < 2; i++) {
      await pushHistory('other.net', `.[${ i }]`);
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
