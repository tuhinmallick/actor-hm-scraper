import { log } from 'crawlee';
import { Actor } from 'apify';

/**
 * Intelligent proxy rotation and management system
 * Handles proxy switching, health monitoring, and blocking detection
 */

interface ProxyInfo {
    id: string;
    url: string;
    lastUsed: number;
    failureCount: number;
    successCount: number;
    lastFailure: number;
    isHealthy: boolean;
    blockedDomains: Set<string>;
}

class ProxyManager {
    private proxies: Map<string, ProxyInfo> = new Map();
    private currentProxyId: string | null = null;
    private blockedProxies: Set<string> = new Set();
    private proxyRotationCount = 0;
    private readonly maxFailuresPerProxy = 3;
    private readonly proxyCooldownTime = 300000; // 5 minutes
    private readonly healthCheckInterval = 60000; // 1 minute

    constructor() {
        this.startHealthMonitoring();
    }

    /**
     * Initialize proxy manager with available proxies
     */
    async initialize(): Promise<void> {
        try {
            const proxyConfiguration = await Actor.createProxyConfiguration();
            if (proxyConfiguration) {
                log.info('Proxy configuration available, initializing proxy manager');
                // Note: In a real implementation, you would extract proxy URLs from the configuration
                // For now, we'll simulate proxy management
                this.addProxy('default', 'default-proxy');
            } else {
                log.info('No proxy configuration available, running without proxies');
            }
        } catch (error: any) {
            log.warning('Failed to initialize proxy manager:', error);
        }
    }

    /**
     * Add a proxy to the manager
     */
    private addProxy(id: string, url: string): void {
        this.proxies.set(id, {
            id,
            url,
            lastUsed: 0,
            failureCount: 0,
            successCount: 0,
            lastFailure: 0,
            isHealthy: true,
            blockedDomains: new Set(),
        });
    }

    /**
     * Get the best available proxy
     */
    getBestProxy(): string | null {
        const healthyProxies = Array.from(this.proxies.values())
            .filter(proxy => proxy.isHealthy && !this.blockedProxies.has(proxy.id))
            .sort((a, b) => {
                // Sort by success rate (higher is better)
                const aSuccessRate = a.successCount / (a.successCount + a.failureCount + 1);
                const bSuccessRate = b.successCount / (b.successCount + b.failureCount + 1);
                return bSuccessRate - aSuccessRate;
            });

        if (healthyProxies.length === 0) {
            log.warning('No healthy proxies available');
            return null;
        }

        const selectedProxy = healthyProxies[0];
        this.currentProxyId = selectedProxy.id;
        selectedProxy.lastUsed = Date.now();
        
        log.debug(`Selected proxy: ${selectedProxy.id} (success rate: ${(selectedProxy.successCount / (selectedProxy.successCount + selectedProxy.failureCount + 1) * 100).toFixed(1)}%)`);
        
        return selectedProxy.url;
    }

    /**
     * Record proxy success
     */
    recordSuccess(): void {
        if (this.currentProxyId) {
            const proxy = this.proxies.get(this.currentProxyId);
            if (proxy) {
                proxy.successCount++;
                proxy.isHealthy = true;
                log.debug(`Proxy ${this.currentProxyId} success recorded (total: ${proxy.successCount})`);
            }
        }
    }

    /**
     * Record proxy failure
     */
    recordFailure(error?: Error): void {
        if (this.currentProxyId) {
            const proxy = this.proxies.get(this.currentProxyId);
            if (proxy) {
                proxy.failureCount++;
                proxy.lastFailure = Date.now();
                
                log.warning(`Proxy ${this.currentProxyId} failure recorded (total: ${proxy.failureCount})`);
                
                // Check if proxy should be marked as unhealthy
                if (proxy.failureCount >= this.maxFailuresPerProxy) {
                    proxy.isHealthy = false;
                    this.blockedProxies.add(this.currentProxyId);
                    log.error(`Proxy ${this.currentProxyId} marked as unhealthy due to ${proxy.failureCount} failures`);
                }
                
                // Check for domain-specific blocking
                if (error?.message?.includes('403') || error?.message?.includes('blocked')) {
                    const domain = this.extractDomainFromError(error);
                    if (domain) {
                        proxy.blockedDomains.add(domain);
                        log.warning(`Proxy ${this.currentProxyId} blocked on domain: ${domain}`);
                    }
                }
            }
        }
    }

    /**
     * Rotate to next available proxy
     */
    rotateProxy(): string | null {
        this.proxyRotationCount++;
        log.info(`Rotating proxy (rotation #${this.proxyRotationCount})`);
        
        // Reset current proxy
        this.currentProxyId = null;
        
        // Get next best proxy
        return this.getBestProxy();
    }

    /**
     * Check if proxy rotation is needed
     */
    shouldRotateProxy(): boolean {
        if (!this.currentProxyId) return true;
        
        const proxy = this.proxies.get(this.currentProxyId);
        if (!proxy) return true;
        
        // Rotate if proxy has too many failures
        if (proxy.failureCount >= this.maxFailuresPerProxy) return true;
        
        // Rotate if proxy has been used for too long
        const timeSinceLastUse = Date.now() - proxy.lastUsed;
        if (timeSinceLastUse > 1800000) return true; // 30 minutes
        
        // Rotate periodically for stealth
        if (this.proxyRotationCount > 0 && this.proxyRotationCount % 10 === 0) return true;
        
        return false;
    }

    /**
     * Extract domain from error message
     */
    private extractDomainFromError(error: Error): string | null {
        const message = error.message.toLowerCase();
        const domainMatch = message.match(/(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+\.[a-zA-Z]{2,})/);
        return domainMatch ? domainMatch[1] : null;
    }

    /**
     * Start health monitoring for proxies
     */
    private startHealthMonitoring(): void {
        setInterval(() => {
            this.performHealthCheck();
        }, this.healthCheckInterval);
    }

    /**
     * Perform health check on proxies
     */
    private performHealthCheck(): void {
        const now = Date.now();
        
        for (const [id, proxy] of this.proxies) {
            // Check if proxy should be unblocked
            if (this.blockedProxies.has(id)) {
                const timeSinceFailure = now - proxy.lastFailure;
                if (timeSinceFailure > this.proxyCooldownTime) {
                    this.blockedProxies.delete(id);
                    proxy.isHealthy = true;
                    proxy.failureCount = Math.max(0, proxy.failureCount - 1);
                    log.info(`Proxy ${id} unblocked after cooldown period`);
                }
            }
            
            // Reset success/failure counts periodically
            if (now - proxy.lastUsed > 3600000) { // 1 hour
                proxy.successCount = Math.max(0, proxy.successCount - 1);
                proxy.failureCount = Math.max(0, proxy.failureCount - 1);
            }
        }
    }

    /**
     * Get proxy statistics
     */
    getStats() {
        const totalProxies = this.proxies.size;
        const healthyProxies = Array.from(this.proxies.values()).filter(p => p.isHealthy).length;
        const blockedProxies = this.blockedProxies.size;
        
        return {
            totalProxies,
            healthyProxies,
            blockedProxies,
            currentProxy: this.currentProxyId,
            rotationCount: this.proxyRotationCount,
            proxyDetails: Array.from(this.proxies.values()).map(p => ({
                id: p.id,
                successCount: p.successCount,
                failureCount: p.failureCount,
                isHealthy: p.isHealthy,
                blockedDomains: Array.from(p.blockedDomains),
            })),
        };
    }

    /**
     * Force proxy rotation (for emergency situations)
     */
    forceRotation(): string | null {
        log.warning('Forcing proxy rotation due to critical blocking');
        this.blockedProxies.add(this.currentProxyId || '');
        return this.rotateProxy();
    }
}

// Global proxy manager instance
export const proxyManager = new ProxyManager();

/**
 * Enhanced proxy configuration with rotation
 */
export const getEnhancedProxyConfiguration = async () => {
    await proxyManager.initialize();
    
    // Return the proxy configuration with rotation logic
    return {
        getProxyUrl: () => proxyManager.getBestProxy(),
        rotateProxy: () => proxyManager.rotateProxy(),
        shouldRotate: () => proxyManager.shouldRotateProxy(),
        recordSuccess: () => proxyManager.recordSuccess(),
        recordFailure: (error?: Error) => proxyManager.recordFailure(error),
        getStats: () => proxyManager.getStats(),
        forceRotation: () => proxyManager.forceRotation(),
    };
};