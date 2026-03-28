import type { RsbuildEntry, RsbuildPlugin } from '@rsbuild/core';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { buildHtmlPage, buildPlainScript, cleanupChunks, getFileByExtension } from './helpers';
import { type ManifestGeneratorParams } from './types';

export const manifestGeneratorPlugin = (options?: ManifestGeneratorParams): RsbuildPlugin => ({
  name: 'manifest-generator-plugin',
  setup(api) {
    api.modifyRsbuildConfig(async (config, utils) => {
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
