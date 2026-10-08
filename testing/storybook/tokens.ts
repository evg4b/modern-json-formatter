import type { TokenNode, TupleNode } from '@wasm/types';

const URL_PATTERN = /^https?:\/\/\S+$/i;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Converts a plain JS value into the token tree the WASM tokenizer produces.
 * Good enough for stories: numbers lose precision beyond what JSON.parse keeps.
 */
export const toTokens = (value: unknown): TokenNode => {
  if (value === null || value === undefined) {
    return { type: 'null' };
  }

  if (typeof value === 'boolean') {
    return { type: 'boolean', value };
  }

  if (typeof value === 'number' || typeof value === 'bigint') {
    return { type: 'number', value: String(value) };
  }

  if (typeof value === 'string') {
    if (URL_PATTERN.test(value)) {
      return { type: 'string', value, variant: 'url' };
    }

    if (EMAIL_PATTERN.test(value)) {
      return { type: 'string', value, variant: 'email' };
    }

    return { type: 'string', value };
  }

  if (Array.isArray(value)) {
    return { type: 'array', items: value.map(toTokens) };
  }

  return {
    type: 'object',
    properties: Object.entries(value as Record<string, unknown>)
      .map(([key, item]) => ({ key, value: toTokens(item) })),
  };
};

export const toTuple = (...values: unknown[]): TupleNode => ({
  type: 'tuple',
  items: values.map(toTokens),
});
