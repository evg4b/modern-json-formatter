declare module '*.svg' {
  const styles: string;
  export default styles;
}

declare module '*.html' {
  const content: string;
  export default content;
}

interface MarkdownFile {
  html: string;
  raw: string;
  filename: string;
}

declare module '*.md' {
  declare const file: MarkdownFile;
  export default file;
}

declare module '*.css?raw' {
  const content: string;
  export default content;
}

type TabType = 'raw' | 'formatted' | 'query';
