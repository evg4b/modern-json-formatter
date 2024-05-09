import { isNotNull } from 'typed-assert';
import { buildDom } from './dom/build-dom';
import styles from './styles.scss';
import '../parser/wasm_exec.js';

const runPlugin = async () => {
  const shadow = document.body.attachShadow({ mode: 'open' });
  const styleNode = document.createElement('style');
  styleNode.textContent = styles;

  shadow.appendChild(styleNode);

  const data = document.querySelector<HTMLPreElement>('body > pre');

  isNotNull(data, 'No data found');

  const go = new Go();
  const wasm = await fetch(chrome.runtime.getURL('parser.wasm'));
  WebAssembly.instantiateStreaming(wasm, go.importObject).then((result) => {
    go.run(result.instance);
    console.log(parseJSON(data.innerText))
  });

  console.log('originalPreElement:', JSON.parse(data.innerText));
  shadow.appendChild(buildDom(JSON.parse(data.innerText)));
};

const isJson = document.querySelector('pre + .json-formatter-container');
if (isJson) {
  runPlugin();
}

