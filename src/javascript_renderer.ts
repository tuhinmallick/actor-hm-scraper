import { log } from 'crawlee';

/**
 * Enhanced JavaScript Rendering System
 * Inspired by Firecrawl's advanced JavaScript execution capabilities
 */

interface RenderingConfiguration {
    enableJavaScriptExecution: boolean;
    enableDynamicContentWaiting: boolean;
    enableNetworkIdleWaiting: boolean;
    enableScrollSimulation: boolean;
    enableInteractionSimulation: boolean;
    enableLazyLoadingHandling: boolean;
    enableInfiniteScrollHandling: boolean;
    enableModalHandling: boolean;
    enableCookieConsentHandling: boolean;
    enableAdBlocking: boolean;
    enableResourceOptimization: boolean;
    maxWaitTime: number;
    networkIdleTimeout: number;
    scrollDelay: number;
    interactionDelay: number;
}

interface RenderingResult {
    content: string;
    metadata: {
        title: string;
        description: string;
        keywords: string[];
        ogTitle: string;
        ogDescription: string;
        ogImage: string;
        canonicalUrl: string;
        robots: string;
        viewport: string;
    };
    links: Array<{
        url: string;
        text: string;
        title: string;
        rel: string;
    }>;
    images: Array<{
        src: string;
        alt: string;
        title: string;
        width: number;
        height: number;
    }>;
    scripts: Array<{
        src: string;
        type: string;
        content: string;
    }>;
    stylesheets: Array<{
        href: string;
        media: string;
        type: string;
    }>;
    forms: Array<{
        action: string;
        method: string;
        inputs: Array<{
            name: string;
            type: string;
            value: string;
            placeholder: string;
        }>;
    }>;
    performance: {
        loadTime: number;
        renderTime: number;
        networkRequests: number;
        domNodes: number;
    };
}

class AdvancedJavaScriptRenderer {
    private renderingConfig: RenderingConfiguration;
    private performanceMetrics: Map<string, number> = new Map();

    constructor() {
        this.renderingConfig = this.getDefaultRenderingConfig();
    }

    private getDefaultRenderingConfig(): RenderingConfiguration {
        return {
            enableJavaScriptExecution: true,
            enableDynamicContentWaiting: true,
            enableNetworkIdleWaiting: true,
            enableScrollSimulation: true,
            enableInteractionSimulation: true,
            enableLazyLoadingHandling: true,
            enableInfiniteScrollHandling: true,
            enableModalHandling: true,
            enableCookieConsentHandling: true,
            enableAdBlocking: true,
            enableResourceOptimization: true,
            maxWaitTime: 30000, // 30 seconds
            networkIdleTimeout: 2000, // 2 seconds
            scrollDelay: 1000, // 1 second
            interactionDelay: 500, // 500ms
        };
    }

    /**
     * Render page with advanced JavaScript execution
     */
    async renderPage(page: any, url: string): Promise<RenderingResult> {
        const startTime = Date.now();

        try {
            log.debug(`Starting advanced rendering for: ${url}`);

            // Navigate to page
            await page.goto(url, {
                waitUntil: 'domcontentloaded',
                timeout: this.renderingConfig.maxWaitTime,
            });

            // Wait for initial JavaScript execution
            if (this.renderingConfig.enableJavaScriptExecution) {
                await this.waitForJavaScriptExecution(page);
            }

            // Handle dynamic content loading
            if (this.renderingConfig.enableDynamicContentWaiting) {
                await this.waitForDynamicContent(page);
            }

            // Handle network idle
            if (this.renderingConfig.enableNetworkIdleWaiting) {
                await this.waitForNetworkIdle(page);
            }

            // Handle cookie consent and modals
            if (this.renderingConfig.enableCookieConsentHandling) {
                await this.handleCookieConsent(page);
            }

            if (this.renderingConfig.enableModalHandling) {
                await this.handleModals(page);
            }

            // Simulate user interactions
            if (this.renderingConfig.enableInteractionSimulation) {
                await this.simulateUserInteractions(page);
            }

            // Handle lazy loading
            if (this.renderingConfig.enableLazyLoadingHandling) {
                await this.handleLazyLoading(page);
            }

            // Handle infinite scroll
            if (this.renderingConfig.enableInfiniteScrollHandling) {
                await this.handleInfiniteScroll(page);
            }

            // Extract comprehensive data
            const result = await this.extractPageData(page);

            const loadTime = Date.now() - startTime;
            result.performance.loadTime = loadTime;

            log.debug(`Advanced rendering completed for ${url} in ${loadTime}ms`);

            return result;
        } catch (error: any) {
            log.error(`Advanced rendering failed for ${url}:`, error);
            throw error;
        }
    }

    private async waitForJavaScriptExecution(page: any): Promise<void> {
        try {
            await page.waitForFunction(() => {
                return document.readyState === 'complete';
            }, { timeout: 10000 });

            // Wait for common JavaScript frameworks
            await Promise.allSettled([
                page.waitForFunction(() => (window as any).jQuery, { timeout: 5000 }),
                page.waitForFunction(() => (window as any).React, { timeout: 5000 }),
                page.waitForFunction(() => (window as any).Vue, { timeout: 5000 }),
                page.waitForFunction(() => (window as any).Angular, { timeout: 5000 }),
            ]);
        } catch (error: any) {
            log.debug('JavaScript execution wait completed with timeout');
        }
    }

    private async waitForDynamicContent(page: any): Promise<void> {
        try {
            // Wait for common dynamic content indicators
            await Promise.allSettled([
                page.waitForSelector('[data-loaded="true"]', { timeout: 5000 }),
                page.waitForSelector('.loaded', { timeout: 5000 }),
                page.waitForSelector('[data-dynamic="true"]', { timeout: 5000 }),
                page.waitForFunction(() => {
                    const elements = document.querySelectorAll('[data-lazy]');
                    return elements.length === 0 || Array.from(elements).every((el) => el.getAttribute('data-loaded') === 'true');
                }, { timeout: 5000 }),
            ]);
        } catch (error: any) {
            log.debug('Dynamic content wait completed with timeout');
        }
    }

    private async waitForNetworkIdle(page: any): Promise<void> {
        try {
            await page.waitForLoadState('networkidle', { timeout: this.renderingConfig.networkIdleTimeout });
        } catch (error: any) {
            log.debug('Network idle wait completed with timeout');
        }
    }

    private async handleCookieConsent(page: any): Promise<void> {
        try {
            // Common cookie consent selectors
            const cookieSelectors = [
                '[id*="cookie"]',
                '[class*="cookie"]',
                '[id*="consent"]',
                '[class*="consent"]',
                '[id*="gdpr"]',
                '[class*="gdpr"]',
                '.cookie-banner',
                '.consent-banner',
                '#cookie-notice',
                '#consent-notice',
            ];

            for (const selector of cookieSelectors) {
                try {
                    const element = await page.$(selector);
                    if (element) {
                        // Look for accept/agree buttons
                        const acceptButtons = await page.$$(`${selector} button`);
                        for (const button of acceptButtons) {
                            const text = await button.textContent();
                            if (text && /accept|agree|ok|yes|allow/i.test(text)) {
                                await button.click();
                                log.debug('Cookie consent accepted');
                                await page.waitForTimeout(1000);
                                break;
                            }
                        }
                    }
                } catch (error: any) {
                    // Continue to next selector
                }
            }
        } catch (error: any) {
            log.debug('Cookie consent handling completed');
        }
    }

    private async handleModals(page: any): Promise<void> {
        try {
            // Common modal selectors
            const modalSelectors = [
                '.modal',
                '.popup',
                '.overlay',
                '.lightbox',
                '[role="dialog"]',
                '[aria-modal="true"]',
            ];

            for (const selector of modalSelectors) {
                try {
                    const modal = await page.$(selector);
                    if (modal) {
                        // Look for close buttons
                        const closeButtons = await page.$$(`${selector} button`);
                        for (const button of closeButtons) {
                            const text = await button.textContent();
                            if (text && /close|×|✕|dismiss|cancel/i.test(text)) {
                                await button.click();
                                log.debug('Modal closed');
                                await page.waitForTimeout(1000);
                                break;
                            }
                        }
                    }
                } catch (error: any) {
                    // Continue to next selector
                }
            }
        } catch (error: any) {
            log.debug('Modal handling completed');
        }
    }

    private async simulateUserInteractions(page: any): Promise<void> {
        try {
            // Simulate mouse movements
            await page.mouse.move(Math.random() * 800, Math.random() * 600);
            await page.waitForTimeout(200);

            // Simulate scrolling
            if (this.renderingConfig.enableScrollSimulation) {
                await this.simulateScrolling(page);
            }

            // Simulate focus events
            const focusableElements = await page.$$('input, button, a, select, textarea');
            if (focusableElements.length > 0) {
                const randomElement = focusableElements[Math.floor(Math.random() * focusableElements.length)];
                await randomElement.focus();
                await page.waitForTimeout(this.renderingConfig.interactionDelay);
            }
        } catch (error: any) {
            log.debug('User interaction simulation completed');
        }
    }

    private async simulateScrolling(page: any): Promise<void> {
        try {
            const scrollSteps = 3 + Math.floor(Math.random() * 3); // 3-5 scroll steps

            for (let i = 0; i < scrollSteps; i++) {
                const scrollDistance = 200 + Math.random() * 300; // 200-500px
                await page.evaluate((distance: number) => {
                    window.scrollBy(0, distance);
                }, scrollDistance);

                await page.waitForTimeout(this.renderingConfig.scrollDelay);
            }
        } catch (error: any) {
            log.debug('Scrolling simulation completed');
        }
    }

    private async handleLazyLoading(page: any): Promise<void> {
        try {
            // Trigger lazy loading by scrolling
            await page.evaluate(() => {
                window.scrollTo(0, document.body.scrollHeight);
            });

            await page.waitForTimeout(2000);

            // Scroll back to top
            await page.evaluate(() => {
                window.scrollTo(0, 0);
            });

            await page.waitForTimeout(1000);
        } catch (error: any) {
            log.debug('Lazy loading handling completed');
        }
    }

    private async handleInfiniteScroll(page: any): Promise<void> {
        try {
            let previousHeight = 0;
            let currentHeight = await page.evaluate(() => document.body.scrollHeight);
            let attempts = 0;
            const maxAttempts = 5;

            while (previousHeight !== currentHeight && attempts < maxAttempts) {
                previousHeight = currentHeight;

                // Scroll to bottom
                await page.evaluate(() => {
                    window.scrollTo(0, document.body.scrollHeight);
                });

                await page.waitForTimeout(2000);

                currentHeight = await page.evaluate(() => document.body.scrollHeight);
                attempts++;
            }
        } catch (error: any) {
            log.debug('Infinite scroll handling completed');
        }
    }

    private async extractPageData(page: any): Promise<RenderingResult> {
        return page.evaluate(() => {
            // Extract metadata
            const metadata = {
                title: document.title || '',
                description: document.querySelector('meta[name="description"]')?.getAttribute('content') || '',
                keywords: document.querySelector('meta[name="keywords"]')?.getAttribute('content')?.split(',') || [],
                ogTitle: document.querySelector('meta[property="og:title"]')?.getAttribute('content') || '',
                ogDescription: document.querySelector('meta[property="og:description"]')?.getAttribute('content') || '',
                ogImage: document.querySelector('meta[property="og:image"]')?.getAttribute('content') || '',
                canonicalUrl: document.querySelector('link[rel="canonical"]')?.getAttribute('href') || '',
                robots: document.querySelector('meta[name="robots"]')?.getAttribute('content') || '',
                viewport: document.querySelector('meta[name="viewport"]')?.getAttribute('content') || '',
            };

            // Extract links
            const links = Array.from(document.querySelectorAll('a[href]')).map((link) => ({
                url: (link as HTMLAnchorElement).href,
                text: link.textContent?.trim() || '',
                title: (link as HTMLAnchorElement).title || '',
                rel: (link as HTMLAnchorElement).rel || '',
            }));

            // Extract images
            const images = Array.from(document.querySelectorAll('img')).map((img) => ({
                src: img.src || '',
                alt: img.alt || '',
                title: img.title || '',
                width: img.naturalWidth || 0,
                height: img.naturalHeight || 0,
            }));

            // Extract scripts
            const scripts = Array.from(document.querySelectorAll('script')).map((script) => ({
                src: script.src || '',
                type: script.type || '',
                content: script.textContent || '',
            }));

            // Extract stylesheets
            const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map((link) => ({
                href: (link as HTMLLinkElement).href || '',
                media: (link as HTMLLinkElement).media || '',
                type: (link as HTMLLinkElement).type || '',
            }));

            // Extract forms
            const forms = Array.from(document.querySelectorAll('form')).map((form) => ({
                action: form.action || '',
                method: form.method || 'GET',
                inputs: Array.from(form.querySelectorAll('input, select, textarea')).map((input) => ({
                    name: (input as HTMLInputElement).name || '',
                    type: (input as HTMLInputElement).type || 'text',
                    value: (input as HTMLInputElement).value || '',
                    placeholder: (input as HTMLInputElement).placeholder || '',
                })),
            }));

            // Get content
            const content = document.documentElement.outerHTML;

            // Performance metrics
            const perfMetrics = {
                loadTime: window.performance.now(),
                renderTime: window.performance.now(),
                networkRequests: 0,
                domNodes: document.querySelectorAll('*').length,
            };

            return {
                content,
                metadata,
                links,
                images,
                scripts,
                stylesheets,
                forms,
                performance: perfMetrics,
            };
        });
    }

    /**
     * Configure rendering options
     */
    configureRendering(config: Partial<RenderingConfiguration>): void {
        this.renderingConfig = { ...this.renderingConfig, ...config };
        log.info('Rendering configuration updated:', config);
    }

    /**
     * Get current rendering configuration
     */
    getRenderingConfig(): RenderingConfiguration {
        return { ...this.renderingConfig };
    }

    /**
     * Get performance metrics
     */
    getPerformanceMetrics(): Map<string, number> {
        return new Map(this.performanceMetrics);
    }
}

// Global JavaScript renderer instance
export const javaScriptRenderer = new AdvancedJavaScriptRenderer();

export { RenderingConfiguration, RenderingResult, AdvancedJavaScriptRenderer };
