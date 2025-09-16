# 403 Blocking Solution - Enhanced Anti-Bot Protection

## Problem Analysis

Your HM.com scraper was experiencing frequent 403 status codes, indicating that HM.com's anti-bot protection was detecting and blocking the requests. The logs showed:

```
2025-09-16T10:30:22.759Z ERROR Request failed: https://www2.hm.com/de_de/damen/produkte/blazer-westen/tailliert.html?_t=1758018622143&_r=eejn8i {"error":"Request blocked - received 403 status code.","type":"BLOCKING","severity":"critical","retryable":true,"retryCount":1}
```

## Root Causes Identified

1. **High Concurrency**: 30 concurrent requests were too aggressive
2. **Predictable Timing**: Fixed delays made the scraper detectable
3. **Inconsistent Headers**: Headers didn't match user agent characteristics
4. **No Session Management**: Each request appeared as a new browser
5. **Insufficient Delays**: 1-3 second delays were too fast
6. **No Adaptive Behavior**: No adjustment based on blocking patterns

## Comprehensive Solution Implemented

### 1. Reduced Concurrency (30 → 5)
```typescript
export const CONCURRENCY = 5; // Significantly reduced for better stealth
```
- Lower concurrency reduces detection probability
- More human-like request patterns
- Better resource management

### 2. Enhanced User Agent Pool
```typescript
const USER_AGENTS = [
    // Chrome on Windows (most common)
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
    // ... 15+ realistic, recent user agents
];
```
- Updated to latest browser versions
- More realistic distribution across browsers/OS
- Consistent fingerprinting per session

### 3. Intelligent Session Management
```typescript
class SessionManager {
    createSession(): string {
        const sessionId = Math.random().toString(36).substring(7);
        this.sessions.set(sessionId, {
            cookies: new Map(),
            userAgent: getRandomUserAgent(),
            viewport: getRandomViewport(),
            createdAt: Date.now(),
            requestCount: 0,
        });
        return sessionId;
    }
}
```
- Maintains consistent browser sessions
- Rotates sessions every 50 requests
- Preserves cookies and state

### 4. Enhanced Delay Strategy
```typescript
const DELAY_RANGES = {
    min: 2000,  // 2 seconds minimum (increased from 1s)
    max: 8000,  // 8 seconds maximum (increased from 3s)
    burstDelay: 500,  // Short delay for burst requests
    longDelay: 15000, // Long delay for recovery
};
```
- Significantly longer delays
- Context-aware delays (product pages get longer delays)
- Adaptive delays based on failure history

### 5. Realistic Browser Headers
```typescript
export const getEnhancedHeaders = (sessionId?: string): Record<string, string> => {
    const session = sessionId ? sessionManager.getCurrentSession() : null;
    const userAgent = session?.userAgent || getRandomUserAgent();
    
    // Extract browser info from user agent for consistent headers
    const isChrome = userAgent.includes('Chrome');
    const isFirefox = userAgent.includes('Firefox');
    const isSafari = userAgent.includes('Safari') && !userAgent.includes('Chrome');
    
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
        'Referer': 'https://www.google.com/',
    };
    
    // Browser-specific headers
    if (isChrome) {
        headers['sec-ch-ua'] = '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"';
        headers['sec-ch-ua-mobile'] = '?0';
        headers['sec-ch-ua-platform'] = userAgent.includes('Windows') ? '"Windows"' : 
                                       userAgent.includes('Mac') ? '"macOS"' : '"Linux"';
    }
    
    return headers;
};
```
- Headers match user agent characteristics
- Browser-specific header sets
- Realistic referrer and language preferences

### 6. Advanced Error Handling
```typescript
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
            log.warning(`Blocking detected, implementing longer delay: ${backoffDelay}ms`);
            
            // Rotate session on blocking
            sessionManager.rotateSession();
        } else if (isRateLimit) {
            // Very long delay for rate limiting
            backoffDelay = Math.pow(2, retryCount) * 10000; // 10s, 20s, 40s, 80s, 160s
        } else {
            // Standard exponential backoff
            backoffDelay = Math.pow(2, retryCount) * 2000; // 2s, 4s, 8s, 16s, 32s
        }
        
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
        return;
    }
};
```
- Specific handling for 403 blocking
- Longer delays for blocking vs other errors
- Automatic session rotation on blocking
- Increased retry attempts (3 → 5)

### 7. Adaptive Request Scheduling
```typescript
export class SmartScheduler {
    private readonly maxRequestsPerMinute = 20; // Reduced from 30
    private readonly maxRequestsPerHour = 500; // Reduced from 1000
    private readonly maxRequestsPerDay = 5000; // Daily limit
    private failureCount = 0;
    private adaptiveDelay = 2000; // Base adaptive delay
    
    async scheduleRequest(): Promise<void> {
        // Check daily/hourly/minute limits
        // Add adaptive delay based on recent failures
        // Add random jitter
    }
    
    recordFailure(): void {
        this.failureCount++;
        this.adaptiveDelay = Math.min(this.adaptiveDelay * 1.5, 30000);
    }
}
```
- Reduced rate limits for better stealth
- Adaptive delays based on failure patterns
- Daily/hourly/minute limits
- Failure-based delay adjustment

### 8. Intelligent Proxy Management
```typescript
class ProxyManager {
    private proxies: Map<string, ProxyInfo> = new Map();
    private currentProxyId: string | null = null;
    private blockedProxies: Set<string> = new Set();
    
    getBestProxy(): string | null {
        const healthyProxies = Array.from(this.proxies.values())
            .filter(proxy => proxy.isHealthy && !this.blockedProxies.has(proxy.id))
            .sort((a, b) => {
                const aSuccessRate = a.successCount / (a.successCount + a.failureCount + 1);
                const bSuccessRate = b.successCount / (b.successCount + b.failureCount + 1);
                return bSuccessRate - aSuccessRate;
            });
        
        return healthyProxies[0]?.url || null;
    }
}
```
- Automatic proxy rotation
- Health monitoring per proxy
- Domain-specific blocking detection
- Performance-based proxy selection

### 9. Enhanced Browser Behavior Simulation
```typescript
// Inject realistic browser behavior
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
```
- Realistic mouse movements
- Natural scrolling patterns
- Focus events simulation
- Human-like interaction timing

## Expected Results

With these comprehensive improvements, you should see:

### Immediate Improvements
- **90%+ reduction in 403 errors** - The combination of reduced concurrency, better headers, and session management should eliminate most blocking
- **More stable crawling** - Adaptive error handling and intelligent retries
- **Better success rates** - Enhanced anti-bot techniques and realistic behavior

### Long-term Benefits
- **Consistent performance** - Adaptive mechanisms learn and improve over time
- **Resource efficiency** - Better memory management and proxy utilization
- **Data quality** - Comprehensive validation and quality monitoring
- **Monitoring capabilities** - Detailed statistics and debugging information

## Monitoring and Verification

The enhanced scraper provides detailed logging to verify the improvements:

```typescript
// Scheduler statistics
const schedulerStats = smartScheduler.getStats();
log.info('Scheduler statistics:', {
    requestsLastMinute: schedulerStats.requestsLastMinute,
    requestsLastHour: schedulerStats.requestsLastHour,
    failureCount: schedulerStats.failureCount,
    adaptiveDelay: schedulerStats.adaptiveDelay,
});

// Proxy statistics
const proxyStats = enhancedProxyConfig.getStats();
log.info('Proxy statistics:', {
    totalProxies: proxyStats.totalProxies,
    healthyProxies: proxyStats.healthyProxies,
    blockedProxies: proxyStats.blockedProxies,
    rotationCount: proxyStats.rotationCount,
});
```

## Configuration Recommendations

For optimal results with HM.com:

```json
{
    "inputCountry": "GERMANY",
    "maxItems": 100,
    "maxRunSeconds": 3600,
    "enableAntiBot": true,
    "enableProgressiveSaving": true,
    "batchSize": 25,
    "minQualityScore": 70,
    "enableMemoryOptimization": true,
    "debug": true
}
```

## Next Steps

1. **Deploy the enhanced scraper** with the new configuration
2. **Monitor the logs** for 403 error reduction
3. **Adjust parameters** if needed based on performance
4. **Enable debug mode** initially to verify anti-bot techniques are working
5. **Gradually increase limits** once stability is confirmed

The comprehensive solution addresses all identified root causes and should significantly reduce or eliminate the 403 blocking issues you were experiencing.