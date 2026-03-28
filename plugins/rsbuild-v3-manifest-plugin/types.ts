import { type OutputConfig } from '@rsbuild/core';

export type ArrayElementsOnly<T> = T extends (infer U)[] ? U : never;
export type AssetType = ArrayElementsOnly<OutputConfig['copy']> & {
  type?: 'production' | 'development';
};

export type ManifestGeneratorParams = {
  manifestPath?: string;
  pages?: Record<string, string>;
  development?: boolean;
  assets?: AssetType[];
  background?: string;
  contentScripts?: string;
  options?: string;
};
