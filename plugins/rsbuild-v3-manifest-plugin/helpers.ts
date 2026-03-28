import type { RsbuildEntry } from '@rsbuild/core';

export const getFileByExtension = (files: string[], extension: string): string => {
  const filteredFiles = files.filter(file => file.endsWith(extension) && !file.endsWith('.hot-update.js'));
  if (filteredFiles.length !== 1) {
    throw new Error(`Expected one file with extension ${extension}, found ${filteredFiles.length}`);
  }

  return filteredFiles[0];
};

export const cleanupChunks = (chunks: string[]) => chunks.filter(chunk => !chunk.endsWith('.hot-update.js'));

export const buildPlainScript = (name: string, path?: string): RsbuildEntry => {
  return path
    ? { [name]: { import: path, html: false } }
    : {};
};

export const buildHtmlPage = (name: string, path?: string): RsbuildEntry => {
  return path
    ? { [name]: { import: path, html: true } }
    : {};
};
