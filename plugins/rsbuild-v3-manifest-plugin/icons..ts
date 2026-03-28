import { logger, type OnAfterBuildFn } from '@rsbuild/core';

type ManifestIcons = chrome.runtime.ManifestIcons;

type Assets = NonNullable<ReturnType<NonNullable<Parameters<OnAfterBuildFn>[0]['stats']>['toJson']>['assets']>;

const allowedNumbers = ['16', '32', '48', '128', '256', '512'];

const pattern = new RegExp(
  `^icon(${allowedNumbers.join('|')})\\.(png|jpe?g)$`,
  'i',
);

export const extractIcons = (assets: Assets): ManifestIcons => {
  const images = assets.flatMap(p => {
    if (p.type !== 'asset') {
      return [];
    }

    const [_, size] = pattern.exec(p.info.sourceFilename ?? '') ?? [];
    if (!size) {
      return [];
    }

    logger.debug(`Found icon ${size} in ${p.name}`);

    return [[size, p.name]];
  });

  return Object.fromEntries(images);
};
