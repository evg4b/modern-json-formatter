import type { ErrorNodeElement } from '../ui/error-node/error-node';

export const buildErrorNode = (header: string, ...lines: string[]): ErrorNodeElement => {
  const el = document.createElement('mjf-error-node') as ErrorNodeElement;
  el.header = header;
  el.lines = lines;
  return el;
};
