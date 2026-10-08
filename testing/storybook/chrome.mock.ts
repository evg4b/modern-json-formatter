import type { DomainCountResponse } from '@core/background';
import type { ExtensionSettings } from '@core/settings';
import type { ErrorNode, TokenizerResponse, TokenNode, TupleNode } from '@wasm/types';
import { toTokens } from './tokens';

/**
 * In-memory stand-in for the extension runtime used by Storybook.
 *
 * Components talk to the background service worker through
 * `chrome.runtime.sendMessage` and read settings from `chrome.storage.sync`.
 * Neither exists outside an extension, so this module installs a fake `chrome`
 * global whose behaviour stories can tune with `configureChromeMock`.
 */
export interface ChromeMockState {

  /** Rows returned by the `get-domains` action (options page history table). */
  domains: DomainCountResponse;

  /** Queries offered by the query input autocomplete (`get-history`). */
  history: string[];

  /** Settings stored in `chrome.storage.sync`; `null` means nothing saved yet. */
  settings: Partial<ExtensionSettings> | null;

  /** Artificial delay for every background response, in milliseconds. */
  latency: number;

  /** When set, every background request fails with this message. */
  failure: string | null;
}

const SETTINGS_KEY = 'mjf_settings';

const initialState = (): ChromeMockState => ({
  domains: [
    { domain: 'api.github.com', count: 12 },
    { domain: 'jsonplaceholder.typicode.com', count: 7 },
    { domain: 'localhost:3000', count: 3 },
  ],
  history: [
    '.',
    '.items[]',
    '.items[] | .name',
    '.items | length',
    'keys',
  ],
  settings: null,
  latency: 0,
  failure: null,
});

let state = initialState();

export const resetChromeMock = () => {
  state = initialState();
};

export const configureChromeMock = (patch: Partial<ChromeMockState>) => {
  state = { ...state, ...patch };
};

const jqError = (error: string): ErrorNode => ({ type: 'error', scope: 'jq', error });

const applySegment = (value: unknown, segment: string): unknown[] => {
  if (segment === '' || segment === '.') {
    return [value];
  }

  if (segment === 'keys') {
    if (value === null || typeof value !== 'object') {
      throw jqError(`${JSON.stringify(value)} has no keys`);
    }

    return [Array.isArray(value) ? value.map((_, index) => index) : Object.keys(value).sort()];
  }

  if (segment === 'length') {
    if (Array.isArray(value) || typeof value === 'string') {
      return [value.length];
    }

    return [value && typeof value === 'object' ? Object.keys(value).length : 0];
  }

  if (!segment.startsWith('.')) {
    throw jqError(`${segment}/0 is not defined at <top-level>, line 1:`);
  }

  let results: unknown[] = [value];
  const parts = segment.slice(1).match(/[^.[\]]+|\[\d*]/g) ?? [];

  for (const part of parts) {
    results = results.flatMap(item => {
      if (part === '[]') {
        if (Array.isArray(item)) {
          return item;
        }

        if (item && typeof item === 'object') {
          return Object.values(item);
        }

        throw jqError(`Cannot iterate over ${JSON.stringify(item)}`);
      }

      if (part.startsWith('[')) {
        const index = Number(part.slice(1, -1));
        if (!Array.isArray(item)) {
          throw jqError(`Cannot index ${typeof item} with number`);
        }

        return [item[index] ?? null];
      }

      if (item === null) {
        return [null];
      }

      if (typeof item !== 'object' || Array.isArray(item)) {
        throw jqError(`Cannot index ${Array.isArray(item) ? 'array' : typeof item} with "${part}"`);
      }

      return [(item as Record<string, unknown>)[part] ?? null];
    });
  }

  return results;
};

/**
 * Tiny jq subset: paths (`.a.b`, `.[0]`, `.[]`), `keys`, `length` and pipes.
 * Anything else yields a jq-scoped error, which is handy for error stories.
 */
export const fakeJq = (json: string, query: string): TokenNode | TupleNode => {
  const input: unknown = JSON.parse(json);
  const results = query
    .split('|')
    .map(segment => segment.trim())
    .reduce<unknown[]>((values, segment) => values.flatMap(value => applySegment(value, segment)), [input]);

  return results.length === 1
    ? toTokens(results[0])
    : { type: 'tuple', items: results.map(toTokens) };
};

const tokenize = (json: string): TokenizerResponse => {
  try {
    return toTokens(JSON.parse(json));
  } catch (error: unknown) {
    return { type: 'error', scope: 'tokenizer', error: (error as Error).message };
  }
};

interface Message {
  action: string;
  payload: unknown;
}

const handlers: Record<string, (payload: never) => unknown> = {
  'tokenize': (json: string) => tokenize(json),
  'format': (json: string) => {
    try {
      return JSON.stringify(JSON.parse(json), null, 2);
    } catch (error: unknown) {
      return { type: 'error', scope: 'worker', error: (error as Error).message };
    }
  },
  'jq': ({ json, query }: { json: string; query: string }) => {
    try {
      return fakeJq(json, query);
    } catch (error: unknown) {
      return error instanceof Error ? jqError(error.message) : error as ErrorNode;
    }
  },
  'get-history': ({ prefix }: { prefix: string }) => state.history.filter(query => query.startsWith(prefix)),
  'push-history': ({ query }: { query: string }) => {
    state.history = [query, ...state.history.filter(item => item !== query)];
  },
  'get-domains': () => state.domains,
  'clear-history': () => {
    state.domains = [];
    state.history = [];
  },
  'download': (payload: { filename: string }) => {
    console.info('[storybook] download requested', payload.filename);
  },
};

const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

const sendMessage = async ({ action, payload }: Message): Promise<unknown> => {
  await delay(state.latency);

  if (state.failure) {
    return { type: 'error', scope: 'worker', error: state.failure } satisfies ErrorNode;
  }

  const handler = handlers[action];
  if (!handler) {
    throw new Error(`[storybook] unknown background action: ${action}`);
  }

  return handler(payload as never);
};

const storage = {
  get: async (key: string) => {
    if (key === SETTINGS_KEY && state.settings) {
      return { [key]: state.settings };
    }

    return {};
  },
  set: async (data: Record<string, unknown>) => {
    if (SETTINGS_KEY in data) {
      state.settings = data[SETTINGS_KEY] as Partial<ExtensionSettings>;
    }
  },
};

const runtime = {
  getURL: (path: string) => path,
  sendMessage,
};

Reflect.defineProperty(globalThis, 'chrome', {
  configurable: true,
  value: { runtime, storage: { sync: storage } },
});
