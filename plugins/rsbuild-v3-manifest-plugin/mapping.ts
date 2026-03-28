import { isNil, omitBy, pick } from 'es-toolkit';
import { type RsbuildPluginAPI } from '@rsbuild/core';
import { resolveTemporalVersion, resolveVersion } from './versions';
import { isProduction } from './helpers';
import { readPackageJson } from './package-json';

type ManifestV3 = chrome.runtime.ManifestV3;

export const mapPackageJsonToManifestV3 = async (api: RsbuildPluginAPI): Promise<Partial<ManifestV3>> => {
  const packageJson = await readPackageJson(api);

  const { version, version_name } = isProduction(api)
    ? await resolveVersion(api)
    : await resolveTemporalVersion(api);

  const pickedManifestV3Draft: Partial<ManifestV3> = {
    ...pick(packageJson, [
      'name',
      'version',
      'description',
    ]),
    homepage_url: packageJson.homepage,
    version,
    version_name,
  };

  return omitBy(pickedManifestV3Draft, isNil);
};
