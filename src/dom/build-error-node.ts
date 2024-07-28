import { element } from './helpres';

export const buildErrorNode = (header: string, ...lines: string[]) => {
  const wrapper = document.createElement('div');
  wrapper.className = 'error';
  const image = document.createElement('img');
  image.src = chrome.runtime.getURL('invalid.svg');
  image.alt = 'Error';
  const message = document.createElement('div');
  message.className = 'message';
  message.append(
    element({ content: header }), // 'Invalid json file.' }),
    ...lines.map(line => element({ content: line })),
    // element({ content: 'Please check the file and try again.' }),
  );
  wrapper.append(
    image,
    message,
  );

  return wrapper;
};
