import 'fake-indexeddb/auto';
import '@webcomponents/custom-elements';
import { TextDecoder, TextEncoder } from 'node:util';
Object.assign(global, {
  TextDecoder,
  TextEncoder,
  structuredClone: jest.fn(val => JSON.parse(JSON.stringify(val))),
});
import './worker-core/wasm_exec.js';
import { jest } from '@jest/globals';
