import { detectBrowser } from './browser';
import { detectors } from './detectors';
import { selectors } from './selectors';

export const detectJson = () => {
  const detector = detectors[detectBrowser()];
  return detector();
};

export const getJsonSelector = (): string => {
  return selectors[detectBrowser()];
};
