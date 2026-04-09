import type { RsbuildEntry, RsbuildPlugin } from '@rsbuild/core';
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { buildHtmlPage, buildPlainScript, cleanupChunks, getFileByExtension, isProduction } from './helpers';
import { type BaseManifestV3, type ManifestGeneratorParams } from './types';
import { mapPackageJsonToManifestV3 } from './mapping';
import { extractIcons } from './icons.';

type ManifestV3 = chrome.runtime.ManifestV3;

export const manifestGeneratorPlugin = (options?: ManifestGeneratorParams): RsbuildPlugin => ({
  name: 'manifest-generator-plugin',
  setup(api) {
    const { logger } = api;

    api.modifyRsbuildConfig(async (config, { mergeRsbuildConfig }) => {
      const isDevelopment = !isProduction(api);

      const assets = options?.assets ?? [];
      const targetType = isDevelopment ? 'development' : 'production';
      const filteredAssets = assets.filter(({ type }) => !type || type === targetType);

      logger.info(`Building extension in ${targetType} mode`);
      logger.debug('Configuring entry points:');
      logger.debug(`  background=${options?.background ?? '(none)'}`);
      logger.debug(`  content-script=${options?.contentScripts ?? '(none)'}`);
      logger.debug(`  options=${options?.options ?? '(none)'}`);

      logger.debug(`Copying ${filteredAssets.length} asset(s) for ${targetType} target`);

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
      const isDevelopment = !isProduction(api);

      const stats = params.stats?.toJson('detailed');
      if (!stats) {
        throw new Error('No stats found');
      }

      const chunks = stats.assetsByChunkName ?? {};
      const contentScript = getFileByExtension(cleanupChunks(chunks['content-script'] ?? []), '.js');
      const backgroundScript = getFileByExtension(cleanupChunks(chunks['background'] ?? []), '.js');

      logger.debug(`Resolved content script: ${contentScript}`);
      logger.debug(`Resolved background script: ${backgroundScript}`);

      const baseManifest: BaseManifestV3 = options?.baseManifest ?? {};
      const outputPath = resolve(stats?.outputPath ?? '', 'manifest.json');

      const icons = baseManifest.icons ?? extractIcons(stats.assets ?? []);

      logger.info(`Generating manifest for ${baseManifest.name ?? 'unknown'} extension`);

      const assert = stats.assets?.find(asset => asset.name === 'options.html');

      await writeFile(outputPath, JSON.stringify(<ManifestV3>{
        $schema: 'https://json.schemastore.org/chrome-manifest.json',
        ...await mapPackageJsonToManifestV3(api),
        ...baseManifest ?? {},
        manifest_version: 3,
        content_scripts: [
          ...baseManifest.content_scripts ?? [],
          {
            matches: ['<all_urls>', 'file://*/*'],
            js: [contentScript],
            run_at: 'document_start',
          },
        ],
        background: {
          service_worker: backgroundScript,
          type: 'module',
        },
        options_page: assert?.name,
        icons,
        web_accessible_resources: [
          ...baseManifest.web_accessible_resources ?? [],
          {
            resources: [
              ...Object.entries(options?.pages ?? {})
                .reduce((accumulator: string[], [name]) => [
                  ...accumulator,
                  ...chunks[name] ?? [],
                  `${name}.html`,
                ], []),
            ],
            matches: ['<all_urls>'],
          },
          ...isDevelopment
            ? [{ resources: ['*.map'], matches: ['<all_urls>'] }]
            : [],
        ],
      }, null, 2), 'utf-8');

      logger.info(`Manifest written to ${outputPath}`);
    });
  },
});
