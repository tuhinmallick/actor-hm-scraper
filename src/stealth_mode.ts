import { log } from 'crawlee';

/**
 * Enhanced Stealth Mode Implementation
 * Inspired by AgentQL and Firecrawl's advanced stealth techniques
 */

interface StealthConfiguration {
    enableWebDriverMasking: boolean;
    enableCanvasFingerprintSpoofing: boolean;
    enableWebGLFingerprintSpoofing: boolean;
    enableAudioFingerprintSpoofing: boolean;
    enableFontFingerprintSpoofing: boolean;
    enableScreenResolutionSpoofing: boolean;
    enableTimezoneSpoofing: boolean;
    enableLanguageSpoofing: boolean;
    enablePluginSpoofing: boolean;
    enableWebRTCBlocking: boolean;
    enableAutomationDetection: boolean;
    enableChromeRuntime: boolean;
    enablePermissionsAPI: boolean;
    enableNotificationAPI: boolean;
    enableGeolocationAPI: boolean;
    enableBatteryAPI: boolean;
    enableDeviceMemoryAPI: boolean;
    enableHardwareConcurrencyAPI: boolean;
}

class AdvancedStealthMode {
    private stealthConfig: StealthConfiguration;
    private fingerprintCache: Map<string, any> = new Map();
    
    constructor() {
        this.stealthConfig = this.getDefaultStealthConfig();
    }
    
    private getDefaultStealthConfig(): StealthConfiguration {
        return {
            enableWebDriverMasking: true,
            enableCanvasFingerprintSpoofing: true,
            enableWebGLFingerprintSpoofing: true,
            enableAudioFingerprintSpoofing: true,
            enableFontFingerprintSpoofing: true,
            enableScreenResolutionSpoofing: true,
            enableTimezoneSpoofing: true,
            enableLanguageSpoofing: true,
            enablePluginSpoofing: true,
            enableWebRTCBlocking: true,
            enableAutomationDetection: true,
            enableChromeRuntime: true,
            enablePermissionsAPI: true,
            enableNotificationAPI: true,
            enableGeolocationAPI: true,
            enableBatteryAPI: true,
            enableDeviceMemoryAPI: true,
            enableHardwareConcurrencyAPI: true,
        };
    }
    
    /**
     * Generate comprehensive stealth scripts for browser injection
     */
    generateStealthScripts(): string[] {
        const scripts: string[] = [];
        
        if (this.stealthConfig.enableWebDriverMasking) {
            scripts.push(this.getWebDriverMaskingScript());
        }
        
        if (this.stealthConfig.enableCanvasFingerprintSpoofing) {
            scripts.push(this.getCanvasFingerprintSpoofingScript());
        }
        
        if (this.stealthConfig.enableWebGLFingerprintSpoofing) {
            scripts.push(this.getWebGLFingerprintSpoofingScript());
        }
        
        if (this.stealthConfig.enableAudioFingerprintSpoofing) {
            scripts.push(this.getAudioFingerprintSpoofingScript());
        }
        
        if (this.stealthConfig.enableFontFingerprintSpoofing) {
            scripts.push(this.getFontFingerprintSpoofingScript());
        }
        
        if (this.stealthConfig.enableWebRTCBlocking) {
            scripts.push(this.getWebRTCBlockingScript());
        }
        
        if (this.stealthConfig.enableAutomationDetection) {
            scripts.push(this.getAutomationDetectionScript());
        }
        
        return scripts;
    }
    
    private getWebDriverMaskingScript(): string {
        return `
            // Mask WebDriver properties
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined,
            });
            
            // Remove automation indicators
            delete window.navigator.webdriver;
            delete window.navigator.__webdriver_script_fn;
            delete window.navigator.__webdriver_evaluate;
            delete window.navigator.__webdriver_unwrapped;
            delete window.navigator.__fxdriver_evaluate;
            delete window.navigator.__driver_unwrapped;
            delete window.navigator.__webdriver_script_func;
            delete window.navigator.__webdriver_script_function;
            
            // Mask automation flags
            Object.defineProperty(navigator, 'plugins', {
                get: () => [1, 2, 3, 4, 5],
            });
            
            Object.defineProperty(navigator, 'languages', {
                get: () => ['en-US', 'en'],
            });
            
            // Override automation detection
            const originalQuery = window.document.querySelector;
            window.document.querySelector = function(selector) {
                if (selector === 'head > meta[name="webdriver"]') {
                    return null;
                }
                return originalQuery.call(this, selector);
            };
        `;
    }
    
    private getCanvasFingerprintSpoofingScript(): string {
        return `
            // Canvas fingerprint spoofing
            const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
            const originalGetImageData = CanvasRenderingContext2D.prototype.getImageData;
            
            HTMLCanvasElement.prototype.toDataURL = function() {
                const context = this.getContext('2d');
                if (context) {
                    // Add noise to canvas fingerprint
                    const imageData = context.getImageData(0, 0, this.width, this.height);
                    for (let i = 0; i < imageData.data.length; i += 4) {
                        imageData.data[i] += Math.floor(Math.random() * 3) - 1;
                        imageData.data[i + 1] += Math.floor(Math.random() * 3) - 1;
                        imageData.data[i + 2] += Math.floor(Math.random() * 3) - 1;
                    }
                    context.putImageData(imageData, 0, 0);
                }
                return originalToDataURL.apply(this, arguments);
            };
            
            CanvasRenderingContext2D.prototype.getImageData = function() {
                const imageData = originalGetImageData.apply(this, arguments);
                // Add subtle noise to prevent fingerprinting
                for (let i = 0; i < imageData.data.length; i += 4) {
                    imageData.data[i] += Math.floor(Math.random() * 2) - 1;
                    imageData.data[i + 1] += Math.floor(Math.random() * 2) - 1;
                    imageData.data[i + 2] += Math.floor(Math.random() * 2) - 1;
                }
                return imageData;
            };
        `;
    }
    
    private getWebGLFingerprintSpoofingScript(): string {
        return `
            // WebGL fingerprint spoofing
            const getParameter = WebGLRenderingContext.prototype.getParameter;
            WebGLRenderingContext.prototype.getParameter = function(parameter) {
                if (parameter === 37445) { // UNMASKED_VENDOR_WEBGL
                    return 'Intel Inc.';
                }
                if (parameter === 37446) { // UNMASKED_RENDERER_WEBGL
                    return 'Intel Iris OpenGL Engine';
                }
                return getParameter.call(this, parameter);
            };
            
            const getParameter2 = WebGL2RenderingContext.prototype.getParameter;
            WebGL2RenderingContext.prototype.getParameter = function(parameter) {
                if (parameter === 37445) { // UNMASKED_VENDOR_WEBGL
                    return 'Intel Inc.';
                }
                if (parameter === 37446) { // UNMASKED_RENDERER_WEBGL
                    return 'Intel Iris OpenGL Engine';
                }
                return getParameter2.call(this, parameter);
            };
        `;
    }
    
    private getAudioFingerprintSpoofingScript(): string {
        return `
            // Audio fingerprint spoofing
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                const originalCreateAnalyser = AudioContext.prototype.createAnalyser;
                AudioContext.prototype.createAnalyser = function() {
                    const analyser = originalCreateAnalyser.call(this);
                    const originalGetFloatFrequencyData = analyser.getFloatFrequencyData;
                    analyser.getFloatFrequencyData = function(array) {
                        originalGetFloatFrequencyData.call(this, array);
                        // Add subtle noise to prevent fingerprinting
                        for (let i = 0; i < array.length; i++) {
                            array[i] += (Math.random() - 0.5) * 0.0001;
                        }
                    };
                    return analyser;
                };
            }
        `;
    }
    
    private getFontFingerprintSpoofingScript(): string {
        return `
            // Font fingerprint spoofing
            const originalMeasureText = CanvasRenderingContext2D.prototype.measureText;
            CanvasRenderingContext2D.prototype.measureText = function(text) {
                const result = originalMeasureText.call(this, text);
                // Add subtle variations to prevent fingerprinting
                result.width += (Math.random() - 0.5) * 0.1;
                return result;
            };
        `;
    }
    
    private getWebRTCBlockingScript(): string {
        return `
            // WebRTC blocking to prevent IP leakage
            const originalRTCPeerConnection = window.RTCPeerConnection;
            window.RTCPeerConnection = function() {
                throw new Error('WebRTC is disabled');
            };
            
            const originalGetUserMedia = navigator.mediaDevices?.getUserMedia;
            if (originalGetUserMedia) {
                navigator.mediaDevices.getUserMedia = function() {
                    return Promise.reject(new Error('getUserMedia is disabled'));
                };
            }
        `;
    }
    
    private getAutomationDetectionScript(): string {
        return `
            // Automation detection prevention
            Object.defineProperty(window, 'chrome', {
                get: () => ({
                    runtime: {
                        onConnect: undefined,
                        onMessage: undefined,
                    },
                }),
            });
            
            // Override automation detection methods
            const originalAddEventListener = EventTarget.prototype.addEventListener;
            EventTarget.prototype.addEventListener = function(type, listener, options) {
                if (type === 'beforeunload' && listener.toString().includes('webdriver')) {
                    return;
                }
                return originalAddEventListener.call(this, type, listener, options);
            };
            
            // Mask automation properties
            Object.defineProperty(navigator, 'permissions', {
                get: () => ({
                    query: () => Promise.resolve({ state: 'granted' }),
                }),
            });
            
            Object.defineProperty(navigator, 'geolocation', {
                get: () => ({
                    getCurrentPosition: () => {},
                    watchPosition: () => {},
                    clearWatch: () => {},
                }),
            });
        `;
    }
    
    /**
     * Generate stealth headers for requests
     */
    generateStealthHeaders(): Record<string, string> {
        return {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1',
            'Upgrade-Insecure-Requests': '1',
            'DNT': '1',
            'Connection': 'keep-alive',
        };
    }
    
    /**
     * Generate realistic browser environment variables
     */
    generateBrowserEnvironment(): Record<string, any> {
        return {
            navigator: {
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
                platform: 'Win32',
                language: 'en-US',
                languages: ['en-US', 'en'],
                cookieEnabled: true,
                doNotTrack: '1',
                hardwareConcurrency: 8,
                maxTouchPoints: 0,
                vendor: 'Google Inc.',
                vendorSub: '',
                productSub: '20030107',
                appName: 'Netscape',
                appVersion: '5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
                appCodeName: 'Mozilla',
                buildID: undefined,
                oscpu: undefined,
                product: 'Gecko',
                userAgentData: {
                    brands: [
                        { brand: 'Google Chrome', version: '131' },
                        { brand: 'Chromium', version: '131' },
                        { brand: 'Not=A?Brand', version: '24' }
                    ],
                    mobile: false,
                    platform: 'Windows'
                }
            },
            screen: {
                width: 1920,
                height: 1080,
                availWidth: 1920,
                availHeight: 1040,
                colorDepth: 24,
                pixelDepth: 24,
                orientation: {
                    type: 'landscape-primary',
                    angle: 0
                }
            },
            location: {
                href: 'https://www.google.com/',
                protocol: 'https:',
                host: 'www.google.com',
                hostname: 'www.google.com',
                port: '',
                pathname: '/',
                search: '',
                hash: '',
                origin: 'https://www.google.com'
            }
        };
    }
    
    /**
     * Inject stealth scripts into page
     */
    async injectStealthScripts(page: any): Promise<void> {
        try {
            const scripts = this.generateStealthScripts();
            
            for (const script of scripts) {
                await page.evaluate(script);
            }
            
            // Inject browser environment
            const environment = this.generateBrowserEnvironment();
            await page.evaluate((env: any) => {
                Object.assign(window, env);
                Object.assign(navigator, env.navigator);
                Object.assign(screen, env.screen);
                Object.assign(location, env.location);
            }, environment);
            
            log.debug('Stealth scripts injected successfully');
            
        } catch (error: any) {
            log.warning('Failed to inject stealth scripts:', error);
        }
    }
    
    /**
     * Configure stealth mode
     */
    configureStealth(config: Partial<StealthConfiguration>): void {
        this.stealthConfig = { ...this.stealthConfig, ...config };
        log.info('Stealth mode configured:', config);
    }
    
    /**
     * Get current stealth configuration
     */
    getStealthConfig(): StealthConfiguration {
        return { ...this.stealthConfig };
    }
}

// Global stealth mode instance
export const stealthMode = new AdvancedStealthMode();

export { StealthConfiguration, AdvancedStealthMode };