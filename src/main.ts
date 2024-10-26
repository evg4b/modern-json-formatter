import '../packages/wasm_exec.js';
import { runExtension } from './extension';

runExtension().catch((error: unknown) => console.error('Error running extension:', error));
