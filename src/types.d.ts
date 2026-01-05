declare module '*.svg?raw' {
  const styles: string;
  export default styles;
}

declare module '*.html' {
  const content: string;
  export default content;
}

declare type MarkdownFile = ReturnType<typeof import('lit').html>;

declare module '*.md' {
  const file: MarkdownFile;
  export default file;
}

declare module '*.scss?inline' {
  const content: string;
  export default content;
}

declare module '*.scss';

type TabType = 'raw' | 'formatted' | 'query';

declare module '@wasm' {
  export function format(input: string): string;

  export function jq(json: string, query: string): import('@wasm/types').TupleNode;

  export function minify(input: string): string;

  export function tokenize(json: string): import('@wasm/types').TokenizerResponse;
}
