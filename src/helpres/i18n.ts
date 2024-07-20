import { throws } from './asserts';

export const t = (key: string, substitutions?: string | string[]): string => {
  const translation = chrome.i18n.getMessage(key, substitutions);

  return !!translation?.length
    ? translation
    : throws(`Translation for key "${ key }" not found`);
};
