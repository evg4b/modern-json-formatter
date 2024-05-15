import { readFile } from 'fs/promises';
import { resolve } from 'node:path';
import { runExtension } from './extension';
import '../parser/wasm_exec.js';

jest.mock('./parser', () => ({
  initParser: jest.fn().mockReturnValueOnce(Promise.resolve()),
}));

xdescribe('extension', () => {
  const originalFetch = global.fetch;
  const mockFetch = jest.fn();
  let go: Go;

  beforeEach(() => {
    Object.assign(global, {
      chrome: {
        runtime: {
          getURL: jest.fn(() => 'parser.wasm'),
        },
      },
    });
  });

  beforeAll(async () => {
    const data = await readFile(resolve(__dirname, '../parser/parser.wasm'));
    const wasmBuffer = await readFile('parser/parser.wasm');
    go = new Go();
    const wasm = await WebAssembly.instantiate(wasmBuffer, go.importObject);
    go.run(wasm.instance);
  });

  afterAll(() => {
    go.exit(0);
    global.fetch = originalFetch;
  });

  beforeEach(() => {
    document.body.innerHTML = ``;
    const pre = document.createElement('pre');
    pre.innerText = `{"userId": 1,"id": 1,"title": "delectus aut autem","completed": false}`;
    document.body.appendChild(pre);
    const container = document.createElement('div');
    container.classList.add('json-formatter-container');
    document.body.appendChild(container);
  });

  test('should run', async () => {
    await runExtension();

    expect(document.body.shadowRoot?.innerHTML).toMatchSnapshot();
  });
});
