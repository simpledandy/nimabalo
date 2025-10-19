declare module 'node-telegram-bot-api' {
  import { EventEmitter } from 'events';

  type SendMessageOptions = any;

  export default class TelegramBot extends EventEmitter {
    constructor(token: string, options?: any);
    sendMessage(chatId: number | string, text: string, options?: SendMessageOptions): Promise<any>;
    onText(regex: RegExp, callback: (msg: any, match: any) => void): void;
    on(event: string, callback: (arg: any) => void): void;
    stopPolling(): Promise<void>;
  }
}
