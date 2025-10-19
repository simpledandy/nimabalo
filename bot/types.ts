export type TgUser = {
  id: number;
  username?: string | null;
  first_name?: string | null;
  last_name?: string | null;
};

export type BotConfig = {
  botToken: string;
  databaseUrl: string;
  siteUrl: string;
  adminTelegramId?: string | number | null;
};

export class BotError extends Error {
  type: string;
  retryable: boolean;
  userMessage: string;

  constructor(message: string, type = 'UNKNOWN', retryable = false, userMessage: string | null = null) {
    super(message);
    this.name = 'BotError';
    this.type = type;
    this.retryable = retryable;
    this.userMessage = userMessage ?? message;
  }
}

export const ERROR_TYPES = {
  NETWORK: 'NETWORK_ERROR',
  DATABASE: 'DATABASE_ERROR',
  BOT_API: 'BOT_API_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  RATE_LIMIT: 'RATE_LIMIT_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR',
};
