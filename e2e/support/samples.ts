import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const load = (name: string) => readFileSync(join(import.meta.dirname, 'samples', name), 'utf8').replace(/\n$/, '');

export const sample = load('sample.json');

export const sampleFormatted = load('sample-formatted.json');

export const sampleMinified = load('sample-minified.json');

export const invalid = load('invalid.json');

export const links = load('links.json');

export const nested = (depth: number, leaf = '"deep"') => '{"a":'.repeat(depth) + leaf + '}'.repeat(depth);

export const ofLength = (length: number) => JSON.stringify('x'.repeat(length - 2));
