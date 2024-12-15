import '@webcomponents/custom-elements';
import { TextDecoder, TextEncoder } from 'text-encoding';
global.TextDecoder = TextDecoder;
global.TextEncoder = TextEncoder;
import './worker-core/wasm_exec.js';
