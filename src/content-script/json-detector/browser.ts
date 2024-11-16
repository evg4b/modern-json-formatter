export type Browser = 'chrome' | 'edge' | 'sigma-os';

export const detectBrowser = (): Browser => {
  if (navigator.userAgent.includes('Safari')) {
    return 'sigma-os';
  }

  return navigator.userAgent.includes('Edg')
    ? 'edge'
    : 'chrome';
};
