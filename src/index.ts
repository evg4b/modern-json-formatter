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

  const dom = buildDom(parsedJson.value);
  shadow.appendChild(dom);
  dom.addEventListener('click', (event) => {
    if (event.target instanceof HTMLElement) {
      console.log('Clicked:', event.target.className.includes('array-handler'));
      console.log(event.target.parentNode);
    }
  });
};

if (document.querySelector('pre + .json-formatter-container')) {
  runPlugin()
    .catch((error) => console.error('Error running plugin:', error));
}

