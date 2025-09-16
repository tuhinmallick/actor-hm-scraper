import { log } from 'crawlee';
import { Actor } from 'apify';
import { 
    RETRY_CONFIGS, 
    classifyError, 
    ScrapingError,
    NetworkError,
    ParsingError,
    ValidationError,
    RateLimitError,
    BlockingError,
    safeLogError
} from './types.js';

/**
 * Comprehensive error handling and retry mechanisms
 * Implements exponential backoff, circuit breakers, and graceful degradation
 */

export interface RetryConfig {
    maxRetries: number;
    baseDelay: number;
    maxDelay: number;
    backoffMultiplier: number;
    retryableErrors: string[];
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
    maxRetries: 5,
    baseDelay: 1000,
    maxDelay: 30000,
    backoffMultiplier: 2,
    retryableErrors: [
        'ECONNRESET',
        'ETIMEDOUT',
        'ENOTFOUND',
        'ECONNREFUSED',
        'timeout',
        'network',
        'rate limit',
        'too many requests',
        'service unavailable',
        'internal server error',
    ],
};

// Re-export shared configurations
export { RETRY_CONFIGS };

/**
 * Enhanced error classification
 */
export enum ErrorType {
    NETWORK = 'NETWORK',
    PARSING = 'PARSING',
    VALIDATION = 'VALIDATION',
    RATE_LIMIT = 'RATE_LIMIT',
    BLOCKING = 'BLOCKING',
    UNKNOWN = 'UNKNOWN',
}

export interface ClassifiedError {
    type: ErrorType;
    message: string;
    retryable: boolean;
    severity: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Calculate delay for exponential backoff
 */
export const calculateBackoffDelay = (attempt: number, config: RetryConfig): number => {
    const delay = config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1);
    const jitter = Math.random() * 0.1 * delay; // Add 10% jitter
    return Math.min(delay + jitter, config.maxDelay);
};

/**
 * Enhanced retry mechanism with exponential backoff
 */
export const retryWithBackoff = async <T>(
    operation: () => Promise<T>,
    config: RetryConfig = DEFAULT_RETRY_CONFIG,
    context?: string
): Promise<T> => {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
        try {
            const result = await operation();
            
            if (attempt > 1) {
                log.info(`Operation succeeded on attempt ${attempt}${context ? ` for ${context}` : ''}`);
            }
            
            return result;
        } catch (error) {
            lastError = error as Error;
            const classifiedError = classifyError(lastError);
            
            log.warning(`Attempt ${attempt}/${config.maxRetries} failed${context ? ` for ${context}` : ''}: ${classifiedError.message}`);
            
            // Don't retry if error is not retryable
            if (!classifiedError.retryable) {
                log.error(`Non-retryable error encountered: ${classifiedError.message}`);
                throw lastError;
            }
            
            // Don't retry on last attempt
            if (attempt === config.maxRetries) {
                log.error(`All retry attempts exhausted${context ? ` for ${context}` : ''}`);
                throw lastError;
            }
            
            // Calculate delay and wait
            const delay = calculateBackoffDelay(attempt, config);
            log.info(`Waiting ${Math.round(delay)}ms before retry ${attempt + 1}${context ? ` for ${context}` : ''}`);
            
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    
    throw lastError!;
};

/**
 * Circuit breaker pattern implementation
 */
export class CircuitBreaker {
    private failureCount = 0;
    private lastFailureTime = 0;
    private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
    
    constructor(
        private failureThreshold = 5,
        private timeout = 60000, // 1 minute
        private resetTimeout = 300000 // 5 minutes
    ) {}
    
    async execute<T>(operation: () => Promise<T>, context?: string): Promise<T> {
        if (this.state === 'OPEN') {
            if (Date.now() - this.lastFailureTime > this.resetTimeout) {
                this.state = 'HALF_OPEN';
                log.info(`Circuit breaker transitioning to HALF_OPEN${context ? ` for ${context}` : ''}`);
            } else {
                throw new Error(`Circuit breaker is OPEN${context ? ` for ${context}` : ''}`);
            }
        }
        
        try {
            const result = await operation();
            this.onSuccess();
            return result;
        } catch (error) {
            this.onFailure();
            throw error;
        }
    }
    
    private onSuccess(): void {
        this.failureCount = 0;
        this.state = 'CLOSED';
    }
    
    private onFailure(): void {
        this.failureCount++;
        this.lastFailureTime = Date.now();
        
        if (this.failureCount >= this.failureThreshold) {
            this.state = 'OPEN';
            log.error(`Circuit breaker opened after ${this.failureCount} failures`);
        }
    }
    
    getState(): string {
        return this.state;
    }
}

/**
 * Global circuit breakers for different operations
 */
export const circuitBreakers = {
    navigation: new CircuitBreaker(3, 30000, 120000),
    productPage: new CircuitBreaker(5, 60000, 300000),
    dataSaving: new CircuitBreaker(10, 30000, 60000),
};

/**
 * Enhanced error handler for crawler
 */
export const createEnhancedErrorHandler = () => {
    return async (context: any, error: Error) => {
        const { request } = context;
        const classifiedError = classifyError(error);
        
        // Log error with context
        log.error(`Request failed: ${request.url}`, {
            error: classifiedError.message,
            type: classifiedError.type,
            severity: classifiedError.severity,
            retryable: classifiedError.retryable,
            retryCount: request.retryCount || 0,
        });
        
        // Save error to statistics
        try {
            const actorStatistics = (await import('./actor_statistics.js')).default;
            actorStatistics.saveError(request.url, classifiedError.message);
        } catch (statsError: unknown) {
            log.warning('Could not save error to statistics:', safeLogError(statsError));
        }
        
        // Handle different error types
        switch (classifiedError.type) {
            case ErrorType.RATE_LIMIT:
                log.warning('Rate limit detected, implementing longer delay');
                await new Promise(resolve => setTimeout(resolve, 30000)); // 30 second delay
                break;
                
            case ErrorType.BLOCKING:
                log.error('Potential blocking detected, consider switching proxies or user agents');
                break;
                
            case ErrorType.NETWORK:
                log.info('Network error, will retry with backoff');
                break;
                
            case ErrorType.PARSING:
                log.warning('Parsing error, skipping this page');
                break;
                
            default:
                log.info('Unknown error type, using default handling');
        }
    };
};

/**
 * Graceful degradation for critical operations
 */
export const withGracefulDegradation = async <T>(
    primaryOperation: () => Promise<T>,
    fallbackOperation: () => Promise<T>,
    context?: string
): Promise<T> => {
    try {
        return await primaryOperation();
    } catch (error: unknown) {
        log.warning(`Primary operation failed${context ? ` for ${context}` : ''}, trying fallback:`, safeLogError(error));
        
        try {
            return await fallbackOperation();
        } catch (fallbackError) {
            log.error(`Both primary and fallback operations failed${context ? ` for ${context}` : ''}:`, {
                primaryError: error,
                fallbackError,
            });
            throw fallbackError;
        }
    }
};

/**
 * Error recovery strategies
 */
export const recoveryStrategies = {
    // Switch to different user agent
    switchUserAgent: async (context: any) => {
        const { getRandomUserAgent } = await import('./anti_bot.js');
        context.request.headers = {
            ...context.request.headers,
            'User-Agent': getRandomUserAgent(),
        };
    },
    
    // Add longer delay
    addDelay: async (delayMs: number = 10000) => {
        await new Promise(resolve => setTimeout(resolve, delayMs));
    },
    
    // Switch to different proxy (if available)
    switchProxy: async (_context: any) => {
        // This would be implemented based on your proxy configuration
        log.info('Proxy switching not implemented in this version');
    },
    
    // Skip problematic page
    skipPage: async (context: any) => {
        log.info(`Skipping problematic page: ${context.request.url}`);
        return null;
    },
};