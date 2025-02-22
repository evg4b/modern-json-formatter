import { HistoryResponse } from '@core/background';
import { wait } from './helpers';

type QueryRecord = {
  id: number;
  domain: string;
  query: string;
};

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

  const results = await wait(
    db.transaction(STORE_NAME, 'readonly')
      .objectStore(STORE_NAME)
      .index(DOMAIN_INDEX)
      .getAll(domain) as IDBRequest<QueryRecord[]>,
  );

  db.close();

  return results.sort((a, b) => b.id - a.id)
    .filter(({ query }) => query.startsWith(prefix))
    .map(({ query }) => query);
};

export const pushHistory = async (domain: string, query: string): Promise<void> => {
  const db = await openDB();
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
  db.close();
};

export const clearHistory = async (): Promise<void> => {
  const db = await openDB();
  await wait(
    db.transaction(STORE_NAME, 'readwrite')
      .objectStore(STORE_NAME)
      .clear(),
  );
  db.close();
};

export const getDomains = async (): Promise<string[]> => {
  const db = await openDB();
  const index = db.transaction(STORE_NAME, 'readonly')
    .objectStore(STORE_NAME)
    .index(DOMAIN_INDEX);
  const results = await wait(index.getAll());
  db.close();
  return Array.from(new Set(results.map(({ domain }) => domain)));
};
