import { CheerioCrawlerOptions, log } from 'crawlee';
import { Page } from 'puppeteer';

/**
 * Enhanced anti-bot detection evasion with 2024/2025 techniques
 */

// Latest user agents (updated for 2025)
const USER_AGENTS_2025 = [
    // Chrome 120+ on Windows 11
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    
    // Chrome on macOS Sonoma
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_2_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    
    // Safari 17 on macOS
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_2_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
    
    // Firefox 121+ on Windows
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
    
    // Edge on Windows 11
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
];

// Enhanced TLS fingerprinting evasion
export const getTLSFingerprint = () => {
    return {
        ja3: generateJA3(),
        h2Settings: {
            HEADER_TABLE_SIZE: 65536,
            ENABLE_PUSH: 0,
            MAX_CONCURRENT_STREAMS: 1000,
            INITIAL_WINDOW_SIZE: 6291456,
            MAX_HEADER_LIST_SIZE: 262144,
        },
        supportedSignatureAlgorithms: [
            'ecdsa_secp256r1_sha256',
            'rsa_pss_rsae_sha256',
            'rsa_pkcs1_sha256',
            'ecdsa_secp384r1_sha384',
            'rsa_pss_rsae_sha384',
            'rsa_pkcs1_sha384',
            'rsa_pss_rsae_sha512',
            'rsa_pkcs1_sha512',
        ],
        supportedVersions: ['h2', 'http/1.1'],
    };
};

// Generate realistic JA3 fingerprint
const generateJA3 = () => {
    const cipherSuites = [
        0x1301, 0x1302, 0x1303, // TLS 1.3
        0xc02b, 0xc02f, 0xc02c, 0xc030, // TLS 1.2
        0xcca9, 0xcca8, 0xc013, 0xc014,
    ];
    
    const extensions = [
        0x0000, // server_name
        0x0017, // extended_master_secret
        0x0023, // session_ticket
        0x0005, // status_request
        0x0012, // signed_certificate_timestamp
        0x0033, // key_share
        0x002b, // supported_versions
        0x002d, // psk_key_exchange_modes
        0x001b, // compress_certificate
    ];
    
    return {
        version: 771, // TLS 1.2
        cipherSuites: cipherSuites.join('-'),
        extensions: extensions.join('-'),
        ellipticCurves: '29-23-24',
        ellipticCurveFormats: '0',
    };
};

// WebRTC leak prevention
export const blockWebRTC = async (page: Page) => {
    await page.evaluateOnNewDocument(() => {
        // Override WebRTC
        const rtc = window.RTCPeerConnection || window.webkitRTCPeerConnection;
        if (rtc) {
            const noop = () => {};
            const rtcProto = rtc.prototype;
            
            rtcProto.createDataChannel = noop;
            rtcProto.createOffer = () => Promise.reject(new Error('WebRTC blocked'));
            rtcProto.createAnswer = () => Promise.reject(new Error('WebRTC blocked'));
            rtcProto.setLocalDescription = noop;
            rtcProto.setRemoteDescription = noop;
        }
        
        // Also block getUserMedia
        if (navigator.mediaDevices) {
            navigator.mediaDevices.getUserMedia = () => Promise.reject(new Error('Media blocked'));
        }
    });
};

// Enhanced canvas fingerprinting protection
export const protectCanvasFingerprint = async (page: Page) => {
    await page.evaluateOnNewDocument(() => {
        // Canvas noise injection
        const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
        const originalToBlob = HTMLCanvasElement.prototype.toBlob;
        const originalGetImageData = CanvasRenderingContext2D.prototype.getImageData;
        
        const injectNoise = (canvas: HTMLCanvasElement) => {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                for (let i = 0; i < imageData.data.length; i += 4) {
                    // Add subtle noise to each pixel
                    const noise = Math.random() * 0.1 - 0.05;
                    imageData.data[i] += noise;
                    imageData.data[i + 1] += noise;
                    imageData.data[i + 2] += noise;
                }
                ctx.putImageData(imageData, 0, 0);
            }
        };
        
        HTMLCanvasElement.prototype.toDataURL = function(...args) {
            injectNoise(this);
            return originalToDataURL.apply(this, args);
        };
        
        HTMLCanvasElement.prototype.toBlob = function(...args) {
            injectNoise(this);
            return originalToBlob.apply(this, args);
        };
        
        CanvasRenderingContext2D.prototype.getImageData = function(...args) {
            const imageData = originalGetImageData.apply(this, args);
            // Add noise to image data
            for (let i = 0; i < imageData.data.length; i += 4) {
                const noise = Math.random() * 0.1 - 0.05;
                imageData.data[i] = Math.max(0, Math.min(255, imageData.data[i] + noise));
            }
            return imageData;
        };
    });
};

// Advanced bot detection evasion
export const evadeBotDetection = async (page: Page) => {
    // Override navigator properties
    await page.evaluateOnNewDocument(() => {
        // Properly override navigator.webdriver
        Object.defineProperty(navigator, 'webdriver', {
            get: () => undefined,
            configurable: true,
        });
        
        // Override navigator.plugins
        Object.defineProperty(navigator, 'plugins', {
            get: () => {
                return [
                    {
                        name: 'Chrome PDF Plugin',
                        description: 'Portable Document Format',
                        filename: 'internal-pdf-viewer',
                        length: 1,
                    },
                    {
                        name: 'Chrome PDF Viewer',
                        description: '',
                        filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai',
                        length: 1,
                    },
                    {
                        name: 'Native Client',
                        description: '',
                        filename: 'internal-nacl-plugin',
                        length: 2,
                    },
                ];
            },
        });
        
        // Override permissions
        const originalQuery = window.navigator.permissions.query;
        window.navigator.permissions.query = (parameters: any) => {
            if (parameters.name === 'notifications') {
                return Promise.resolve({ state: 'prompt' });
            }
            return originalQuery(parameters);
        };
        
        // Override chrome runtime
        if (!window.chrome) {
            (window as any).chrome = {};
        }
        if (!window.chrome.runtime) {
            window.chrome.runtime = {
                connect: () => {},
                sendMessage: () => {},
                onMessage: { addListener: () => {} },
            } as any;
        }
    });
};

// Mouse movement simulation
export const simulateMouseMovement = async (page: Page) => {
    const movements = [
        { x: 100, y: 100 },
        { x: 200, y: 150 },
        { x: 300, y: 200 },
        { x: 250, y: 250 },
        { x: 150, y: 300 },
    ];
    
    for (const pos of movements) {
        await page.mouse.move(pos.x, pos.y, { steps: 10 });
        await page.waitForTimeout(100 + Math.random() * 200);
    }
};

// Advanced timing attack prevention
export const preventTimingAttacks = async (page: Page) => {
    await page.evaluateOnNewDocument(() => {
        // Add jitter to performance.now()
        const originalNow = performance.now;
        performance.now = function() {
            return originalNow.call(performance) + (Math.random() * 0.001);
        };
        
        // Add jitter to Date
        const originalDate = Date;
        (window as any).Date = new Proxy(Date, {
            construct(target, args) {
                const instance = new target(...args);
                if (args.length === 0) {
                    instance.setMilliseconds(instance.getMilliseconds() + Math.floor(Math.random() * 10));
                }
                return instance;
            },
            get(target, prop) {
                if (prop === 'now') {
                    return () => originalDate.now() + Math.floor(Math.random() * 10);
                }
                return target[prop as keyof typeof Date];
            },
        });
    });
};

// Enhanced request interception
export const interceptRequests = async (page: Page) => {
    await page.setRequestInterception(true);
    
    page.on('request', (request) => {
        const headers = request.headers();
        
        // Remove automation headers
        delete headers['sec-ch-ua-platform'];
        delete headers['sec-ch-ua-mobile'];
        
        // Add realistic headers
        headers['sec-fetch-site'] = 'same-origin';
        headers['sec-fetch-mode'] = 'navigate';
        headers['sec-fetch-user'] = '?1';
        headers['sec-fetch-dest'] = 'document';
        
        request.continue({ headers });
    });
};

// CDP (Chrome DevTools Protocol) detection evasion
export const evadeCDPDetection = async (page: Page) => {
    // Override CDP detection
    await page.evaluateOnNewDocument(() => {
        // Remove CDP specific properties
        const cdpProperties = [
            '__puppeteer_evaluation_script__',
            '__selenium_evaluate',
            '__webdriver_evaluate',
            '__selenium_unwrapped',
            '__webdriver_unwrapped',
            '__webdriver_script_function',
            '__webdriver_script_func',
            '__webdriver_script_fn',
            '__fxdriver_evaluate',
            '__driver_unwrapped',
            '__webdriver_unwrapped',
            '__driver_evaluate',
            '__selenium_evaluate',
            '__fxdriver_unwrapped',
        ];
        
        for (const prop of cdpProperties) {
            delete (window as any)[prop];
            delete (document as any)[prop];
        }
    });
};

// Generate realistic browser behavior
export const generateBrowserBehavior = () => {
    return {
        // Realistic viewport sizes (2024 statistics)
        viewport: [
            { width: 1920, height: 1080 }, // Full HD (most common)
            { width: 2560, height: 1440 }, // 2K
            { width: 1366, height: 768 },  // Laptop
            { width: 1536, height: 864 },  // Laptop
            { width: 1440, height: 900 },  // Laptop
        ][Math.floor(Math.random() * 5)],
        
        // Realistic timezone offsets
        timezoneOffset: [-480, -420, -360, -300, -240, -180, -120, -60, 0, 60, 120][Math.floor(Math.random() * 11)],
        
        // Language preferences
        languages: [
            ['en-US', 'en'],
            ['en-GB', 'en'],
            ['de-DE', 'de', 'en'],
            ['fr-FR', 'fr', 'en'],
            ['es-ES', 'es', 'en'],
        ][Math.floor(Math.random() * 5)],
        
        // Platform
        platform: ['Win32', 'MacIntel', 'Linux x86_64'][Math.floor(Math.random() * 3)],
        
        // Hardware concurrency (CPU cores)
        hardwareConcurrency: [4, 8, 12, 16][Math.floor(Math.random() * 4)],
        
        // Device memory (GB)
        deviceMemory: [4, 8, 16, 32][Math.floor(Math.random() * 4)],
    };
};

// Main anti-bot configuration
export const setupAntiBot = async (page: Page) => {
    const behavior = generateBrowserBehavior();
    
    // Set viewport
    await page.setViewport(behavior.viewport);
    
    // Set user agent
    await page.setUserAgent(USER_AGENTS_2025[Math.floor(Math.random() * USER_AGENTS_2025.length)]);
    
    // Apply all evasion techniques
    await blockWebRTC(page);
    await protectCanvasFingerprint(page);
    await evadeBotDetection(page);
    await preventTimingAttacks(page);
    await evadeCDPDetection(page);
    
    // Set additional browser properties
    await page.evaluateOnNewDocument((behavior) => {
        Object.defineProperty(navigator, 'platform', {
            get: () => behavior.platform,
        });
        
        Object.defineProperty(navigator, 'hardwareConcurrency', {
            get: () => behavior.hardwareConcurrency,
        });
        
        Object.defineProperty(navigator, 'deviceMemory', {
            get: () => behavior.deviceMemory,
        });
        
        Object.defineProperty(navigator, 'languages', {
            get: () => behavior.languages,
        });
    }, behavior);
    
    // Setup request interception
    await interceptRequests(page);
    
    log.debug('Anti-bot measures applied successfully');
};