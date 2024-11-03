export type Browser = 'chrome' | 'edge';

export const detectBrowser = (): Browser => {
  return navigator.userAgent.includes('Edg') ? 'edge' : 'chrome';
};
