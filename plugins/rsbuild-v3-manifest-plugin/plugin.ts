import type { OutputConfig, RsbuildEntry, RsbuildPlugin } from '@rsbuild/core';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const getFileByExtension = (files: string[], extension: string): string => {
  const filteredFiles = files.filter(file => file.endsWith(extension) && !file.endsWith('.hot-update.js'));
  if (filteredFiles.length !== 1) {
    throw new Error(`Expected one file with extension ${extension}, found ${filteredFiles.length}`);
  }

  return filteredFiles[0];
};

const cleanupChunks = (chunks: string[]) => chunks.filter(chunk => !chunk.endsWith('.hot-update.js'));

type ArrayElementsOnly<T> = T extends (infer U)[] ? U : never;
type AssetType = ArrayElementsOnly<OutputConfig['copy']> & {
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

const buildPlainScript = (name: string, path?: string): RsbuildEntry => {
  return path
    ? { [name]: { import: path, html: false } }
    : {};
};

const buildHtmlPage = (name: string, path?: string): RsbuildEntry => {
  return path
    ? { [name]: { import: path, html: true } }
    : {};
};

export const manifestGeneratorPlugin = (options?: ManifestGeneratorParams): RsbuildPlugin => ({
  name: 'manifest-generator-plugin',
  setup(api) {
    api.modifyRsbuildConfig((config, utils) => {
      const isDevelopment = options?.development ?? process.env.NODE_ENV !== 'production';
      const assets = options?.assets ?? [];
      const targetType = isDevelopment ? 'development' : 'production';
      const filteredAssets = assets.filter(({ type }) => !type || type === targetType);

      return utils.mergeRsbuildConfig(config, {
        source: {
          entry: {
            ...buildPlainScript('background', options?.background),
            ...buildPlainScript('content-script', options?.contentScripts),
            ...buildHtmlPage('options', options?.options),
            ...Object.entries(options?.pages ?? {})
              .reduce((accumulator: RsbuildEntry, [name, path]) => ({
                ...accumulator,
                ...buildHtmlPage(name, path),
              }), {}),
          },
          decorators: {
            version: 'legacy',
          },
        },
        html: {
          template: ({ entryName }) => `./src/${entryName}/${entryName}.html`,
        },
        output: {
          copy: filteredAssets,
          distPath: { css: '', js: '', wasm: '' },
          sourceMap: isDevelopment,
          filenameHash: false,
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
      const contentScript = getFileByExtension(cleanupChunks(chunks['content-script'] ?? []), '.js');
      const backgroundScript = getFileByExtension(cleanupChunks(chunks['background'] ?? []), '.js');

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
              ...chunks['options'] ?? [],
              ...Object.entries(options?.pages ?? {})
                .reduce((accumulator: string[], [name]) => [
                  ...accumulator,
                  ...chunks[name] ?? [],
                  `${name}.html`,
                ], []),
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
