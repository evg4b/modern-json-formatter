import { type OutputConfig } from '@rsbuild/core';

export type ArrayElementsOnly<T> = T extends (infer U)[] ? U : never;
export type AssetType = ArrayElementsOnly<OutputConfig['copy']> & {
  type?: 'production' | 'development';
};

export type ManifestGeneratorParams = {
  manifestPath?: string;
  pages?: Record<string, string>;
  assets?: AssetType[];
  background?: string;
  contentScripts?: string;
  options?: string;
  baseManifest?: BaseManifestV3;
};

export type VersionResult = Pick<chrome.runtime.ManifestV3, 'version' | 'version_name'>;

export type BaseManifestV3 = Omit<chrome.runtime.ManifestV3, 'background'>;
