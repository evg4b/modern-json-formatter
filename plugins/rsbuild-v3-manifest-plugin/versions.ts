import { type RsbuildPluginAPI } from '@rsbuild/core';
import { resolve } from 'node:path';
import { readFile } from 'node:fs/promises';
import { inc, valid } from 'semver';
import { getShortCommitHash } from './git';
import { type VersionResult } from './types';
import { assert } from 'es-toolkit';

const VERSION_STUB = '0.0.0' as const;

export const getCurrentVersion = async ({ logger, getRsbuildConfig }: RsbuildPluginAPI): Promise<string | null> => {
  const { root } = getRsbuildConfig();
  const packageJson = resolve(root ?? process.cwd(), 'package.json');
  logger.debug(`package.json path: ${packageJson}`);
  const content = await readFile(packageJson, 'utf-8');
  const { version } = JSON.parse(content);

  return version ?? null;
};

export const resolveTemporalVersion = async (api: RsbuildPluginAPI): Promise<VersionResult> => {
  const { logger } = api;
  const currentVersion = await getCurrentVersion(api) ?? VERSION_STUB;
  const hash = await getShortCommitHash();
  logger.debug(`Current git commit hash: ${hash}`);
  const patchedVersion = inc(currentVersion, 'patch');
  const version = valid(patchedVersion) ?? VERSION_STUB;

  return {
    version: version,
    version_name: `${patchedVersion}-${hash}`,
  };
};

export const resolveVersion = async (api: RsbuildPluginAPI): Promise<VersionResult> => {
  const { logger } = api;
  const currentVersion = await getCurrentVersion(api);
  assert(currentVersion !== null, 'Current version is not defined');
  logger.info(`Extension version: ${currentVersion}`);

  return { version: currentVersion, version_name: currentVersion };
};

