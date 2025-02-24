declare module '*.module.scss' {
  const styles: string;
  export default styles;
}

declare module '*.html' {
  const markup: string;
  export default markup;
}

declare module '*.svg' {
  const styles: string;
  export default styles;
}

type TabType = 'raw' | 'formatted' | 'query';
