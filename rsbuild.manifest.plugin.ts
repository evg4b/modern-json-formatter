import type { OutputConfig, RsbuildPlugin } from '@rsbuild/core';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const getFileByExtension = (files: string[], extension: string): string => {
  const filteredFiles = files.filter(file => file.endsWith(extension));
  if (filteredFiles.length !== 1) {
    throw new Error(`Expected one file with extension ${extension}, found ${filteredFiles.length}`);
  }

  return filteredFiles[0];
};

type ArrayElementsOnly<T> = T extends (infer U)[] ? U : never;
type AssetType = ArrayElementsOnly<OutputConfig['copy']> & {
  type?: 'production' | 'development';
};

export type ManifestGeneratorParams = {
  manifestPath?: string;
  pages?: string[];
  development?: boolean;
  assets?: AssetType[];
};

export const manifestGeneratorPlugin = (options?: ManifestGeneratorParams): RsbuildPlugin => ({
  name: 'manifest-generator-plugin',
  setup(api) {
    api.modifyRsbuildConfig((config, utils) => {
      const isDevelopment = options?.development ?? true;
      const assets = options?.assets ?? [];
      const targetType = isDevelopment ? 'development' : 'production';
      const filteredAssets = assets.filter(({ type }) => !type || type === targetType);

      return utils.mergeRsbuildConfig(config, {
        output: {
          copy: filteredAssets,
        },
      });
    });

    api.onAfterBuild(async params => {
      const stats = params.stats?.toJson('detailed');
      if (!stats) {
        throw new Error('No stats found');
      }

      let { manifestPath } = options ?? {};
      const config = api.getNormalizedConfig();
      manifestPath = resolve(config.root, manifestPath ?? 'manifest.json');

      const chunks = stats.assetsByChunkName ?? {};
      const contentScript = getFileByExtension(chunks['content-script'] ?? [], '.js');
      const backgroundScript = getFileByExtension(chunks['background'] ?? [], '.js');

      const file = await readFile(manifestPath, 'utf-8');
      const srcManifest = JSON.parse(file);

      await writeFile(resolve(stats?.outputPath ?? '', 'manifest.json'), JSON.stringify({
        ...srcManifest,
        content_scripts: [
          {
            matches: ['<all_urls>'],
            js: [contentScript],
            run_at: 'document_start',
          },
        ],
        background: {
          service_worker: backgroundScript,
          type: 'module',
        },
        web_accessible_resources: [
          {
            resources: [
              'faq.html',
              'faq.scss',
              'faq.js',
              'options.html',
              'options.scss',
              'options.js',
            ],
            matches: ['<all_urls>'],
          },
          {
            resources: ['*.map'],
            matches: ['<all_urls>'],
          },
        ],
      }));
    });
  },
});
