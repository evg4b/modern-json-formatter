import type { RsbuildEntry, RsbuildPlugin } from '@rsbuild/core';
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { buildHtmlPage, buildPlainScript, cleanupChunks, getFileByExtension } from './helpers';
import { type BaseManifestV3, type ManifestGeneratorParams } from './types';
import { upperCase } from 'es-toolkit';
import { mapPackageJsonToManifestV3 } from './mapping';

export const manifestGeneratorPlugin = (options?: ManifestGeneratorParams): RsbuildPlugin => ({
  name: 'manifest-generator-plugin',
  setup(api) {
    api.modifyRsbuildConfig(async (config, { mergeRsbuildConfig }) => {
      const isDevelopment = upperCase(config?.mode ?? 'none') !== 'PRODUCTION';

      const assets = options?.assets ?? [];
      const targetType = isDevelopment ? 'development' : 'production';
      const filteredAssets = assets.filter(({ type }) => !type || type === targetType);

      return mergeRsbuildConfig(config, {
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

      const chunks = stats.assetsByChunkName ?? {};
      const contentScript = getFileByExtension(cleanupChunks(chunks['content-script'] ?? []), '.js');
      const backgroundScript = getFileByExtension(cleanupChunks(chunks['background'] ?? []), '.js');

      const baseManifest: BaseManifestV3 = options?.baseManifest ?? {};

      await writeFile(resolve(stats?.outputPath ?? '', 'manifest.json'), JSON.stringify({
        $schema: 'https://json.schemastore.org/chrome-manifest.json',
        ...await mapPackageJsonToManifestV3(api),
        ...baseManifest ?? {},
        manifest_version: 3,
        content_scripts: [
          ...baseManifest.content_scripts ?? [],
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
          ...baseManifest.web_accessible_resources ?? [],
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
        ],
      }, null, 2), 'utf-8');
    });
  },
});
