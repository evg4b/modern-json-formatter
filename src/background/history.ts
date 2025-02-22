import { HistoryResponse } from '@core/background';
import { sortBy, take } from 'lodash';
import { wait } from './helpers';

interface QueryRecord {
  id: number;
  domain: string;
  query: string;
}

const DB_NAME = 'ModernJSONFormatterDB';
const STORE_NAME = 'query-history';
const VERSION = 3;

const SEARCH_INDEX = 'domain_query';
const DOMAIN_INDEX = 'domain';

const openDB = (): Promise<IDBDatabase> => {
  const request = indexedDB.open(DB_NAME, VERSION);

  request.onupgradeneeded = event => {
    const db = (event.target as IDBOpenDBRequest).result;
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      store.createIndex(SEARCH_INDEX, ['domain', 'query'], { unique: true });
      store.createIndex(DOMAIN_INDEX, 'domain', { unique: false });
    }
  };

  return wait(request as IDBRequest<IDBDatabase>);
};

export const getHistory = async (domain: string, prefix: string): Promise<HistoryResponse> => {
  const db = await openDB();
  try {
    const results = await wait(
      db.transaction(STORE_NAME, 'readonly')
        .objectStore(STORE_NAME)
        .index(DOMAIN_INDEX)
        .getAll(domain) as IDBRequest<QueryRecord[]>,
    );

    const rows = sortBy(results, p => -p.id)
      .filter(({ query }) => query.startsWith(prefix))
      .map(({ query }) => query);

    return take(rows, 10);
  } finally {
    db.close();
  }
};

export const pushHistory = async (domain: string, query: string): Promise<void> => {
  const db = await openDB();
  try {
    const store = db.transaction(STORE_NAME, 'readwrite')
      .objectStore(STORE_NAME);

    const keyRange = IDBKeyRange.only([domain, query]);
    const record = await wait(
      store.index(SEARCH_INDEX)
        .openCursor(keyRange),
    );
    if (record) {
      await wait(record.delete());
    }

    await wait(store.add({ domain, query }));
  } finally {
    db.close();
  }
};

export const clearHistory = async (): Promise<void> => {
  const db = await openDB();
  try {
    await wait(
      db.transaction(STORE_NAME, 'readwrite')
        .objectStore(STORE_NAME)
        .clear(),
    );
  } finally {
    db.close();
  }
};

export const getDomains = async (): Promise<string[]> => {
  const db = await openDB();
  try {
    const index = db.transaction(STORE_NAME, 'readonly')
      .objectStore(STORE_NAME)
      .index(DOMAIN_INDEX);
    const results = await wait(index.getAll());

    return Array.from(new Set(results.map(({ domain }) => domain)));
  } finally {
    db.close();
  }
};
