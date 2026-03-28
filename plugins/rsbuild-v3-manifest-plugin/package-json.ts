import { resolve } from 'node:path';
import { readFile } from 'node:fs/promises';
import type { PackageJson as Package } from 'type-fest';
import { memoize } from 'es-toolkit';
import { type RsbuildPluginAPI } from '@rsbuild/core';

const readPackageJsonInternal = async ({ getRsbuildConfig }: RsbuildPluginAPI): Promise<Package> => {
  const { root } = getRsbuildConfig();
  const packageJsonPath = resolve(root ?? process.cwd(), 'package.json');
  const content = await readFile(packageJsonPath, 'utf-8');

  return JSON.parse(content) as Package;
};

export const readPackageJson = memoize(readPackageJsonInternal);
