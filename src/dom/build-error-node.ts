import { t } from '../helpres';
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
    element({ content: t('error_invalid_json_title') }),
    element({ content: t('error_invalid_json_message') }),
  );

  wrapper.append(image, message);

  return wrapper;
};
