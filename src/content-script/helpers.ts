import { type ErrorNode } from '@wasm/types';

export const throws = (value?: string): never => {
  throw new Error(value ?? 'Unexpected value');
};

export const query = <T extends HTMLElement = HTMLElement, D extends HTMLElement = HTMLElement>(
  value: D,
  selector: string,
): T => value.querySelector<T>(selector) ?? throws(`Element ${selector} not found`);

const types: string[] = ['raw', 'query', 'formatted'] satisfies TabType[];

export function assetTabType(s?: string | null): asserts s is TabType {
  if (s && !types.includes(s)) {
    throw new Error(`Invalid tab type '${s}'`);
  }
}

export const isErrorNode = (node: unknown): node is ErrorNode => {
  return !!node && typeof node === 'object' && 'type' in node && node.type === 'error';
};
