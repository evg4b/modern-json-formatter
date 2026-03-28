import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

export async function getShortCommitHash(): Promise<string> {
  const { stdout } = await execAsync('git rev-parse --short HEAD');
  return stdout.trim();
}
