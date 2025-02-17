import '@webcomponents/custom-elements';
import { TextDecoder, TextEncoder } from 'node:util';
Object.assign(global, { TextDecoder, TextEncoder });
import './worker-core/wasm_exec.js';
