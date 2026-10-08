import type { Message as BackgroundMessage } from '@core/background';
import { take } from 'es-toolkit';
import { extractDomainKey } from '../../src/content-script/helpers';

export interface ChromeMockState {
  history: string[];
  latency: number;
}

const HISTORY_LIMIT = 10;
const pageDomain = extractDomainKey(globalThis.location.href);

const initialState = (): ChromeMockState => ({
  history: [
    '.',
    '.items[]',
    '.items[] | .name',
    '.items | length',
    'keys',
  ],
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

const getHistory = ({ domain, prefix }: { domain: string; prefix: string }) => {
  if (domain !== pageDomain) {
    return [];
  }

  return take(state.history.filter(query => query.startsWith(prefix)), HISTORY_LIMIT);
};

const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

const sendMessage = async ({ action, payload }: Message): Promise<unknown> => {
  await delay(state.latency);

  switch (action) {
    case 'get-history':
      return getHistory(payload as { domain: string; prefix: string });
    case 'jq': {
      // Loaded on first use: the WASM module makes importers async, which must not reach `.storybook/preview.ts`.
      const { handler } = await import('../../src/background/handler');
      return handler({ action, payload } as BackgroundMessage);
    }
    default:
      throw new Error(`[storybook] unsupported background action: ${action}`);
  }
};

Reflect.defineProperty(globalThis, 'chrome', {
  configurable: true,
  value: {
    runtime: {
      getURL: (path: string) => path,
      sendMessage,
    },
  },
});
