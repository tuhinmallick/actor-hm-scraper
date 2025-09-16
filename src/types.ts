/**
 * Centralized type definitions for the HM.com scraper
 * Provides type safety and eliminates the need for 'as any' casts
 */

/**
 * Product information extracted from breadcrumbs
 */
export interface ProductInfo {
    productName: string;
    division?: string;
    category?: string;
    subCategory?: string;
}

/**
 * Product object structure expected by combination functions
 */
export interface ProductObject {
    combinations?: Array<{
        articleNo: string;
        listPrice: string;
        salePrice: string;
        description: string;
        urlPath: string;
        imageUrl: string;
    }>;
    [key: string]: any; // Allow additional properties
}

/**
 * Page interface for browser automation
 */
export interface PageInterface {
    evaluate: (fn: () => void) => Promise<void>;
    [key: string]: any; // Allow additional properties
}

/**
 * Custom error types for better error handling
 */
export class ScrapingError extends Error {
    constructor(
        message: string,
        public readonly type: 'NETWORK' | 'PARSING' | 'VALIDATION' | 'RATE_LIMIT' | 'BLOCKING' | 'UNKNOWN',
        public readonly retryable: boolean = true,
        public readonly severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
    ) {
        super(message);
        this.name = 'ScrapingError';
    }
}

export class NetworkError extends ScrapingError {
    constructor(message: string) {
        super(message, 'NETWORK', true, 'medium');
        this.name = 'NetworkError';
    }
}

export class ParsingError extends ScrapingError {
    constructor(message: string) {
        super(message, 'PARSING', false, 'medium');
        this.name = 'ParsingError';
    }
}

export class ValidationError extends ScrapingError {
    constructor(message: string) {
        super(message, 'VALIDATION', false, 'low');
        this.name = 'ValidationError';
    }
}

export class RateLimitError extends ScrapingError {
    constructor(message: string) {
        super(message, 'RATE_LIMIT', true, 'high');
        this.name = 'RateLimitError';
    }
}

export class BlockingError extends ScrapingError {
    constructor(message: string) {
        super(message, 'BLOCKING', true, 'critical');
        this.name = 'BlockingError';
    }
}

/**
 * Type guards for runtime type checking
 */
export function isProductInfo(obj: unknown): obj is ProductInfo {
    if (!obj || typeof obj !== 'object') return false;
    
    const productInfo = obj as Record<string, unknown>;
    
    return (
        typeof productInfo.productName === 'string' &&
        (productInfo.division === undefined || typeof productInfo.division === 'string') &&
        (productInfo.category === undefined || typeof productInfo.category === 'string') &&
        (productInfo.subCategory === undefined || typeof productInfo.subCategory === 'string')
    );
}

export function isProductObject(obj: unknown): obj is ProductObject {
    if (!obj || typeof obj !== 'object') return false;
    
    const productObj = obj as Record<string, unknown>;
    
    // Check if it has combinations array or other expected properties
    return (
        Array.isArray(productObj.combinations) ||
        typeof productObj === 'object'
    );
}

export function isPageInterface(obj: unknown): obj is PageInterface {
    if (!obj || typeof obj !== 'object') return false;
    
    const page = obj as Record<string, unknown>;
    
    return (
        typeof page.evaluate === 'function'
    );
}

/**
 * Shared retry configurations to avoid duplication
 */
export const RETRY_CONFIGS = {
    PROXY_CONFIGURATION: {
        maxRetries: 3,
        baseDelay: 1000,
        maxDelay: 30000,
        backoffMultiplier: 2,
        retryableErrors: ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', 'ECONNREFUSED'] as string[]
    },
    
    CRAWLER_STARTUP: {
        maxRetries: 2,
        baseDelay: 5000,
        maxDelay: 30000,
        backoffMultiplier: 2,
        retryableErrors: ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', 'ECONNREFUSED'] as string[]
    },
    
    PRODUCT_EXTRACTION: {
        maxRetries: 2,
        baseDelay: 1000,
        maxDelay: 30000,
        backoffMultiplier: 2,
        retryableErrors: ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', 'PARSING_ERROR'] as string[]
    },
    
    DATA_SAVING: {
        maxRetries: 3,
        baseDelay: 1000,
        maxDelay: 30000,
        backoffMultiplier: 2,
        retryableErrors: ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', 'SAVE_ERROR'] as string[]
    }
};

/**
 * Error classification helper
 */
export function classifyError(error: unknown): {
    type: 'NETWORK' | 'PARSING' | 'VALIDATION' | 'RATE_LIMIT' | 'BLOCKING' | 'UNKNOWN';
    message: string;
    retryable: boolean;
    severity: 'low' | 'medium' | 'high' | 'critical';
} {
    if (error instanceof ScrapingError) {
        return {
            type: error.type,
            message: error.message,
            retryable: error.retryable,
            severity: error.severity
        };
    }
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    const lowerMessage = errorMessage.toLowerCase();
    
    // Network errors
    if (lowerMessage.includes('timeout') || lowerMessage.includes('econnreset') || 
        lowerMessage.includes('etimedout') || lowerMessage.includes('enotfound')) {
        return {
            type: 'NETWORK',
            message: errorMessage,
            retryable: true,
            severity: 'medium',
        };
    }
    
    // Rate limiting
    if (lowerMessage.includes('rate limit') || lowerMessage.includes('too many requests') ||
        lowerMessage.includes('429')) {
        return {
            type: 'RATE_LIMIT',
            message: errorMessage,
            retryable: true,
            severity: 'high',
        };
    }
    
    // Blocking/CAPTCHA
    if (lowerMessage.includes('blocked') || lowerMessage.includes('captcha') ||
        lowerMessage.includes('access denied') || lowerMessage.includes('forbidden')) {
        return {
            type: 'BLOCKING',
            message: errorMessage,
            retryable: true,
            severity: 'critical',
        };
    }
    
    // Parsing errors
    if (lowerMessage.includes('parse') || lowerMessage.includes('json') ||
        lowerMessage.includes('invalid') || lowerMessage.includes('malformed')) {
        return {
            type: 'PARSING',
            message: errorMessage,
            retryable: false,
            severity: 'medium',
        };
    }
    
    // Validation errors
    if (lowerMessage.includes('validation') || lowerMessage.includes('required') ||
        lowerMessage.includes('missing')) {
        return {
            type: 'VALIDATION',
            message: errorMessage,
            retryable: false,
            severity: 'low',
        };
    }
    
    // Unknown errors
    return {
        type: 'UNKNOWN',
        message: errorMessage,
        retryable: true,
        severity: 'medium',
    };
}

/**
 * Safe error logging helper that converts unknown errors to objects
 */
export function safeLogError(error: unknown): Record<string, any> {
    if (error instanceof Error) {
        return { message: error.message, name: error.name, stack: error.stack };
    }
    if (typeof error === 'string') {
        return { message: error };
    }
    if (error && typeof error === 'object' && 'message' in error) {
        return { message: String((error as any).message), original: error };
    }
    return { message: String(error), original: error };
}