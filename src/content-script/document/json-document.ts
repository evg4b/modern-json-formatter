import { download, format, jq, pushHistory, tokenize } from '@core/background';
import { type DownloadType, isErrorNode } from '@core/background/protocol';
import type { TokenNode, TupleNode } from '@wasm/types';
import { extractDomainKey, extractFileName } from '../helpers';

export const ONE_MEGABYTE_LENGTH = 927182;

export interface Notice {
  header: string;
  content: string;
}

export interface Failure {
  header: string;
  lines: string[];
}

export type RenderResult
  = { type: 'tree'; node: TokenNode }
    | { type: 'text'; text: string; notice: Notice }
    | { type: 'failure'; failure: Failure };

export type QueryResult
  = { type: 'tree'; node: TupleNode; notice?: Notice }
    | { type: 'invalid-query'; message: string }
    | { type: 'notice'; notice: Notice };

export interface JsonDocumentOptions {
  url: string;
  maxFileSize: number;
}

const describe = (error: unknown): string => {
  if (isErrorNode(error)) {
    return error.error;
  }

  return error instanceof Error ? error.message : String(error);
};

const toFailure = (error: unknown): Failure => ({
  header: isErrorNode(error) && error.scope === 'tokenizer' ? 'Invalid JSON file.' : 'Failed to process file',
  lines: [describe(error)],
});

const toNotice = (error: unknown): Notice => {
  if (isErrorNode(error)) {
    return {
      header: `Error ${error.error} in ${error.scope}`,
      content: error.stack ? `Stack trace: ${error.stack}` : '',
    };
  }

  return { header: 'Unexpected error', content: describe(error) };
};

export class JsonDocument {
  public readonly oversized: boolean;

  constructor(
    private readonly content: string,
    private readonly options: JsonDocumentOptions,
  ) {
    this.oversized = content.length > options.maxFileSize * ONE_MEGABYTE_LENGTH;
  }

  public async render(): Promise<RenderResult> {
    try {
      if (!this.oversized) {
        return { type: 'tree', node: await tokenize(this.content) };
      }

      return {
        type: 'text',
        text: await format(this.content),
        notice: {
          header: 'File is too large',
          content: `File is too large to be processed (More than ${this.options.maxFileSize}MB). It has been formatted instead.`,
        },
      };
    } catch (error: unknown) {
      return { type: 'failure', failure: toFailure(error) };
    }
  }

  public async query(query: string): Promise<QueryResult> {
    let node: TupleNode;
    try {
      node = await jq(this.content, query);
    } catch (error: unknown) {
      if (isErrorNode(error) && error.scope === 'jq') {
        return { type: 'invalid-query', message: error.error };
      }

      return { type: 'notice', notice: toNotice(error) };
    }

    try {
      await pushHistory(extractDomainKey(this.options.url), query);
      return { type: 'tree', node };
    } catch (error: unknown) {
      return { type: 'tree', node, notice: toNotice(error) };
    }
  }

  public async download(type: DownloadType): Promise<Notice | null> {
    const suffix = type === 'raw' ? '' : `_${type}`;
    try {
      await download(type, this.content, `${extractFileName(this.options.url)}${suffix}.json`);
      return null;
    } catch (error: unknown) {
      return { header: 'Unable to download file', content: describe(error) };
    }
  }
}
