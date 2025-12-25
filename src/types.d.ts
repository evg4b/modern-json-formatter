declare module '*.svg' {
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

declare module '*.css?raw' {
  const content: string;
  export default content;
}

type TabType = 'raw' | 'formatted' | 'query';
