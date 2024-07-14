import { readFile } from 'fs/promises';
import { resolve } from 'node:path';
import { runExtension } from './extension';
import '../tokenizer/wasm_exec.js';

jest.mock('./tokenizer', () => ({
  initParser: jest.fn().mockReturnValueOnce(Promise.resolve()),
}));

function buildChromeJsonPage(json: string) {
  document.body.innerHTML = ``;
  const pre = document.createElement('pre');
  pre.innerText = json;
  document.body.appendChild(pre);
  const container = document.createElement('div');
  container.classList.add('json-formatter-container');
  document.body.appendChild(container);
}

describe('extension', () => {
  const originalFetch = global.fetch;
  let go: Go;

  beforeEach(() => {
    Object.assign(global, {
      chrome: {
        runtime: {
          getURL: jest.fn(() => 'tokenizer.wasm'),
        },
      },
    });
  });

  beforeAll(async () => {
    const wasmBuffer = await readFile(resolve(__dirname, '../tokenizer/tokenizer.wasm'));
    go = new Go();
    const wasm = await WebAssembly.instantiate(wasmBuffer, go.importObject);
    void go.run(wasm.instance);
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  describe('for valid json', () => {
    beforeEach(() => {
      buildChromeJsonPage(`{"userId": 1,"id": 1,"title": "delectus aut autem","completed": false}`);
    });

    test('should render extension', async () => {
      await runExtension();

      expect(document.body.shadowRoot?.innerHTML).toMatchSnapshot();
    });
  });
});
