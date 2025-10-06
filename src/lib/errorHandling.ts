/**
 * Unified Error Handling System for Nimabalo
 * Centralizes all error handling logic and provides consistent error management
 */

export enum ErrorType {
  // Network & Connection
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  CONNECTION_LOST = 'CONNECTION_LOST',
  
  // Authentication & Authorization
  AUTH_TOKEN_EXPIRED = 'AUTH_TOKEN_EXPIRED',
  AUTH_INVALID_CREDENTIALS = 'AUTH_INVALID_CREDENTIALS',
  AUTH_USER_NOT_FOUND = 'AUTH_USER_NOT_FOUND',
  AUTH_PERMISSION_DENIED = 'AUTH_PERMISSION_DENIED',
  
  // Database & Storage
  DATABASE_ERROR = 'DATABASE_ERROR',
  DATABASE_CONNECTION_FAILED = 'DATABASE_CONNECTION_FAILED',
  DATABASE_QUERY_FAILED = 'DATABASE_QUERY_FAILED',
  
  // Telegram Bot
  BOT_TOKEN_INVALID = 'BOT_TOKEN_INVALID',
  BOT_RATE_LIMITED = 'BOT_RATE_LIMITED',
  BOT_MESSAGE_FAILED = 'BOT_MESSAGE_FAILED',
  
  // Validation
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  
  // External Services
  SUPABASE_ERROR = 'SUPABASE_ERROR',
  EXTERNAL_API_ERROR = 'EXTERNAL_API_ERROR',
  
  // Generic
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR'
}

export interface ErrorContext {
  userId?: string;
  action?: string;
  component?: string;
  telegramId?: string;
  metadata?: Record<string, any>;
}

export interface ProcessedError {
  type: ErrorType;
  message: string;
  userMessage: string;
  shouldRetry: boolean;
  retryAfter?: number;
  context: ErrorContext;
  originalError?: any;
}

export class NimabaloError extends Error {
  public readonly type: ErrorType;
  public readonly context: ErrorContext;
  public readonly shouldRetry: boolean;
  public readonly retryAfter?: number;
  public readonly userMessage: string;

  constructor(
    type: ErrorType,
    message: string,
    userMessage: string,
    context: ErrorContext = {},
    shouldRetry: boolean = false,
    retryAfter?: number
  ) {
    super(message);
    this.name = 'NimabaloError';
    this.type = type;
    this.context = context;
    this.shouldRetry = shouldRetry;
    this.retryAfter = retryAfter;
    this.userMessage = userMessage;
  }
}

/**
 * Centralized error processor that categorizes and handles all errors
 */
export class ErrorProcessor {
  private static instance: ErrorProcessor;
  
  public static getInstance(): ErrorProcessor {
    if (!ErrorProcessor.instance) {
      ErrorProcessor.instance = new ErrorProcessor();
    }
    return ErrorProcessor.instance;
  }

  /**
   * Process any error and return a standardized error object
   */
  public processError(error: any, context: ErrorContext = {}): ProcessedError {
    // If it's already a NimabaloError, return it
    if (error instanceof NimabaloError) {
      return {
        type: error.type,
        message: error.message,
        userMessage: error.userMessage,
        shouldRetry: error.shouldRetry,
        retryAfter: error.retryAfter,
        context: { ...error.context, ...context },
        originalError: error
      };
    }

    // Analyze the error and determine its type
    const errorType = this.categorizeError(error);
    const userMessage = this.getUserFriendlyMessage(errorType, error);
    const shouldRetry = this.shouldRetryError(errorType, error);

    return {
      type: errorType,
      message: error.message || 'Unknown error occurred',
      userMessage,
      shouldRetry,
      retryAfter: this.getRetryDelay(errorType),
      context,
      originalError: error
    };
  }

  /**
   * Categorize error based on its properties
   */
  private categorizeError(error: any): ErrorType {
    const message = error.message?.toLowerCase() || '';
    const code = error.code || '';

    // Network errors
    if (message.includes('network') || message.includes('connection') || message.includes('fetch')) {
      return ErrorType.NETWORK_ERROR;
    }
    if (message.includes('timeout') || code === 'ETIMEDOUT') {
      return ErrorType.TIMEOUT_ERROR;
    }

    // Authentication errors
    if (message.includes('token') && message.includes('expired')) {
      return ErrorType.AUTH_TOKEN_EXPIRED;
    }
    if (message.includes('invalid') && (message.includes('credentials') || message.includes('login'))) {
      return ErrorType.AUTH_INVALID_CREDENTIALS;
    }
    if (message.includes('user not found') || message.includes('user does not exist')) {
      return ErrorType.AUTH_USER_NOT_FOUND;
    }

    // Database errors
    if (message.includes('database') || message.includes('connection') || code.includes('DB')) {
      return ErrorType.DATABASE_ERROR;
    }
    if (message.includes('connection') && message.includes('database')) {
      return ErrorType.DATABASE_CONNECTION_FAILED;
    }

    // Telegram bot errors
    if (message.includes('bot') && message.includes('token')) {
      return ErrorType.BOT_TOKEN_INVALID;
    }
    if (message.includes('rate limit') || message.includes('too many requests')) {
      return ErrorType.BOT_RATE_LIMITED;
    }

    // Supabase errors
    if (message.includes('supabase') || code.includes('SUPABASE')) {
      return ErrorType.SUPABASE_ERROR;
    }

    // Validation errors
    if (message.includes('validation') || message.includes('invalid input')) {
      return ErrorType.VALIDATION_ERROR;
    }

    return ErrorType.UNKNOWN_ERROR;
  }

  /**
   * Get user-friendly error message
   */
  private getUserFriendlyMessage(type: ErrorType, error: any): string {
    const messages: Record<ErrorType, string> = {
      [ErrorType.NETWORK_ERROR]: 'Internet aloqasi bilan bog\'liq muammo. Iltimos, qayta urining.',
      [ErrorType.TIMEOUT_ERROR]: 'So\'rov vaqti tugadi. Iltimos, qayta urining.',
      [ErrorType.CONNECTION_LOST]: 'Aloqa uzildi. Iltimos, qayta urining.',
      
      [ErrorType.AUTH_TOKEN_EXPIRED]: 'Kirish havolasi muddati tugagan. Yangi havola oling.',
      [ErrorType.AUTH_INVALID_CREDENTIALS]: 'Noto\'g\'ri kirish ma\'lumotlari.',
      [ErrorType.AUTH_USER_NOT_FOUND]: 'Foydalanuvchi topilmadi.',
      [ErrorType.AUTH_PERMISSION_DENIED]: 'Bu amalni bajarish uchun ruxsat yo\'q.',
      
      [ErrorType.DATABASE_ERROR]: 'Ma\'lumotlar bazasi bilan bog\'liq muammo.',
      [ErrorType.DATABASE_CONNECTION_FAILED]: 'Ma\'lumotlar bazasiga ulanishda muammo.',
      [ErrorType.DATABASE_QUERY_FAILED]: 'Ma\'lumotlarni olishda muammo.',
      
      [ErrorType.BOT_TOKEN_INVALID]: 'Telegram bot tokeni noto\'g\'ri.',
      [ErrorType.BOT_RATE_LIMITED]: 'Juda ko\'p so\'rov yuborildi. Kuting.',
      [ErrorType.BOT_MESSAGE_FAILED]: 'Xabar yuborishda muammo.',
      
      [ErrorType.VALIDATION_ERROR]: 'Kiritilgan ma\'lumotlar noto\'g\'ri.',
      [ErrorType.INVALID_INPUT]: 'Noto\'g\'ri ma\'lumot kiritildi.',
      [ErrorType.MISSING_REQUIRED_FIELD]: 'Majburiy maydon to\'ldirilmagan.',
      
      [ErrorType.SUPABASE_ERROR]: 'Ma\'lumotlar bazasi bilan bog\'liq muammo.',
      [ErrorType.EXTERNAL_API_ERROR]: 'Tashqi xizmat bilan bog\'liq muammo.',
      
      [ErrorType.UNKNOWN_ERROR]: 'Noma\'lum xatolik yuz berdi.',
      [ErrorType.INTERNAL_SERVER_ERROR]: 'Server xatoligi yuz berdi.'
    };

    return messages[type] || 'Kutilmagan xatolik yuz berdi.';
  }

  /**
   * Determine if error should be retried
   */
  private shouldRetryError(type: ErrorType, error: any): boolean {
    const retryableTypes = [
      ErrorType.NETWORK_ERROR,
      ErrorType.TIMEOUT_ERROR,
      ErrorType.CONNECTION_LOST,
      ErrorType.DATABASE_CONNECTION_FAILED,
      ErrorType.BOT_RATE_LIMITED
    ];

    return retryableTypes.includes(type);
  }

  /**
   * Get retry delay in milliseconds
   */
  private getRetryDelay(type: ErrorType): number | undefined {
    const delays: Partial<Record<ErrorType, number>> = {
      [ErrorType.NETWORK_ERROR]: 2000,
      [ErrorType.TIMEOUT_ERROR]: 3000,
      [ErrorType.CONNECTION_LOST]: 5000,
      [ErrorType.DATABASE_CONNECTION_FAILED]: 10000,
      [ErrorType.BOT_RATE_LIMITED]: 60000,
      [ErrorType.BOT_MESSAGE_FAILED]: 2000
    };

    return delays[type];
  }
}

/**
 * Error handler with retry logic
 */
export class ErrorHandler {
  private processor: ErrorProcessor;

  constructor() {
    this.processor = ErrorProcessor.getInstance();
  }

  /**
   * Handle error with automatic retry logic
   */
  public async handleError<T>(
    operation: () => Promise<T>,
    context: ErrorContext = {},
    maxRetries: number = 3
  ): Promise<T> {
    let lastError: any;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        const processedError = this.processor.processError(error, context);
        
        // Log error
        this.logError(processedError, attempt);
        
        // If it's the last attempt or error shouldn't be retried, throw
        if (attempt === maxRetries || !processedError.shouldRetry) {
          break;
        }
        
        // Wait before retry
        if (processedError.retryAfter) {
          await this.delay(processedError.retryAfter);
        }
      }
    }
    
    // Throw the processed error
    const processedError = this.processor.processError(lastError, context);
    throw new NimabaloError(
      processedError.type,
      processedError.message,
      processedError.userMessage,
      processedError.context,
      false
    );
  }

  /**
   * Handle error without retry
   */
  public handleErrorSync(error: any, context: ErrorContext = {}): ProcessedError {
    return this.processor.processError(error, context);
  }

  /**
   * Log error with appropriate level
   */
  private logError(processedError: ProcessedError, attempt: number): void {
    const logLevel = this.getLogLevel(processedError.type);
    const message = `[Attempt ${attempt}] ${processedError.type}: ${processedError.message}`;
    
    if (logLevel === 'error') {
      console.error(message, processedError.context);
    } else if (logLevel === 'warn') {
      console.warn(message, processedError.context);
    } else {
      console.log(message, processedError.context);
    }
  }

  /**
   * Get appropriate log level for error type
   */
  private getLogLevel(type: ErrorType): 'error' | 'warn' | 'info' {
    const errorLevels: Partial<Record<ErrorType, 'error' | 'warn' | 'info'>> = {
      [ErrorType.INTERNAL_SERVER_ERROR]: 'error',
      [ErrorType.DATABASE_ERROR]: 'error',
      [ErrorType.AUTH_TOKEN_EXPIRED]: 'warn',
      [ErrorType.BOT_RATE_LIMITED]: 'warn',
      [ErrorType.NETWORK_ERROR]: 'warn',
      [ErrorType.TIMEOUT_ERROR]: 'warn',
      [ErrorType.UNKNOWN_ERROR]: 'error'
    };

    return errorLevels[type] || 'error';
  }

  /**
   * Delay execution
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instances
export const errorProcessor = ErrorProcessor.getInstance();
export const errorHandler = new ErrorHandler();

// Convenience functions
export function createError(
  type: ErrorType,
  message: string,
  userMessage: string,
  context: ErrorContext = {}
): NimabaloError {
  return new NimabaloError(type, message, userMessage, context);
}

export function processError(error: any, context: ErrorContext = {}): ProcessedError {
  return errorProcessor.processError(error, context);
}

export function handleError<T>(
  operation: () => Promise<T>,
  context: ErrorContext = {},
  maxRetries: number = 3
): Promise<T> {
  return errorHandler.handleError(operation, context, maxRetries);
}
