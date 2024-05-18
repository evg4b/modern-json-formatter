import { element } from './helpres';

export const buildErrorNode = () => {
  const wrapper = document.createElement('div');
  wrapper.className = 'error';
  const image = document.createElement('img');
  image.src = chrome.runtime.getURL('invalid.svg');
  image.alt = 'Error';
  const message = document.createElement('div');
  message.className = 'message';
  message.append(
    element({ content: 'Invalid json file.' }),
    element({ content: 'Please check the file and try again.' }),
  )
  wrapper.append(
    image,
    message,
  );

  return wrapper;
};
