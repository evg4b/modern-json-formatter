import { isNotNull } from 'typed-assert';
import { buildDom } from './dom';
import { initParser } from './parser';
import styles from './styles.scss';
import { buildButtons } from './ui/buttons';
import { buildContainers } from './ui/containers';

const runPlugin = async () => {
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

  await initParser();

  const parsedJson = parseJSON(data.innerText);
  if (parsedJson.type === 'error') {
    console.error('Error parsing JSON:', parsedJson.error);
    return;
  }

  const dom = buildDom(parsedJson.value);
  formatContainer.appendChild(dom);
};

if (document.querySelector('pre + .json-formatter-container')) {
  runPlugin()
    .catch((error) => console.error('Error running plugin:', error));
}

