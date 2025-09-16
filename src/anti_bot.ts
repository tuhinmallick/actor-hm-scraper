import { CheerioCrawlerOptions, log } from 'crawlee';
import { advancedSessionManager, generateAdvancedHeaders, generateIntelligentDelay, generateRealisticParams } from './advanced_stealth.js';
import { behavioralSimulator } from './behavioral_simulation.js';
import { concurrencyManager } from './concurrency_manager.js';
import { stealthMode } from './stealth_mode.js';
import { javaScriptRenderer } from './javascript_renderer.js';

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
    min: 2000, // 2 seconds minimum (increased for better stealth)
    max: 8000, // 8 seconds maximum (increased for better stealth)
    burstDelay: 500, // Short delay for burst requests
    longDelay: 15000, // Long delay for recovery
};

// Session management for maintaining cookies and state
class SessionManager {
    private sessions: Map<string, any> = new Map();
    private currentSessionId = '';

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
    // const isEdge = userAgent.includes('Edg'); // Unused

    const headers: Record<string, string> = {
        'User-Agent': userAgent,
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'en-US,en;q=0.9,de;q=0.8,fr;q=0.7,es;q=0.6',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        DNT: '1',
        Connection: 'keep-alive',
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
        headers['sec-ch-ua-platform'] = userAgent.includes('Windows') ? '"Windows"'
            : userAgent.includes('Mac') ? '"macOS"' : '"Linux"';
        headers['sec-ch-ua-platform-version'] = userAgent.includes('Windows') ? '"15.0.0"'
            : userAgent.includes('Mac') ? '"15.0.0"' : '"6.0.0"';
    }

    if (isFirefox) {
        headers['Sec-Fetch-Dest'] = 'document';
        headers['Sec-Fetch-Mode'] = 'navigate';
        headers['Sec-Fetch-Site'] = 'none';
        headers['Sec-Fetch-User'] = '?1';
    }

    if (isSafari) {
        headers.Accept = 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8';
        headers['Accept-Language'] = 'en-US,en;q=0.5';
    }

    // Add referrer for more realistic browsing
    headers.Referer = 'https://www.google.com/';

    return headers;
};

/**
 * Configure crawler with comprehensive anti-bot evasion using advanced techniques
 */
export const getAntiBotCrawlerConfig = (baseConfig: Partial<CheerioCrawlerOptions> = {}): Partial<CheerioCrawlerOptions> => {
    // Initialize advanced session manager
    advancedSessionManager.createSession();

    // Get optimal concurrency configuration
    const concurrencyConfig = concurrencyManager.getCrawlerConfig();

    return {
        ...baseConfig,
        ...concurrencyConfig,

        // Request configuration
        requestHandlerTimeoutSecs: 120, // Increased timeout for complex interactions
        maxRequestRetries: 7, // Increased retries with advanced backoff

        // Anti-bot evasion
        additionalMimeTypes: ['text/html', 'application/json', 'application/xml'],
        ignoreSslErrors: false,

        // Advanced request interceptor
        preNavigationHooks: [
            async (crawlingContext) => {
                const { request } = crawlingContext;

                // Check if we should rotate session
                if (advancedSessionManager.shouldRotateSession()) {
                    advancedSessionManager.rotateSession();
                    log.info('Rotated advanced session due to conditions');
                }

                // Get intelligent delay based on behavioral patterns
                const delay = generateIntelligentDelay(
                    advancedSessionManager.getCurrentSession()?.id,
                    getRequestType(request.url),
                );
                log.debug(`Adding intelligent delay of ${delay}ms before request to ${request.url}`);
                await new Promise((resolve) => setTimeout(resolve, delay));

                // Set advanced headers with complete fingerprint
                const session = advancedSessionManager.getCurrentSession();
                request.headers = {
                    ...request.headers,
                    ...generateAdvancedHeaders(session?.id),
                };

                // Add realistic query parameters
                const realisticParams = generateRealisticParams(session?.id);
                const url = new URL(request.url);
                Object.entries(realisticParams).forEach(([key, value]) => {
                    url.searchParams.set(key, value);
                });
                request.url = url.toString();

                // Record request start
                advancedSessionManager.recordRequest(url.toString(), true);
            },
        ],

        // Advanced post-navigation hooks with behavioral simulation
        postNavigationHooks: [
            async (crawlingContext) => {
                const { page, response, request } = crawlingContext;

                const startTime = Date.now();
                let wasBlocked = false;

                // Check for blocking indicators in response
                if ((response as any)?.status === 403 || (response as any)?.status === 429) {
                    log.warning('Blocking detected, implementing advanced countermeasures');
                    wasBlocked = true;
                    await implementAdvancedBlockingCountermeasures(crawlingContext);
                }

                // Inject stealth mode scripts
                if (page) {
                    try {
                        await stealthMode.injectStealthScripts(page);
                    } catch (error: any) {
                        log.debug('Stealth mode injection failed:', error);
                    }
                }

                // Simulate realistic browser behavior
                if (page) {
                    try {
                        await behavioralSimulator.simulatePageInteraction(page, request.url);
                    } catch (error: any) {
                        log.debug('Behavioral simulation failed:', error);
                    }
                }

                // Enhanced JavaScript rendering for dynamic content
                if (page && javaScriptRenderer.getRenderingConfig().enableJavaScriptExecution) {
                    try {
                        await javaScriptRenderer.renderPage(page, request.url);
                    } catch (error: any) {
                        log.debug('JavaScript rendering failed:', error);
                    }
                }

                // Record request outcome for adaptive learning
                const responseTime = Date.now() - startTime;
                const success = !wasBlocked && (response as any)?.status < 400;
                concurrencyManager.recordRequestOutcome(success, responseTime, wasBlocked);
                advancedSessionManager.recordRequest(request.url, success);
            },
        ],

        // Enhanced failed request handling with machine learning
        failedRequestHandler: async (context, error) => {
            const { request } = context;
            const retryCount = request.retryCount || 0;

            // Classify error for appropriate handling
            const errorMessage = error?.message || error?.toString() || '';
            const isBlocking = errorMessage.includes('403') || errorMessage.includes('blocked');
            const isRateLimit = errorMessage.includes('429') || errorMessage.includes('rate limit');
            const isNetworkError = errorMessage.includes('timeout') || errorMessage.includes('ECONNRESET');

            // Record failure for adaptive learning
            concurrencyManager.recordRequestOutcome(false, 0, isBlocking);
            advancedSessionManager.recordRequest(request.url, false);

            if (retryCount < 7) {
                let backoffDelay: number;

                if (isBlocking) {
                    // Advanced blocking handling with exponential backoff
                    backoffDelay = 2 ** retryCount * 8000; // 8s, 16s, 32s, 64s, 128s, 256s, 512s
                    log.warning(`Advanced blocking detected, implementing extended delay: ${backoffDelay}ms (attempt ${retryCount + 1}/7)`);

                    // Rotate session and implement countermeasures
                    advancedSessionManager.rotateSession();
                    await implementAdvancedBlockingCountermeasures(context);
                } else if (isRateLimit) {
                    // Very long delay for rate limiting
                    backoffDelay = 2 ** retryCount * 15000; // 15s, 30s, 60s, 120s, 240s, 480s, 960s
                    log.warning(`Rate limit detected, implementing very long delay: ${backoffDelay}ms (attempt ${retryCount + 1}/7)`);
                } else if (isNetworkError) {
                    // Moderate delay for network errors
                    backoffDelay = 2 ** retryCount * 3000; // 3s, 6s, 12s, 24s, 48s, 96s, 192s
                    log.warning(`Network error detected, implementing moderate delay: ${backoffDelay}ms (attempt ${retryCount + 1}/7)`);
                } else {
                    // Standard exponential backoff
                    backoffDelay = 2 ** retryCount * 2000; // 2s, 4s, 8s, 16s, 32s, 64s, 128s
                    log.warning(`Request failed, retrying in ${backoffDelay}ms (attempt ${retryCount + 1}/7): ${request.url}`);
                }

                // Add jitter to prevent thundering herd
                const jitter = backoffDelay * 0.1 * Math.random();
                await new Promise((resolve) => setTimeout(resolve, backoffDelay + jitter));
                return;
            }

            log.error(`Request failed permanently after ${retryCount} retries: ${request.url}`, error);
        },
    };
};

/**
 * Get request type for intelligent delay calculation
 */
function getRequestType(url: string): string {
    if (url.includes('/produkte/') || url.includes('/products/')) {
        return 'product';
    } if (url.includes('/apis/') || url.includes('/api/')) {
        return 'api';
    } if (url.includes('/navigation/')) {
        return 'navigation';
    } if (url.includes('/kategorien/') || url.includes('/categories/')) {
        return 'category';
    }
    return 'generic';
}

/**
 * Implement advanced blocking countermeasures
 */
const implementAdvancedBlockingCountermeasures = async (_context: any): Promise<void> => {
    log.warning('Implementing advanced blocking countermeasures');

    // Rotate session immediately
    advancedSessionManager.rotateSession();

    // Enter cooldown mode
    concurrencyManager.updateAdaptiveConfig({ enableCooldownMode: true });

    // Add extra delay with behavioral patterns
    const extraDelay = 20000 + Math.random() * 30000; // 20-50 seconds
    log.info(`Adding advanced countermeasure delay of ${extraDelay}ms due to blocking`);
    await new Promise((resolve) => setTimeout(resolve, extraDelay));

    // Log countermeasures taken
    log.info('Advanced blocking countermeasures implemented:', [
        'Advanced session rotated',
        'Behavioral patterns updated',
        'Concurrency reduced',
        'Extended delay added',
        'Fingerprint refreshed',
        'Request patterns modified',
    ]);
};

/**
 * Get intelligent delay based on request context and previous failures
 */
// const getIntelligentDelay = (request: any): number => { // Unused - using generateIntelligentDelay instead
//     const { url } = request;
//     const retryCount = request.retryCount || 0;
//
//     // Base delay
//     let delay = getRandomDelay();
//
//     // Increase delay for retries
//     if (retryCount > 0) {
//         delay *= 1.5 ** retryCount;
//     }
//
//     // Longer delay for product pages (more sensitive)
//     if (url.includes('/produkte/') || url.includes('/products/')) {
//         delay *= 1.5;
//     }
//
//     // Shorter delay for navigation/API calls
//     if (url.includes('/apis/') || url.includes('/navigation/')) {
//         delay *= 0.7;
//     }
//
//     return Math.min(delay, DELAY_RANGES.longDelay);
// };

/**
 * Implement blocking countermeasures
 */
const implementBlockingCountermeasures = async (_context: any): Promise<void> => {
    log.warning('Implementing blocking countermeasures');

    // Rotate session immediately
    sessionManager.rotateSession();

    // Add extra delay
    const extraDelay = DELAY_RANGES.longDelay + Math.random() * 10000;
    log.info(`Adding extra delay of ${extraDelay}ms due to blocking`);
    await new Promise((resolve) => setTimeout(resolve, extraDelay));

    // Log countermeasures taken
    log.info('Blocking countermeasures implemented:', [
        'Session rotated',
        'Extra delay added',
        'Headers refreshed',
        'Request pattern modified',
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
    const isBlocked = blockingIndicators.some((indicator) => pageText.includes(indicator));

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
        this.requestTimes = this.requestTimes.filter((time) => now - time < 3600000);

        // Check daily limit
        const dailyRequests = this.requestTimes.filter((time) => now - time < 86400000).length;
        if (dailyRequests >= this.maxRequestsPerDay) {
            const waitTime = 86400000 - (now - Math.min(...this.requestTimes.filter((time) => now - time < 86400000)));
            log.warning(`Daily request limit reached, waiting ${Math.round(waitTime / 1000)}s`);
            await new Promise((resolve) => setTimeout(resolve, waitTime));
        }

        // Check hourly limit
        const hourlyRequests = this.requestTimes.filter((time) => now - time < 3600000).length;
        if (hourlyRequests >= this.maxRequestsPerHour) {
            const oldestHourlyRequest = Math.min(...this.requestTimes.filter((time) => now - time < 3600000));
            const waitTime = 3600000 - (now - oldestHourlyRequest);

            if (waitTime > 0) {
                log.warning(`Hourly rate limit reached, waiting ${Math.round(waitTime / 1000)}s`);
                await new Promise((resolve) => setTimeout(resolve, waitTime));
            }
        }

        // Check minute limit
        const minuteRequests = this.requestTimes.filter((time) => now - time < 60000).length;
        if (minuteRequests >= this.maxRequestsPerMinute) {
            const oldestMinuteRequest = Math.min(...this.requestTimes.filter((time) => now - time < 60000));
            const waitTime = 60000 - (now - oldestMinuteRequest);

            if (waitTime > 0) {
                log.info(`Minute rate limit reached, waiting ${Math.round(waitTime / 1000)}s`);
                await new Promise((resolve) => setTimeout(resolve, waitTime));
            }
        }

        // Add adaptive delay based on recent failures
        const adaptiveDelay = this.calculateAdaptiveDelay();
        if (adaptiveDelay > 0) {
            log.debug(`Adding adaptive delay of ${adaptiveDelay}ms`);
            await new Promise((resolve) => setTimeout(resolve, adaptiveDelay));
        }

        // Add random jitter (10-30% of base delay)
        const jitter = this.adaptiveDelay * (0.1 + Math.random() * 0.2);
        await new Promise((resolve) => setTimeout(resolve, jitter));

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
            requestsLastMinute: this.requestTimes.filter((time) => Date.now() - time < 60000).length,
            requestsLastHour: this.requestTimes.filter((time) => Date.now() - time < 3600000).length,
            requestsLastDay: this.requestTimes.filter((time) => Date.now() - time < 86400000).length,
            failureCount: this.failureCount,
            adaptiveDelay: this.adaptiveDelay,
        };
    }
}

export const smartScheduler = new SmartScheduler();
