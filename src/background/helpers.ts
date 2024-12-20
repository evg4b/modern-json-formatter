import { FormatParams, JqParams, Message, TokenizeParams } from '@core/background';

interface Types {
  jq: JqParams;
  tokenize: TokenizeParams;
  'format': FormatParams;
}

export const is = <T extends Message['action']>(message: object, type: T): message is Types[T] => {
  return 'action' in message && message.action == type;
};
