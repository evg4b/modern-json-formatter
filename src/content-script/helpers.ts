import { last, head } from 'es-toolkit';

export const throws = (value?: string): never => {
  throw new Error(value ?? 'Unexpected value');
};

export const extractFileName = (url: string | undefined | null): string => {
  if (!url) {
    return 'data';
  }

  const { pathname, hostname } = new URL(url);
  const lastRawSection = last(pathname.split('/'));
  const lastSection = head(lastRawSection?.split('.') ?? []);

  return lastSection || hostname.replaceAll('.', '-');
};
