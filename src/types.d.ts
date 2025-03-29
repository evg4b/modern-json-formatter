declare module '*.svg' {
  const styles: string;
  export default styles;
}

declare module '*.html' {
  const content: string;
  export default content;
}

declare module '*.css?raw' {
  const content: string;
  export default content;
}

type TabType = 'raw' | 'formatted' | 'query';
