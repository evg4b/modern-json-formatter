import type { DomainCountResponse, Message as BackgroundMessage } from '@core/background';
import type { ExtensionSettings } from '@core/settings';
import { take } from 'es-toolkit';
import { extractDomainKey } from '../../src/content-script/helpers';

export interface ChromeMockState {
  domains: DomainCountResponse;
  history: string[];
  settings: Partial<ExtensionSettings> | null;
  latency: number;
}

const SETTINGS_KEY = 'mjf_settings';
const HISTORY_LIMIT = 10;
const pageDomain = extractDomainKey(globalThis.location.href);

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
});

let state = initialState();

export const resetChromeMock = () => {
  state = initialState();
};

export const configureChromeMock = (patch: Partial<ChromeMockState>) => {
  state = { ...state, ...patch };
};

interface Message {
  action: string;
  payload: unknown;
}

const WASM_ACTIONS = new Set(['tokenize', 'format', 'jq']);

const handlers: Record<string, (payload: never) => unknown> = {
  'get-history': ({ domain, prefix }: { domain: string; prefix: string }) => {
    if (domain !== pageDomain) {
      return [];
    }

    return take(state.history.filter(query => query.startsWith(prefix)), HISTORY_LIMIT);
  },
  'push-history': ({ domain, query }: { domain: string; query: string }) => {
    if (domain !== pageDomain) {
      return;
    }

    if (!state.history.includes(query)) {
      const entry = state.domains.find(item => item.domain === domain);
      state.domains = entry
        ? state.domains.with(state.domains.indexOf(entry), { domain, count: entry.count + 1 })
        : [...state.domains, { domain, count: 1 }];
    }

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

  if (WASM_ACTIONS.has(action)) {
    // Loaded on first use: the WASM module makes importers async, which must not reach `.storybook/preview.ts`.
    const { handler } = await import('../../src/background/handler');
    return handler({ action, payload } as BackgroundMessage);
  }

  const fake = handlers[action];
  if (!fake) {
    throw new Error(`[storybook] unknown background action: ${action}`);
  }

  return fake(payload as never);
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
