import type { DownloadType } from '../content-script/ui/toolbox/toolbox';
import { format, minify } from '@wasm';

const processContent = (type: DownloadType, content: string): string => {
  switch (type) {
    case 'formatted':
      return format(content);
    case 'minified':
      return minify(content);
    default:
      return content;
  }
};

export const download = async (type: DownloadType, content: string, filename: string): Promise<void> => {
  const formatted = processContent(type, content);
  await chrome.downloads.download({
    url: 'data:text/json;charset=utf-8,' + encodeURIComponent(formatted),
    filename,
  });
};
