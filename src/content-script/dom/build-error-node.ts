import { resource } from '@core/browser';
import { createElement } from '@core/dom';

export const buildErrorNode = (header: string, ...lines: string[]) => {
  const wrapper = document.createElement('div');
  wrapper.className = 'error';
  const image = document.createElement('img');

  image.src = resource('invalid.svg');
  image.alt = 'Error';
  const message = document.createElement('div');
  message.className = 'message';
  message.append(
    createElement({ element: 'span', content: header }), // 'Invalid json file.' }),
    ...lines.map(line => createElement({ element: 'span', content: line })),
    // element({ content: 'Please check the file and try again.' }),
  );
  wrapper.append(image, message);

  return wrapper;
};
