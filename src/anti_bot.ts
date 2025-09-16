import { CheerioCrawlerOptions } from 'crawlee';
import { log } from 'crawlee';

/**
 * Comprehensive anti-bot detection evasion configuration
 * Implements all major techniques to avoid detection
 */

// Enhanced user agents pool with more realistic and recent versions
const USER_AGENTS = [
    // Chrome on Windows (most common)
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
    
    // Chrome on macOS
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
    
    // Safari on macOS
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Safari/605.1.15',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Safari/605.1.15',
    
    // Firefox on Windows
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:132.0) Gecko/20100101 Firefox/132.0',
    
    // Firefox on macOS
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:133.0) Gecko/20100101 Firefox/133.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:132.0) Gecko/20100101 Firefox/132.0',
    
    // Chrome on Linux
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
    
    // Firefox on Linux
    'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:133.0) Gecko/20100101 Firefox/133.0',
    'Mozilla/5.0 (X11; Linux x86_64; rv:132.0) Gecko/20100101 Firefox/132.0',
    
    // Edge on Windows
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0',
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

// Enhanced delay ranges for more human-like behavior
const DELAY_RANGES = {
    min: 2000,  // 2 seconds minimum (increased for better stealth)
    max: 8000,  // 8 seconds maximum (increased for better stealth)
    burstDelay: 500,  // Short delay for burst requests
    longDelay: 15000, // Long delay for recovery
};

// Session management for maintaining cookies and state
class SessionManager {
    private sessions: Map<string, any> = new Map();
    private currentSessionId: string = '';
    
    createSession(): string {
        const sessionId = Math.random().toString(36).substring(7);
        this.sessions.set(sessionId, {
            cookies: new Map(),
            userAgent: getRandomUserAgent(),
            viewport: getRandomViewport(),
            createdAt: Date.now(),
            requestCount: 0,
        });
        this.currentSessionId = sessionId;
        return sessionId;
    }
    
    getCurrentSession() {
        return this.sessions.get(this.currentSessionId);
    }
    
    incrementRequestCount() {
        const session = this.getCurrentSession();
        if (session) {
            session.requestCount++;
        }
    }
    
    shouldRotateSession(): boolean {
        const session = this.getCurrentSession();
        return session ? session.requestCount > 50 : true; // Rotate every 50 requests
    }
    
    rotateSession(): string {
        return this.createSession();
    }
}

const sessionManager = new SessionManager();

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
 * Enhanced request headers to mimic real browser behavior with session consistency
 */
export const getEnhancedHeaders = (sessionId?: string): Record<string, string> => {
    const session = sessionId ? sessionManager.getCurrentSession() : null;
    const viewport = session?.viewport || getRandomViewport();
    const userAgent = session?.userAgent || getRandomUserAgent();
    
    // Extract browser info from user agent for consistent headers
    const isChrome = userAgent.includes('Chrome');
    const isFirefox = userAgent.includes('Firefox');
    const isSafari = userAgent.includes('Safari') && !userAgent.includes('Chrome');
    const isEdge = userAgent.includes('Edg');
    
    const headers: Record<string, string> = {
        'User-Agent': userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'en-US,en;q=0.9,de;q=0.8,fr;q=0.7,es;q=0.6',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Cache-Control': 'max-age=0',
        'Viewport-Width': viewport.width.toString(),
    };
    
    // Browser-specific headers
    if (isChrome) {
        headers['sec-ch-ua'] = '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"';
        headers['sec-ch-ua-mobile'] = '?0';
        headers['sec-ch-ua-platform'] = userAgent.includes('Windows') ? '"Windows"' : 
                                       userAgent.includes('Mac') ? '"macOS"' : '"Linux"';
        headers['sec-ch-ua-platform-version'] = userAgent.includes('Windows') ? '"15.0.0"' : 
                                              userAgent.includes('Mac') ? '"15.0.0"' : '"6.0.0"';
    }
    
    if (isFirefox) {
        headers['Sec-Fetch-Dest'] = 'document';
        headers['Sec-Fetch-Mode'] = 'navigate';
        headers['Sec-Fetch-Site'] = 'none';
        headers['Sec-Fetch-User'] = '?1';
    }
    
    if (isSafari) {
        headers['Accept'] = 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8';
        headers['Accept-Language'] = 'en-US,en;q=0.5';
    }
    
    // Add referrer for more realistic browsing
    headers['Referer'] = 'https://www.google.com/';
    
    return headers;
};

/**
 * Configure crawler with comprehensive anti-bot evasion
 */
export const getAntiBotCrawlerConfig = (baseConfig: Partial<CheerioCrawlerOptions> = {}): Partial<CheerioCrawlerOptions> => {
    // Initialize session
    sessionManager.createSession();
    
    return {
        ...baseConfig,
        // Request configuration
        requestHandlerTimeoutSecs: 90, // Increased timeout
        maxRequestRetries: 5, // Increased retries
        
        // Anti-bot evasion
        additionalMimeTypes: ['text/html', 'application/json'],
        ignoreSslErrors: false,
        
        // Request interceptor for dynamic headers and session management
        preNavigationHooks: [
            async (crawlingContext) => {
                const { request } = crawlingContext;
                
                // Check if we should rotate session
                if (sessionManager.shouldRotateSession()) {
                    sessionManager.rotateSession();
                    log.info('Rotated session due to request count');
                }
                
                // Add intelligent delay based on request type and previous failures
                const delay = getIntelligentDelay(request);
                log.debug(`Adding delay of ${delay}ms before request to ${request.url}`);
                await new Promise(resolve => setTimeout(resolve, delay));
                
                // Set consistent headers for session
                const session = sessionManager.getCurrentSession();
                request.headers = {
                    ...request.headers,
                    ...getEnhancedHeaders(session?.id),
                };
                
                // Add realistic query parameters
                const url = new URL(request.url);
                url.searchParams.set('_t', Date.now().toString());
                url.searchParams.set('_r', Math.random().toString(36).substring(7));
                
                // Add browser-specific parameters
                const userAgent = session?.userAgent || getRandomUserAgent();
                if (userAgent.includes('Chrome')) {
                    url.searchParams.set('_c', 'chrome');
                } else if (userAgent.includes('Firefox')) {
                    url.searchParams.set('_c', 'firefox');
                }
                
                request.url = url.toString();
                
                // Increment session request count
                sessionManager.incrementRequestCount();
            },
        ],
        
        // Post-navigation hooks for additional stealth
        postNavigationHooks: [
            async (crawlingContext) => {
                const { page, response } = crawlingContext;
                
                // Check for blocking indicators in response
                if (response?.status === 403) {
                    log.warning('403 detected, implementing countermeasures');
                    await implementBlockingCountermeasures(crawlingContext);
                }
                
                // Inject realistic browser behavior
                if (page) {
                    try {
                        await (page as any).evaluate(() => {
                            // Simulate realistic mouse movements
                            const movements = Math.floor(Math.random() * 5) + 3; // 3-7 movements
                            for (let i = 0; i < movements; i++) {
                                setTimeout(() => {
                                    const event = new MouseEvent('mousemove', {
                                        clientX: Math.random() * window.innerWidth,
                                        clientY: Math.random() * window.innerHeight,
                                    });
                                    document.dispatchEvent(event);
                                }, i * 200);
                            }
                            
                            // Simulate realistic scrolling
                            const scrollSteps = Math.floor(Math.random() * 3) + 1; // 1-3 scroll steps
                            for (let i = 0; i < scrollSteps; i++) {
                                setTimeout(() => {
                                    window.scrollTo(0, Math.random() * document.body.scrollHeight);
                                }, i * 500);
                            }
                            
                            // Simulate focus events
                            setTimeout(() => {
                                window.focus();
                                document.body.focus();
                            }, 1000);
                        });
                    } catch (error: any) {
                        log.debug('Could not inject browser behavior:', error);
                    }
                }
            },
        ],
        
        // Enhanced failed request handling with intelligent backoff
        failedRequestHandler: async (context, error) => {
            const { request } = context;
            const retryCount = request.retryCount || 0;
            
            // Classify error for appropriate handling
            const errorMessage = error?.message || error?.toString() || '';
            const isBlocking = errorMessage.includes('403') || errorMessage.includes('blocked');
            const isRateLimit = errorMessage.includes('429') || errorMessage.includes('rate limit');
            
            if (retryCount < 5) {
                let backoffDelay: number;
                
                if (isBlocking) {
                    // Longer delay for blocking
                    backoffDelay = Math.pow(2, retryCount) * 5000; // 5s, 10s, 20s, 40s, 80s
                    log.warning(`Blocking detected, implementing longer delay: ${backoffDelay}ms (attempt ${retryCount + 1}/5)`);
                    
                    // Rotate session on blocking
                    sessionManager.rotateSession();
                } else if (isRateLimit) {
                    // Very long delay for rate limiting
                    backoffDelay = Math.pow(2, retryCount) * 10000; // 10s, 20s, 40s, 80s, 160s
                    log.warning(`Rate limit detected, implementing very long delay: ${backoffDelay}ms (attempt ${retryCount + 1}/5)`);
                } else {
                    // Standard exponential backoff
                    backoffDelay = Math.pow(2, retryCount) * 2000; // 2s, 4s, 8s, 16s, 32s
                    log.warning(`Request failed, retrying in ${backoffDelay}ms (attempt ${retryCount + 1}/5): ${request.url}`);
                }
                
                await new Promise(resolve => setTimeout(resolve, backoffDelay));
                return;
            }
            
            log.error(`Request failed permanently after ${retryCount} retries: ${request.url}`, error);
        },
    };
};

/**
 * Get intelligent delay based on request context and previous failures
 */
const getIntelligentDelay = (request: any): number => {
    const url = request.url;
    const retryCount = request.retryCount || 0;
    
    // Base delay
    let delay = getRandomDelay();
    
    // Increase delay for retries
    if (retryCount > 0) {
        delay *= Math.pow(1.5, retryCount);
    }
    
    // Longer delay for product pages (more sensitive)
    if (url.includes('/produkte/') || url.includes('/products/')) {
        delay *= 1.5;
    }
    
    // Shorter delay for navigation/API calls
    if (url.includes('/apis/') || url.includes('/navigation/')) {
        delay *= 0.7;
    }
    
    return Math.min(delay, DELAY_RANGES.longDelay);
};

/**
 * Implement blocking countermeasures
 */
const implementBlockingCountermeasures = async (context: any): Promise<void> => {
    log.warning('Implementing blocking countermeasures');
    
    // Rotate session immediately
    sessionManager.rotateSession();
    
    // Add extra delay
    const extraDelay = DELAY_RANGES.longDelay + Math.random() * 10000;
    log.info(`Adding extra delay of ${extraDelay}ms due to blocking`);
    await new Promise(resolve => setTimeout(resolve, extraDelay));
    
    // Log countermeasures taken
    log.info('Blocking countermeasures implemented:', [
        'Session rotated',
        'Extra delay added',
        'Headers refreshed',
        'Request pattern modified'
    ]);
};

/**
 * Detect if we're being blocked and implement countermeasures
 */
export const detectAndHandleBlocking = async (context: any): Promise<boolean> => {
    const { $, response } = context;
    
    // Check response status first
    if (response?.status === 403 || response?.status === 429) {
        log.error(`Blocking detected via status code: ${response.status}`);
        await implementBlockingCountermeasures(context);
        return true;
    }
    
    // Check for common blocking indicators in page content
    const blockingIndicators = [
        'blocked',
        'captcha',
        'access denied',
        'forbidden',
        'rate limit',
        'too many requests',
        'bot detection',
        'cloudflare',
        'security check',
        'verification required',
        'please wait',
        'checking your browser',
    ];
    
    const pageText = $.text().toLowerCase();
    const isBlocked = blockingIndicators.some(indicator => pageText.includes(indicator));
    
    if (isBlocked) {
        log.warning('Potential blocking detected in page content, implementing countermeasures');
        await implementBlockingCountermeasures(context);
        return true;
    }
    
    return false;
};

/**
 * Smart request scheduling to avoid rate limiting with adaptive behavior
 */
export class SmartScheduler {
    private requestTimes: number[] = [];
    private readonly maxRequestsPerMinute = 20; // Reduced for better stealth
    private readonly maxRequestsPerHour = 500; // Reduced for better stealth
    private readonly maxRequestsPerDay = 5000; // Daily limit
    private failureCount = 0;
    private lastFailureTime = 0;
    private adaptiveDelay = 2000; // Base adaptive delay
    
    async scheduleRequest(): Promise<void> {
        const now = Date.now();
        
        // Clean old request times (keep last hour)
        this.requestTimes = this.requestTimes.filter(time => now - time < 3600000);
        
        // Check daily limit
        const dailyRequests = this.requestTimes.filter(time => now - time < 86400000).length;
        if (dailyRequests >= this.maxRequestsPerDay) {
            const waitTime = 86400000 - (now - Math.min(...this.requestTimes.filter(time => now - time < 86400000)));
            log.warning(`Daily request limit reached, waiting ${Math.round(waitTime / 1000)}s`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
        
        // Check hourly limit
        const hourlyRequests = this.requestTimes.filter(time => now - time < 3600000).length;
        if (hourlyRequests >= this.maxRequestsPerHour) {
            const oldestHourlyRequest = Math.min(...this.requestTimes.filter(time => now - time < 3600000));
            const waitTime = 3600000 - (now - oldestHourlyRequest);
            
            if (waitTime > 0) {
                log.warning(`Hourly rate limit reached, waiting ${Math.round(waitTime / 1000)}s`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
            }
        }
        
        // Check minute limit
        const minuteRequests = this.requestTimes.filter(time => now - time < 60000).length;
        if (minuteRequests >= this.maxRequestsPerMinute) {
            const oldestMinuteRequest = Math.min(...this.requestTimes.filter(time => now - time < 60000));
            const waitTime = 60000 - (now - oldestMinuteRequest);
            
            if (waitTime > 0) {
                log.info(`Minute rate limit reached, waiting ${Math.round(waitTime / 1000)}s`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
            }
        }
        
        // Add adaptive delay based on recent failures
        const adaptiveDelay = this.calculateAdaptiveDelay();
        if (adaptiveDelay > 0) {
            log.debug(`Adding adaptive delay of ${adaptiveDelay}ms`);
            await new Promise(resolve => setTimeout(resolve, adaptiveDelay));
        }
        
        // Add random jitter (10-30% of base delay)
        const jitter = this.adaptiveDelay * (0.1 + Math.random() * 0.2);
        await new Promise(resolve => setTimeout(resolve, jitter));
        
        this.requestTimes.push(Date.now());
    }
    
    private calculateAdaptiveDelay(): number {
        const now = Date.now();
        const timeSinceLastFailure = now - this.lastFailureTime;
        
        // If we had recent failures, increase delay
        if (timeSinceLastFailure < 300000) { // 5 minutes
            const failureMultiplier = Math.min(this.failureCount, 5); // Cap at 5x
            return this.adaptiveDelay * failureMultiplier;
        }
        
        // Gradually reduce delay if no recent failures
        if (timeSinceLastFailure > 600000) { // 10 minutes
            this.adaptiveDelay = Math.max(this.adaptiveDelay * 0.9, 2000); // Don't go below 2s
            this.failureCount = Math.max(this.failureCount - 1, 0);
        }
        
        return 0;
    }
    
    recordFailure(): void {
        this.failureCount++;
        this.lastFailureTime = Date.now();
        
        // Increase adaptive delay on failure
        this.adaptiveDelay = Math.min(this.adaptiveDelay * 1.5, 30000); // Cap at 30s
        
        log.warning(`Request failure recorded. Adaptive delay increased to ${this.adaptiveDelay}ms`);
    }
    
    recordSuccess(): void {
        // Gradually reduce failure count on success
        if (this.failureCount > 0) {
            this.failureCount = Math.max(this.failureCount - 0.1, 0);
        }
    }
    
    getStats() {
        return {
            requestsLastMinute: this.requestTimes.filter(time => Date.now() - time < 60000).length,
            requestsLastHour: this.requestTimes.filter(time => Date.now() - time < 3600000).length,
            requestsLastDay: this.requestTimes.filter(time => Date.now() - time < 86400000).length,
            failureCount: this.failureCount,
            adaptiveDelay: this.adaptiveDelay,
        };
    }
}

export const smartScheduler = new SmartScheduler();