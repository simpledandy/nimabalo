import { BotError, ERROR_TYPES } from './types';
import { sleep, processError } from './utils';

export class ErrorHandler {
  static async handleWithRetry<T>(operation: () => Promise<T>, maxRetries = 3, context = ''): Promise<T> {
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error: any) {
        lastError = error;
        console.error(`[Attempt ${attempt}/${maxRetries}] ${context} error:`, error.message || error);

        if (attempt === maxRetries || !this.isRetryable(error)) {
          break;
        }

        const delay = this.getRetryDelay(error, attempt);
        await sleep(delay);
      }
    }

    throw processError(lastError);
  }

  static isRetryable(error: any) {
    const retryableTypes = [ERROR_TYPES.NETWORK, ERROR_TYPES.DATABASE, ERROR_TYPES.RATE_LIMIT];
    return retryableTypes.includes(error.type) || error.message?.includes('timeout') || error.message?.includes('connection');
  }

  static getRetryDelay(error: any, attempt: number) {
    if (error.type === ERROR_TYPES.RATE_LIMIT) {
      return Math.min(1000 * Math.pow(2, attempt), 60000);
    }
    return Math.min(1000 * attempt, 5000);
  }
}
