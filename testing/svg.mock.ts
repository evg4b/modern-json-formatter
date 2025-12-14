import { basename, extname } from 'node:path';
import { rstest } from "@rstest/core";

const defineSvgMock = (path: string) => {
  const filename = basename(path);
  const name = filename.replace(extname(filename), '');
  rstest.mock(path, () => `<svg>${name}</svg>`);
};

defineSvgMock('../src/content-script/ui/info-button/info-button-icon.svg');
