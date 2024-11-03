import { detectBrowser } from './browser';
import { detectors } from './detectors';
import { selectors } from './selectors';

export const detectJson = () => {
  return detectors[detectBrowser()].call(null);
};

export const getJsonSelector = (): string => {
  return selectors[detectBrowser()];
};
