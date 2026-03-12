import '@testing/worker-wasm.mock';
import { beforeEach, describe, expect, rstest, test } from '@rstest/core';
import { wrapMock } from '@testing/helpers';
import { format, minify } from '@wasm';
import { download } from './download';

const chromeMock = {
  downloads: {
    download: rstest.fn().mockResolvedValue(1),
  },
};

beforeEach(() => {
  globalThis.chrome = chromeMock as unknown as typeof chrome;
  rstest.clearAllMocks();
  chromeMock.downloads.download.mockResolvedValue(1);
});

describe('download', () => {
  const content = '{"key":"value"}';
  const filename = 'test.json';

  describe('raw type', () => {
    beforeEach(async () => {
      await download('raw', content, filename);
    });

    test('should not call format', () => {
      expect(format).not.toHaveBeenCalled();
    });

    test('should not call minify', () => {
      expect(minify).not.toHaveBeenCalled();
    });

    test('should call chrome.downloads.download with original content', () => {
      expect(chromeMock.downloads.download).toHaveBeenCalledWith({
        url: 'data:text/json;charset=utf-8,' + encodeURIComponent(content),
        filename,
      });
    });
  });

  describe('formatted type', () => {
    const formattedContent = '{\n  "key": "value"\n}';

    beforeEach(async () => {
      wrapMock(format).mockReturnValue(formattedContent);
      await download('formatted', content, filename);
    });

    test('should call format with content', () => {
      expect(format).toHaveBeenCalledWith(content);
    });

    test('should not call minify', () => {
      expect(minify).not.toHaveBeenCalled();
    });

    test('should call chrome.downloads.download with formatted content', () => {
      expect(chromeMock.downloads.download).toHaveBeenCalledWith({
        url: 'data:text/json;charset=utf-8,' + encodeURIComponent(formattedContent),
        filename,
      });
    });
  });

  describe('minified type', () => {
    const minifiedContent = '{"key":"value"}';

    beforeEach(async () => {
      wrapMock(minify).mockReturnValue(minifiedContent);
      await download('minified', content, filename);
    });

    test('should call minify with content', () => {
      expect(minify).toHaveBeenCalledWith(content);
    });

    test('should not call format', () => {
      expect(format).not.toHaveBeenCalled();
    });

    test('should call chrome.downloads.download with minified content', () => {
      expect(chromeMock.downloads.download).toHaveBeenCalledWith({
        url: 'data:text/json;charset=utf-8,' + encodeURIComponent(minifiedContent),
        filename,
      });
    });
  });

  test('should use the provided filename', async () => {
    const customFilename = 'my-data_formatted.json';
    await download('raw', content, customFilename);

    expect(chromeMock.downloads.download).toHaveBeenCalledWith(
      expect.objectContaining({ filename: customFilename }),
    );
  });
});
