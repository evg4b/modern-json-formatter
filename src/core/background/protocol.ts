import type { ErrorNode, TokenNode, TupleNode } from '@wasm/types';

export type DownloadType = 'raw' | 'formatted' | 'minified';

export interface DomainCount {
  domain: string;
  count: number;
}

export interface Protocol {
  'tokenize': { payload: string; reply: TokenNode };
  'format': { payload: string; reply: string };
  'jq': { payload: { json: string; query: string }; reply: TupleNode };
  'get-history': { payload: { domain: string; prefix: string }; reply: string[] };
  'push-history': { payload: { domain: string; query: string }; reply: void };
  'clear-history': { payload: undefined; reply: void };
  'get-domains': { payload: undefined; reply: DomainCount[] };
  'download': { payload: { type: DownloadType; filename: string; content: string }; reply: void };
}

export type Action = keyof Protocol;
export type Payload<A extends Action> = Protocol[A]['payload'];
export type Reply<A extends Action> = Protocol[A]['reply'];

export type Message<A extends Action = Action> = {
  [K in A]: { action: K; payload: Payload<K> };
}[A];

export type Handlers = {
  [A in Action]: (payload: Payload<A>) => Reply<A> | Promise<Reply<A>>;
};

export type Transport = (message: Message) => Promise<unknown>;

const ERROR_SCOPES: Partial<Record<Action, ErrorNode['scope']>> = {
  tokenize: 'tokenizer',
  format: 'tokenizer',
  jq: 'jq',
};

export const isErrorNode = (node: unknown): node is ErrorNode => {
  return !!node && typeof node === 'object' && 'type' in node && node.type === 'error';
};

const toErrorNode = (error: unknown, scope: ErrorNode['scope']): ErrorNode => {
  if (error instanceof Error) {
    return { type: 'error', scope, stack: error.stack, error: error.message };
  }

  return { type: 'error', scope, error: `Unknown error: ${String(error)}` };
};

export const createHandler = (handlers: Handlers) => async (message: Message): Promise<unknown> => {
  const action = (message as Partial<Message> | undefined)?.action;
  if (!action || !Object.hasOwn(handlers, action)) {
    return { type: 'error', scope: 'worker', error: `Unknown message type: ${action ?? 'N/A'}` } satisfies ErrorNode;
  }

  try {
    const handle = handlers[action] as (payload: unknown) => unknown;
    return await handle(message.payload);
  } catch (error: unknown) {
    return toErrorNode(error, ERROR_SCOPES[action] ?? 'worker');
  }
};

export const createClient = (transport: Transport) => async <A extends Action>(
  action: A,
  payload: Payload<A>,
): Promise<Reply<A>> => {
  const reply = await transport({ action, payload } as Message);
  if (isErrorNode(reply)) {
    throw reply;
  }

  return reply as Reply<A>;
};
