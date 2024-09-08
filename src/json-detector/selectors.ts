import { type Browser } from './browser';

export const selectors: Record<Browser, string> = {
  chrome: 'body > pre',
  edge: 'body > div[hidden=true]',
};
