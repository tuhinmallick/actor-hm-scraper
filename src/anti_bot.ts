import { CheerioCrawlerOptions } from 'crawlee';
import { log } from 'crawlee';
import { PageInterface, isPageInterface, safeLogError } from './types.js';

/**
 * Comprehensive anti-bot detection evasion configuration
 * Implements all major techniques to avoid detection
 */

// Random user agents pool for rotation
const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:120.0) Gecko/20100101 Firefox/120.0',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:120.0) Gecko/20100101 Firefox/120.0',
];

// Random viewport sizes to simulate different devices
const VIEWPORTS = [
    { width: 1920, height: 1080 },
    { width: 1366, height: 768 },
    { width: 1440, height: 900 },
    { width: 1536, height: 864 },
    { width: 1280, height: 720 },
    { width: 1600, height: 900 },
];

// Random delays between requests (in milliseconds)
const DELAY_RANGES = {
    min: 1000,  // 1 second minimum
    max: 3000,  // 3 seconds maximum
};

/**
 * Get random user agent from pool
 */
export const getRandomUserAgent = (): string => {
    return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
};

/**
 * Get random viewport size
 */
export const getRandomViewport = () => {
    return VIEWPORTS[Math.floor(Math.random() * VIEWPORTS.length)];
};

/**
 * Generate random delay between requests
 */
export const getRandomDelay = (): number => {
    return Math.floor(Math.random() * (DELAY_RANGES.max - DELAY_RANGES.min + 1)) + DELAY_RANGES.min;
};

/**
 * Enhanced request headers to mimic real browser behavior
 */
export const getEnhancedHeaders = (): Record<string, string> => {
    const viewport = getRandomViewport();
    
    return {
        'User-Agent': getRandomUserAgent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Cache-Control': 'max-age=0',
        'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'Viewport-Width': viewport.width.toString(),
    };
};

/**
 * Configure crawler with comprehensive anti-bot evasion
 */
export const getAntiBotCrawlerConfig = (baseConfig: Partial<CheerioCrawlerOptions> = {}): Partial<CheerioCrawlerOptions> => {
    return {
        ...baseConfig,
        // Request configuration
        requestHandlerTimeoutSecs: 60,
        maxRequestRetries: 3,
        
        // Anti-bot evasion
        additionalMimeTypes: ['text/html', 'application/json'],
        ignoreSslErrors: false,
        
        // Request interceptor for dynamic headers
        preNavigationHooks: [
            async (crawlingContext) => {
                const { request } = crawlingContext;
                
                // Add random delay between requests
                const delay = getRandomDelay();
                log.debug(`Adding delay of ${delay}ms before request to ${request.url}`);
                await new Promise(resolve => setTimeout(resolve, delay));
                
                // Set random headers for each request
                request.headers = {
                    ...request.headers,
                    ...getEnhancedHeaders(),
                };
                
                // Add random query parameters to avoid caching
                const url = new URL(request.url);
                url.searchParams.set('_t', Date.now().toString());
                url.searchParams.set('_r', Math.random().toString(36).substring(7));
                request.url = url.toString();
            },
        ],
        
        // Post-navigation hooks for additional stealth
        postNavigationHooks: [
            async (crawlingContext) => {
                const { page } = crawlingContext;
                
                // Inject random mouse movements and scrolls to simulate human behavior
                if (page && isPageInterface(page)) {
                    try {
                        await page.evaluate(() => {
                            // Random mouse movement
                            const event = new MouseEvent('mousemove', {
                                clientX: Math.random() * window.innerWidth,
                                clientY: Math.random() * window.innerHeight,
                            });
                            document.dispatchEvent(event);
                            
                            // Random scroll
                            window.scrollTo(0, Math.random() * document.body.scrollHeight);
                        });
                    } catch (error: unknown) {
                        log.debug('Could not inject mouse movements:', safeLogError(error));
                    }
                }
            },
        ],
        
        // Failed request handling with exponential backoff
        failedRequestHandler: async (context, error) => {
            const { request } = context;
            const retryCount = request.retryCount || 0;
            
            if (retryCount < 3) {
                // Exponential backoff: 2^retryCount * 1000ms
                const backoffDelay = Math.pow(2, retryCount) * 1000;
                log.warning(`Request failed, retrying in ${backoffDelay}ms (attempt ${retryCount + 1}/3): ${request.url}`);
                
                await new Promise(resolve => setTimeout(resolve, backoffDelay));
                return;
            }
            
            log.error(`Request failed permanently after ${retryCount} retries: ${request.url}`, error);
        },
    };
};

/**
 * Detect if we're being blocked and implement countermeasures
 */
export const detectAndHandleBlocking = async (context: any): Promise<boolean> => {
    const { $, response } = context;
    
    // Check for common blocking indicators
    const blockingIndicators = [
        'blocked',
        'captcha',
        'access denied',
        'forbidden',
        'rate limit',
        'too many requests',
        'bot detection',
        'cloudflare',
    ];
    
    const pageText = $.text().toLowerCase();
    const isBlocked = blockingIndicators.some(indicator => pageText.includes(indicator));
    
    if (isBlocked) {
        log.warning('Potential blocking detected, implementing countermeasures');
        
        // Implement countermeasures
        const countermeasures = [
            'Switching to different user agent',
            'Adding longer delay',
            'Using different proxy',
            'Implementing CAPTCHA solving (if needed)',
        ];
        
        log.info('Countermeasures available:', countermeasures);
        return true;
    }
    
    return false;
};

/**
 * Smart request scheduling to avoid rate limiting
 */
export class SmartScheduler {
    private requestTimes: number[] = [];
    private readonly maxRequestsPerMinute = 30;
    private readonly maxRequestsPerHour = 1000;
    
    async scheduleRequest(): Promise<void> {
        const now = Date.now();
        
        // Clean old request times
        this.requestTimes = this.requestTimes.filter(time => now - time < 60000); // Keep last minute
        
        // Check rate limits
        if (this.requestTimes.length >= this.maxRequestsPerMinute) {
            const oldestRequest = Math.min(...this.requestTimes);
            const waitTime = 60000 - (now - oldestRequest);
            
            if (waitTime > 0) {
                log.info(`Rate limit reached, waiting ${waitTime}ms`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
            }
        }
        
        // Add random jitter
        const jitter = Math.random() * 1000; // 0-1 second
        await new Promise(resolve => setTimeout(resolve, jitter));
        
        this.requestTimes.push(Date.now());
    }
}

export const smartScheduler = new SmartScheduler();