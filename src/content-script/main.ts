import '../../packages/wasm_exec.js';
import '@webcomponents/custom-elements';
import { runExtension } from './extension';

runExtension().catch((error: unknown) => console.error('Error running extension:', error));
