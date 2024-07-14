import { TextDecoder, TextEncoder } from 'text-encoding';
global.TextDecoder = TextDecoder;
global.TextEncoder = TextEncoder;
import './packages/wasm_exec.js';

