import { basename, extname } from 'node:path';

const defineSvgMock = (path: string) => {
  const filename = basename(path);
  const name = filename.replace(extname(filename), '');
  jest.mock(path, () => `<svg>${name}</svg>`);
};

defineSvgMock('../src/faq/buttons/chrome-web-store-button-icon.svg');
defineSvgMock('../src/faq/buttons/ko-fi-button-icon.svg');
defineSvgMock('../src/faq/buttons/github-button-icon.svg');
defineSvgMock('../src/content-script/ui/info-button/info-button-icon.svg');
