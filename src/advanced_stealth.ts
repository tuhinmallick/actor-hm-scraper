import { log } from 'crawlee';

/**
 * Advanced Anti-Bot Detection Evasion System
 * Implements cutting-edge techniques following industry best practices
 */

// Advanced browser fingerprinting data
interface BrowserFingerprint {
    userAgent: string;
    viewport: { width: number; height: number };
    screen: { width: number; height: number };
    timezone: string;
    language: string;
    platform: string;
    hardwareConcurrency: number;
    deviceMemory?: number;
    webglVendor: string;
    webglRenderer: string;
    canvasFingerprint: string;
    audioFingerprint: string;
    fonts: string[];
    plugins: string[];
    webRTC: boolean;
    battery?: { level: number; charging: boolean };
}

// Realistic browser profiles with complete fingerprints
const BROWSER_PROFILES: BrowserFingerprint[] = [
    {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        viewport: { width: 1920, height: 1080 },
        screen: { width: 1920, height: 1080 },
        timezone: 'Europe/London',
        language: 'en-GB',
        platform: 'Win32',
        hardwareConcurrency: 8,
        deviceMemory: 8,
        webglVendor: 'Google Inc. (Intel)',
        webglRenderer: 'ANGLE (Intel, Intel(R) UHD Graphics 630 Direct3D11 vs_5_0 ps_5_0, D3D11)',
        canvasFingerprint: 'canvas_fingerprint_chrome_windows',
        audioFingerprint: 'audio_fingerprint_chrome_windows',
        fonts: ['Arial', 'Calibri', 'Cambria', 'Comic Sans MS', 'Consolas', 'Courier New', 'Georgia', 'Impact', 'Lucida Console', 'Lucida Sans Unicode', 'Microsoft Sans Serif', 'Palatino Linotype', 'Segoe UI', 'Tahoma', 'Times New Roman', 'Trebuchet MS', 'Verdana'],
        plugins: ['Chrome PDF Plugin', 'Chrome PDF Viewer', 'Native Client'],
        webRTC: true,
        battery: { level: 0.85, charging: false }
    },
    {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        viewport: { width: 1440, height: 900 },
        screen: { width: 1440, height: 900 },
        timezone: 'America/New_York',
        language: 'en-US',
        platform: 'MacIntel',
        hardwareConcurrency: 8,
        deviceMemory: 16,
        webglVendor: 'Google Inc. (Apple)',
        webglRenderer: 'ANGLE (Apple, Apple M1 Pro, OpenGL 4.1)',
        canvasFingerprint: 'canvas_fingerprint_chrome_mac',
        audioFingerprint: 'audio_fingerprint_chrome_mac',
        fonts: ['Arial', 'Arial Black', 'Arial Narrow', 'Arial Rounded MT Bold', 'Arial Unicode MS', 'Baskerville', 'Big Caslon', 'Brush Script MT', 'Chalkboard', 'Chalkboard SE', 'Chalkduster', 'Charcoal CY', 'Cochin', 'Comic Sans MS', 'Copperplate', 'Courier', 'Courier New', 'Didot', 'Futura', 'Geneva', 'Georgia', 'Gill Sans', 'Gill Sans MT', 'Helvetica', 'Helvetica Neue', 'Herculanum', 'Hoefler Text', 'Impact', 'Lucida Grande', 'Marker Felt', 'Menlo', 'Monaco', 'Optima', 'Palatino', 'Papyrus', 'Phosphate', 'Skia', 'Tahoma', 'Times', 'Times New Roman', 'Trebuchet MS', 'Verdana', 'Zapfino'],
        plugins: ['Chrome PDF Plugin', 'Chrome PDF Viewer', 'Native Client'],
        webRTC: true,
        battery: { level: 0.92, charging: true }
    },
    {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0',
        viewport: { width: 1366, height: 768 },
        screen: { width: 1366, height: 768 },
        timezone: 'Europe/Berlin',
        language: 'de-DE',
        platform: 'Win32',
        hardwareConcurrency: 4,
        webglVendor: 'Mozilla',
        webglRenderer: 'ANGLE (Intel, Intel(R) HD Graphics 620 Direct3D11 vs_5_0 ps_5_0, D3D11)',
        canvasFingerprint: 'canvas_fingerprint_firefox_windows',
        audioFingerprint: 'audio_fingerprint_firefox_windows',
        fonts: ['Arial', 'Calibri', 'Cambria', 'Comic Sans MS', 'Consolas', 'Courier New', 'Georgia', 'Impact', 'Lucida Console', 'Lucida Sans Unicode', 'Microsoft Sans Serif', 'Palatino Linotype', 'Segoe UI', 'Tahoma', 'Times New Roman', 'Trebuchet MS', 'Verdana'],
        plugins: ['PDF.js', 'OpenH264 Video Codec'],
        webRTC: true,
        battery: { level: 0.78, charging: false }
    },
    {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Safari/605.1.15',
        viewport: { width: 1536, height: 864 },
        screen: { width: 1536, height: 864 },
        timezone: 'America/Los_Angeles',
        language: 'en-US',
        platform: 'MacIntel',
        hardwareConcurrency: 8,
        deviceMemory: 16,
        webglVendor: 'Apple Inc.',
        webglRenderer: 'Apple M1 Pro',
        canvasFingerprint: 'canvas_fingerprint_safari_mac',
        audioFingerprint: 'audio_fingerprint_safari_mac',
        fonts: ['Arial', 'Arial Black', 'Arial Narrow', 'Arial Rounded MT Bold', 'Arial Unicode MS', 'Baskerville', 'Big Caslon', 'Brush Script MT', 'Chalkboard', 'Chalkboard SE', 'Chalkduster', 'Charcoal CY', 'Cochin', 'Comic Sans MS', 'Copperplate', 'Courier', 'Courier New', 'Didot', 'Futura', 'Geneva', 'Georgia', 'Gill Sans', 'Gill Sans MT', 'Helvetica', 'Helvetica Neue', 'Herculanum', 'Hoefler Text', 'Impact', 'Lucida Grande', 'Marker Felt', 'Menlo', 'Monaco', 'Optima', 'Palatino', 'Papyrus', 'Phosphate', 'Skia', 'Tahoma', 'Times', 'Times New Roman', 'Trebuchet MS', 'Verdana', 'Zapfino'],
        plugins: ['WebKit built-in PDF', 'WebKit PDF Viewer'],
        webRTC: true,
        battery: { level: 0.95, charging: true }
    }
];

// Advanced session management with behavioral patterns
class AdvancedSessionManager {
    private sessions: Map<string, AdvancedSession> = new Map();
    private currentSessionId: string = '';
    private sessionRotationCount = 0;
    private readonly maxSessionDuration = 1800000; // 30 minutes
    private readonly maxRequestsPerSession = 100;
    
    createSession(): string {
        const sessionId = this.generateSecureSessionId();
        const profile = this.selectOptimalProfile();
        
        this.sessions.set(sessionId, {
            id: sessionId,
            profile,
            createdAt: Date.now(),
            lastUsed: Date.now(),
            requestCount: 0,
            failureCount: 0,
            successCount: 0,
            behavioralPattern: this.generateBehavioralPattern(),
            cookies: new Map(),
            localStorage: new Map(),
            sessionStorage: new Map(),
            isHealthy: true,
            lastFailure: 0,
            blockedDomains: new Set(),
            requestHistory: [],
            mouseMovements: [],
            scrollEvents: [],
            keystrokes: [],
            focusEvents: [],
            timingPatterns: {
                averageDelay: 3000,
                delayVariance: 1000,
                burstPattern: 'normal',
                timeOfDay: new Date().getHours()
            }
        });
        
        this.currentSessionId = sessionId;
        this.sessionRotationCount++;
        
        log.info(`Created advanced session ${sessionId} with profile: ${profile.userAgent.split(' ')[0]}`);
        return sessionId;
    }
    
    private generateSecureSessionId(): string {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2);
        return `session_${timestamp}_${random}`;
    }
    
    private selectOptimalProfile(): BrowserFingerprint {
        // Weighted selection based on current time and success rates
        const hour = new Date().getHours();
        const profiles = BROWSER_PROFILES.filter(profile => {
            // Prefer profiles that match current timezone patterns
            const profileHour = this.getProfileOptimalHour(profile);
            return Math.abs(hour - profileHour) <= 2;
        });
        
        if (profiles.length === 0) {
            return BROWSER_PROFILES[Math.floor(Math.random() * BROWSER_PROFILES.length)];
        }
        
        return profiles[Math.floor(Math.random() * profiles.length)];
    }
    
    private getProfileOptimalHour(profile: BrowserFingerprint): number {
        // Simulate optimal usage hours based on timezone
        const timezone = profile.timezone;
        if (timezone.includes('Europe')) return 14; // Afternoon in Europe
        if (timezone.includes('America/New_York')) return 10; // Morning in EST
        if (timezone.includes('America/Los_Angeles')) return 9; // Morning in PST
        return 12; // Default to noon
    }
    
    private generateBehavioralPattern(): BehavioralPattern {
        return {
            mouseSpeed: 0.5 + Math.random() * 0.5, // 0.5-1.0
            scrollSpeed: 0.3 + Math.random() * 0.4, // 0.3-0.7
            clickDelay: 100 + Math.random() * 200, // 100-300ms
            typingSpeed: 50 + Math.random() * 100, // 50-150ms per character
            pauseFrequency: 0.1 + Math.random() * 0.2, // 10-30% chance
            readingTime: 2000 + Math.random() * 3000, // 2-5 seconds
            navigationStyle: Math.random() > 0.5 ? 'direct' : 'exploratory',
            attentionSpan: 5000 + Math.random() * 10000, // 5-15 seconds
            multitasking: Math.random() > 0.7, // 30% chance
            deviceType: Math.random() > 0.8 ? 'mobile' : 'desktop'
        };
    }
    
    getCurrentSession(): AdvancedSession | null {
        return this.sessions.get(this.currentSessionId) || null;
    }
    
    shouldRotateSession(): boolean {
        const session = this.getCurrentSession();
        if (!session) return true;
        
        const now = Date.now();
        const sessionAge = now - session.createdAt;
        const timeSinceLastUse = now - session.lastUsed;
        
        // Rotate based on multiple factors
        return (
            sessionAge > this.maxSessionDuration ||
            session.requestCount > this.maxRequestsPerSession ||
            session.failureCount > 5 ||
            timeSinceLastUse > 300000 || // 5 minutes
            this.sessionRotationCount % 20 === 0 // Periodic rotation
        );
    }
    
    rotateSession(): string {
        log.info(`Rotating session (rotation #${this.sessionRotationCount + 1})`);
        return this.createSession();
    }
    
    recordRequest(url: string, success: boolean): void {
        const session = this.getCurrentSession();
        if (!session) return;
        
        session.requestCount++;
        session.lastUsed = Date.now();
        
        if (success) {
            session.successCount++;
        } else {
            session.failureCount++;
            session.lastFailure = Date.now();
        }
        
        // Update behavioral patterns based on success/failure
        this.updateBehavioralPattern(session, success);
        
        // Record request history
        session.requestHistory.push({
            url,
            timestamp: Date.now(),
            success,
            responseTime: Math.random() * 1000 + 200 // Simulated response time
        });
        
        // Keep only last 50 requests
        if (session.requestHistory.length > 50) {
            session.requestHistory.shift();
        }
    }
    
    private updateBehavioralPattern(session: AdvancedSession, success: boolean): void {
        if (success) {
            // Gradually increase confidence
            session.timingPatterns.averageDelay = Math.max(
                session.timingPatterns.averageDelay * 0.95,
                2000
            );
        } else {
            // Increase caution after failures
            session.timingPatterns.averageDelay = Math.min(
                session.timingPatterns.averageDelay * 1.2,
                10000
            );
        }
    }
    
    getStats() {
        const sessions = Array.from(this.sessions.values());
        return {
            totalSessions: sessions.length,
            currentSession: this.currentSessionId,
            rotationCount: this.sessionRotationCount,
            averageSuccessRate: sessions.reduce((sum, s) => sum + (s.successCount / (s.successCount + s.failureCount + 1)), 0) / sessions.length,
            healthySessions: sessions.filter(s => s.isHealthy).length,
            sessionDetails: sessions.map(s => ({
                id: s.id,
                profile: s.profile.userAgent.split(' ')[0],
                requestCount: s.requestCount,
                successRate: s.successCount / (s.successCount + s.failureCount + 1),
                isHealthy: s.isHealthy,
                age: Date.now() - s.createdAt
            }))
        };
    }
}

interface AdvancedSession {
    id: string;
    profile: BrowserFingerprint;
    createdAt: number;
    lastUsed: number;
    requestCount: number;
    failureCount: number;
    successCount: number;
    behavioralPattern: BehavioralPattern;
    cookies: Map<string, string>;
    localStorage: Map<string, string>;
    sessionStorage: Map<string, string>;
    isHealthy: boolean;
    lastFailure: number;
    blockedDomains: Set<string>;
    requestHistory: RequestRecord[];
    mouseMovements: MouseEvent[];
    scrollEvents: ScrollEvent[];
    keystrokes: KeystrokeEvent[];
    focusEvents: FocusEvent[];
    timingPatterns: TimingPatterns;
}

interface BehavioralPattern {
    mouseSpeed: number;
    scrollSpeed: number;
    clickDelay: number;
    typingSpeed: number;
    pauseFrequency: number;
    readingTime: number;
    navigationStyle: 'direct' | 'exploratory';
    attentionSpan: number;
    multitasking: boolean;
    deviceType: 'mobile' | 'desktop';
}

interface RequestRecord {
    url: string;
    timestamp: number;
    success: boolean;
    responseTime: number;
}

interface MouseEvent {
    x: number;
    y: number;
    timestamp: number;
    type: 'move' | 'click' | 'hover';
}

interface ScrollEvent {
    x: number;
    y: number;
    timestamp: number;
    direction: 'up' | 'down' | 'left' | 'right';
}

interface KeystrokeEvent {
    key: string;
    timestamp: number;
    duration: number;
}

interface FocusEvent {
    element: string;
    timestamp: number;
    duration: number;
}

interface TimingPatterns {
    averageDelay: number;
    delayVariance: number;
    burstPattern: 'normal' | 'burst' | 'slow';
    timeOfDay: number;
}

// Global advanced session manager
export const advancedSessionManager = new AdvancedSessionManager();

/**
 * Generate realistic browser headers based on complete fingerprint
 */
export const generateAdvancedHeaders = (sessionId?: string): Record<string, string> => {
    const session = sessionId ? advancedSessionManager.getCurrentSession() : null;
    const profile = session?.profile || BROWSER_PROFILES[0];
    
    const headers: Record<string, string> = {
        'User-Agent': profile.userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': `${profile.language},${profile.language.split('-')[0]};q=0.9,en;q=0.8`,
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Cache-Control': 'max-age=0',
        'Viewport-Width': profile.viewport.width.toString(),
        'Device-Memory': profile.deviceMemory?.toString() || '8',
        'Hardware-Concurrency': profile.hardwareConcurrency.toString(),
        'Timezone': profile.timezone,
        'Platform': profile.platform,
    };
    
    // Browser-specific headers
    if (profile.userAgent.includes('Chrome')) {
        headers['sec-ch-ua'] = '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"';
        headers['sec-ch-ua-mobile'] = '?0';
        headers['sec-ch-ua-platform'] = `"${profile.platform}"`;
        headers['sec-ch-ua-platform-version'] = '"15.0.0"';
        headers['sec-ch-ua-arch'] = '"x86"';
        headers['sec-ch-ua-bitness'] = '"64"';
        headers['sec-ch-ua-model'] = '""';
        headers['sec-ch-ua-wow64'] = '?0';
    }
    
    if (profile.userAgent.includes('Firefox')) {
        headers['Sec-Fetch-Dest'] = 'document';
        headers['Sec-Fetch-Mode'] = 'navigate';
        headers['Sec-Fetch-Site'] = 'none';
        headers['Sec-Fetch-User'] = '?1';
    }
    
    if (profile.userAgent.includes('Safari') && !profile.userAgent.includes('Chrome')) {
        headers['Accept'] = 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8';
        headers['Accept-Language'] = profile.language;
    }
    
    // Add realistic referrer
    const referrers = [
        'https://www.google.com/',
        'https://www.google.com/search?q=fashion',
        'https://www.bing.com/',
        'https://duckduckgo.com/',
        'https://www.hm.com/',
        'https://www.hm.com/de_de/',
    ];
    headers['Referer'] = referrers[Math.floor(Math.random() * referrers.length)];
    
    return headers;
};

/**
 * Generate intelligent delays based on behavioral patterns
 */
export const generateIntelligentDelay = (sessionId?: string, requestType?: string): number => {
    const session = sessionId ? advancedSessionManager.getCurrentSession() : null;
    const pattern = session?.behavioralPattern;
    
    if (!pattern) {
        return 2000 + Math.random() * 3000; // Default 2-5 seconds
    }
    
    let baseDelay = pattern.readingTime;
    
    // Adjust based on request type
    switch (requestType) {
        case 'navigation':
            baseDelay *= 0.5; // Faster for navigation
            break;
        case 'product':
            baseDelay *= 1.5; // Slower for product pages
            break;
        case 'api':
            baseDelay *= 0.3; // Much faster for API calls
            break;
        default:
            baseDelay *= 1.0; // Normal speed
    }
    
    // Add behavioral variance
    const variance = baseDelay * 0.3; // 30% variance
    const delay = baseDelay + (Math.random() - 0.5) * variance;
    
    // Add pause probability
    if (Math.random() < pattern.pauseFrequency) {
        return delay + pattern.readingTime * 0.5; // Extra pause
    }
    
    return Math.max(delay, 1000); // Minimum 1 second
};

/**
 * Generate realistic query parameters
 */
export const generateRealisticParams = (sessionId?: string): Record<string, string> => {
    const session = sessionId ? advancedSessionManager.getCurrentSession() : null;
    const profile = session?.profile || BROWSER_PROFILES[0];
    
    const params: Record<string, string> = {
        '_t': Date.now().toString(),
        '_r': Math.random().toString(36).substring(7),
        '_v': '1.0',
        '_c': profile.userAgent.includes('Chrome') ? 'chrome' : 
              profile.userAgent.includes('Firefox') ? 'firefox' : 'safari',
        '_p': profile.platform.toLowerCase(),
        '_l': profile.language,
        '_tz': profile.timezone,
    };
    
    // Add session-specific parameters
    if (session) {
        params['_s'] = session.id.substring(0, 8);
        params['_rc'] = session.requestCount.toString();
    }
    
    return params;
};

export { BrowserFingerprint, AdvancedSession, BehavioralPattern };