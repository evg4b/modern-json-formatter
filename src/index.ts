import { isNotNull } from 'typed-assert';
import { buildDom } from './dom';
import { initParser } from './parser';
import styles from './styles.scss';

const runPlugin = async () => {
  const shadow = document.body.attachShadow({ mode: 'open' });
  const styleNode = document.createElement('style');
  styleNode.textContent = styles;

  shadow.appendChild(styleNode);

  const data = document.querySelector<HTMLPreElement>('body > pre');

  isNotNull(data, 'No data found');

  await initParser();

  const parsedJson = parseJSON(data.innerText);
  if (parsedJson.type === 'error') {
    console.error('Error parsing JSON:', parsedJson.error);
    return;
  }

  shadow.appendChild(buildDom(parsedJson.value));
  console.log('parsedJson:', parsedJson);
};

if (document.querySelector('pre + .json-formatter-container')) {
  runPlugin()
    .catch((error) => console.error('Error running plugin:', error));
}

