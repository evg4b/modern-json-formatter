export const resource = (path: string): string => chrome?.runtime?.getURL?.(path) ?? path;

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 100;
const CONNECTION_ERROR = 'Could not establish connection. Receiving end does not exist.';

const delay = (ms: number): Promise<void> => new Promise<void>(resolve => setTimeout(resolve, ms));

const isConnectionError = (error: unknown): boolean => error instanceof Error && error.message.includes(CONNECTION_ERROR);

const sendMessageWithRetry = async <M, R>(message: M, attempt: number): Promise<R> => {
  try {
    return await (chrome.runtime.sendMessage as (message: M) => Promise<R>)(message);
  } catch (error: unknown) {
    if (attempt <= MAX_RETRIES && isConnectionError(error)) {
      await delay(RETRY_DELAY_MS * attempt);

      return sendMessageWithRetry<M, R>(message, attempt + 1);
    }

    throw error;
  }
};

export const sendMessage = <M = unknown, R = unknown>(message: M): Promise<R> => sendMessageWithRetry<M, R>(message, 1);
