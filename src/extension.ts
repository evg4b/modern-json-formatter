import { isNotNull } from 'typed-assert';
import { buildDom } from './dom';
import { buildErrorNode } from './dom/build-error-node';
import { buildButtons } from './ui/buttons';
import { buildContainers } from './ui/containers';
import styles from './styles.scss';

export const runExtension = async () => {
  if (!document.querySelector('pre + .json-formatter-container')) {
    return;
  }

  const { tokenize } = await import('@tokenizer');

  const shadow = document.body.attachShadow({ mode: 'open' });
  const styleNode = document.createElement('style');
  styleNode.textContent = styles;

  shadow.appendChild(styleNode);

  const data = document.querySelector<HTMLPreElement>('body > pre');
  isNotNull(data, 'No data found');

  const { rootContainer, rawContainer, formatContainer } = buildContainers(shadow);
  rawContainer.appendChild(data);

  const { rawButton, formatButton } = buildButtons(shadow);

  rawButton.addEventListener('click', () => {
    rootContainer.classList.remove('formatted');
    rootContainer.classList.add('raw');
  });

  formatButton.addEventListener('click', () => {
    rootContainer.classList.remove('raw');
    rootContainer.classList.add('formatted');
  });

  const parsedJson = await tokenize(data.innerText);
  if (parsedJson.type === 'error') {
    console.error('Error parsing JSON:', parsedJson.error);
    formatContainer.appendChild(
      buildErrorNode(),
    );
    return;
  }

  formatContainer.appendChild(
    buildDom(parsedJson),
  );
};
