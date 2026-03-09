import '@webcomponents/custom-elements';
import { runExtension } from './extension';

try {
  await runExtension();
} catch (error: unknown) {
  console.error('Error running extension:', error);
}
