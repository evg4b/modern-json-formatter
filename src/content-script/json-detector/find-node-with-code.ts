import { getNodeWithCode } from './get-node-with-code';

export const findNodeWithCode = (): Promise<HTMLPreElement | HTMLDivElement | null> => {
  return new Promise((resolve) => {
    const body = document.body as HTMLBodyElement | null;
    if (body) {
      resolve(getNodeWithCode(body.childNodes));
    }
    else {
      document.addEventListener('DOMContentLoaded', () => {
        resolve(getNodeWithCode(document.body.childNodes));
      });
    }
  });
};
