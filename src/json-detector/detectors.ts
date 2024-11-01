import { Browser } from './browser';

export type Detector = () => Promise<boolean>;

export const detectors: Record<Browser, Detector> = {
  chrome: () => Promise.resolve(!!document.querySelector('body pre + .json-formatter-container')),
  edge: () =>
    new Promise(resolve => {
      document.addEventListener('DOMContentLoaded', () => resolve(!!document.querySelector('body .cm-editor')));
    }),
};
