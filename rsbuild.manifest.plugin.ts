import { type RsbuildPlugin } from '@rsbuild/core';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const getFileByExtension = (files: string[], extension: string): string => {
  const filteredFiles = files.filter(file => file.endsWith(extension));
  if (filteredFiles.length !== 1) {
    throw new Error(`Expected one file with extension ${ extension }, found ${ filteredFiles.length }`);
  }

  return filteredFiles[0];
};

export type ManifestGeneratorParams = {
  manifestPath?: string;
}

export const manifestGeneratorPlugin = (options?: ManifestGeneratorParams): RsbuildPlugin => ({
  name: 'manifest-generator-plugin',
  setup(api) {
    api.onAfterBuild(async (params) => {
      const stats = params.stats?.toJson("detailed");
      if (!stats) {
        throw new Error('No stats found');
      }

      let { manifestPath } = options ?? {};
      const demo = api.getNormalizedConfig();
      manifestPath = resolve(demo.root, manifestPath ?? 'manifest.json');

      const chunks = stats.assetsByChunkName ?? {};
      const contentStyles = getFileByExtension(chunks['content-styles'] ?? [], '.css');
      const contentScript = getFileByExtension(chunks['content-script'] ?? [], '.js');
      const backgroundScript = getFileByExtension(chunks['background'] ?? [], '.js');

      const file = await readFile(manifestPath, 'utf-8');
      const srcManifest: any = JSON.parse(file);

      await writeFile(resolve(stats?.outputPath ?? '', 'manifest.json'), JSON.stringify({
        ...srcManifest,
        content_scripts: [
          {
            matches: [ "<all_urls>" ],
            js: [ contentScript ],
            run_at: "document_start"
          }
        ],
        background: {
          service_worker: backgroundScript,
          type: "module"
        },
        web_accessible_resources: [
          {
            resources: [ contentStyles ],
            matches: [ "<all_urls>" ]
          },
          {
            resources: [ "*.map" ],
            matches: [ "<all_urls>" ]
          }
        ],
      }));
    });
  },
});
