import { log } from 'crawlee';

/**
 * Advanced Parallelism Optimization System
 * Implements intelligent concurrency management following best practices
 */

interface ConcurrencyProfile {
    name: string;
    maxConcurrency: number;
    desiredConcurrency: number;
    minConcurrency: number;
    scaleUpStep: number;
    scaleDownStep: number;
    scaleUpThreshold: number;
    scaleDownThreshold: number;
    burstLimit: number;
    cooldownPeriod: number;
}

interface PerformanceMetrics {
    requestsPerSecond: number;
    successRate: number;
    averageResponseTime: number;
    errorRate: number;
    blockingRate: number;
    memoryUsage: number;
    cpuUsage: number;
    queueLength: number;
    activeRequests: number;
}

interface AdaptiveConfig {
    enableAdaptiveScaling: boolean;
    enableBurstMode: boolean;
    enableCooldownMode: boolean;
    enableMemoryOptimization: boolean;
    enableErrorBasedScaling: boolean;
    enableTimeBasedScaling: boolean;
    enableResourceBasedScaling: boolean;
}

class AdvancedConcurrencyManager {
    private currentProfile: ConcurrencyProfile;
    private performanceMetrics: PerformanceMetrics;
    private adaptiveConfig: AdaptiveConfig;
    private scalingHistory: ScalingEvent[] = [];
    private lastScaleTime = 0;
    private burstModeActive = false;
    private cooldownModeActive = false;
    private errorStreak = 0;
    private successStreak = 0;

    constructor() {
        this.currentProfile = this.getDefaultProfile();
        this.performanceMetrics = this.initializeMetrics();
        this.adaptiveConfig = this.getDefaultAdaptiveConfig();

        // Start performance monitoring
        this.startPerformanceMonitoring();
    }

    private getDefaultProfile(): ConcurrencyProfile {
        return {
            name: 'balanced',
            maxConcurrency: 8, // Conservative maximum
            desiredConcurrency: 3, // Start conservative
            minConcurrency: 1,
            scaleUpStep: 0.5, // Gradual scaling
            scaleDownStep: 1, // Faster scaling down
            scaleUpThreshold: 0.85, // High success rate required
            scaleDownThreshold: 0.7, // Scale down on moderate issues
            burstLimit: 12, // Temporary burst limit
            cooldownPeriod: 30000, // 30 seconds cooldown
        };
    }

    private initializeMetrics(): PerformanceMetrics {
        return {
            requestsPerSecond: 0,
            successRate: 1.0,
            averageResponseTime: 2000,
            errorRate: 0.0,
            blockingRate: 0.0,
            memoryUsage: 0,
            cpuUsage: 0,
            queueLength: 0,
            activeRequests: 0,
        };
    }

    private getDefaultAdaptiveConfig(): AdaptiveConfig {
        return {
            enableAdaptiveScaling: true,
            enableBurstMode: true,
            enableCooldownMode: true,
            enableMemoryOptimization: true,
            enableErrorBasedScaling: true,
            enableTimeBasedScaling: true,
            enableResourceBasedScaling: true,
        };
    }

    /**
     * Get optimal concurrency configuration based on current conditions
     */
    getOptimalConcurrency(): ConcurrencyProfile {
        this.updatePerformanceMetrics();

        if (this.adaptiveConfig.enableAdaptiveScaling) {
            this.performAdaptiveScaling();
        }

        return { ...this.currentProfile };
    }

    private updatePerformanceMetrics(): void {
        // This would be implemented with actual performance monitoring
        // For now, we'll simulate realistic metrics

        const now = Date.now();
        const timeSinceLastUpdate = now - (this.lastScaleTime || now);

        // Simulate performance degradation over time
        if (timeSinceLastUpdate > 60000) { // 1 minute
            this.performanceMetrics.successRate *= 0.99; // Gradual degradation
            this.performanceMetrics.averageResponseTime *= 1.01; // Slight increase
        }

        // Update based on recent scaling events
        const recentErrors = this.scalingHistory.filter((e) => e.type === 'error' && now - e.timestamp < 30000,
        ).length;

        if (recentErrors > 2) {
            this.performanceMetrics.errorRate = Math.min(this.performanceMetrics.errorRate + 0.1, 1.0);
            this.performanceMetrics.successRate = Math.max(this.performanceMetrics.successRate - 0.1, 0.0);
        }
    }

    private performAdaptiveScaling(): void {
        const now = Date.now();

        // Prevent too frequent scaling
        if (now - this.lastScaleTime < 10000) { // 10 seconds minimum
            return;
        }

        // Check for burst mode conditions
        if (this.adaptiveConfig.enableBurstMode && this.shouldEnterBurstMode()) {
            this.enterBurstMode();
            return;
        }

        // Check for cooldown mode conditions
        if (this.adaptiveConfig.enableCooldownMode && this.shouldEnterCooldownMode()) {
            this.enterCooldownMode();
            return;
        }

        // Normal adaptive scaling
        if (this.shouldScaleUp()) {
            this.scaleUp();
        } else if (this.shouldScaleDown()) {
            this.scaleDown();
        }
    }

    private shouldEnterBurstMode(): boolean {
        return (
            this.performanceMetrics.successRate > 0.95
            && this.performanceMetrics.averageResponseTime < 1500
            && this.performanceMetrics.errorRate < 0.02
            && !this.burstModeActive
            && this.currentProfile.desiredConcurrency < this.currentProfile.burstLimit
        );
    }

    private enterBurstMode(): void {
        this.burstModeActive = true;
        this.currentProfile.desiredConcurrency = Math.min(
            this.currentProfile.desiredConcurrency + 2,
            this.currentProfile.burstLimit,
        );

        this.recordScalingEvent('burst_mode', 'entered');
        log.info(`Entered burst mode: concurrency increased to ${this.currentProfile.desiredConcurrency}`);

        // Auto-exit burst mode after 2 minutes
        setTimeout(() => {
            this.exitBurstMode();
        }, 120000);
    }

    private exitBurstMode(): void {
        this.burstModeActive = false;
        this.currentProfile.desiredConcurrency = Math.max(
            this.currentProfile.desiredConcurrency - 1,
            this.currentProfile.minConcurrency,
        );

        this.recordScalingEvent('burst_mode', 'exited');
        log.info(`Exited burst mode: concurrency reduced to ${this.currentProfile.desiredConcurrency}`);
    }

    private shouldEnterCooldownMode(): boolean {
        return (
            this.performanceMetrics.errorRate > 0.1
            || this.performanceMetrics.blockingRate > 0.05
            || this.errorStreak > 3
            || this.performanceMetrics.successRate < 0.7
        );
    }

    private enterCooldownMode(): void {
        this.cooldownModeActive = true;
        this.currentProfile.desiredConcurrency = this.currentProfile.minConcurrency;

        this.recordScalingEvent('cooldown_mode', 'entered');
        log.warning(`Entered cooldown mode: concurrency reduced to ${this.currentProfile.desiredConcurrency}`);

        // Auto-exit cooldown mode after cooldown period
        setTimeout(() => {
            this.exitCooldownMode();
        }, this.currentProfile.cooldownPeriod);
    }

    private exitCooldownMode(): void {
        this.cooldownModeActive = false;
        this.currentProfile.desiredConcurrency = Math.min(
            this.currentProfile.desiredConcurrency + 1,
            this.currentProfile.maxConcurrency,
        );

        this.recordScalingEvent('cooldown_mode', 'exited');
        log.info(`Exited cooldown mode: concurrency increased to ${this.currentProfile.desiredConcurrency}`);
    }

    private shouldScaleUp(): boolean {
        return (
            this.performanceMetrics.successRate > this.currentProfile.scaleUpThreshold
            && this.performanceMetrics.averageResponseTime < 2000
            && this.performanceMetrics.errorRate < 0.05
            && this.successStreak > 5
            && this.currentProfile.desiredConcurrency < this.currentProfile.maxConcurrency
            && !this.burstModeActive
            && !this.cooldownModeActive
        );
    }

    private shouldScaleDown(): boolean {
        return (
            this.performanceMetrics.successRate < this.currentProfile.scaleDownThreshold
            || this.performanceMetrics.averageResponseTime > 3000
            || this.performanceMetrics.errorRate > 0.1
            || this.errorStreak > 2
            || this.performanceMetrics.blockingRate > 0.05
        );
    }

    private scaleUp(): void {
        const oldConcurrency = this.currentProfile.desiredConcurrency;
        this.currentProfile.desiredConcurrency = Math.min(
            this.currentProfile.desiredConcurrency + this.currentProfile.scaleUpStep,
            this.currentProfile.maxConcurrency,
        );

        this.recordScalingEvent('scale_up', `from ${oldConcurrency} to ${this.currentProfile.desiredConcurrency}`);
        log.info(`Scaled up concurrency: ${oldConcurrency} → ${this.currentProfile.desiredConcurrency}`);

        this.successStreak++;
        this.errorStreak = 0;
    }

    private scaleDown(): void {
        const oldConcurrency = this.currentProfile.desiredConcurrency;
        this.currentProfile.desiredConcurrency = Math.max(
            this.currentProfile.desiredConcurrency - this.currentProfile.scaleDownStep,
            this.currentProfile.minConcurrency,
        );

        this.recordScalingEvent('scale_down', `from ${oldConcurrency} to ${this.currentProfile.desiredConcurrency}`);
        log.warning(`Scaled down concurrency: ${oldConcurrency} → ${this.currentProfile.desiredConcurrency}`);

        this.errorStreak++;
        this.successStreak = 0;
    }

    private recordScalingEvent(type: string, details: string): void {
        this.scalingHistory.push({
            type,
            details,
            timestamp: Date.now(),
            concurrency: this.currentProfile.desiredConcurrency,
            metrics: { ...this.performanceMetrics },
        });

        this.lastScaleTime = Date.now();

        // Keep only last 50 scaling events
        if (this.scalingHistory.length > 50) {
            this.scalingHistory.shift();
        }
    }

    /**
     * Record request outcome for adaptive learning
     */
    recordRequestOutcome(success: boolean, responseTime: number, wasBlocked: boolean): void {
        // Update streaks
        if (success) {
            this.successStreak++;
            this.errorStreak = 0;
        } else {
            this.errorStreak++;
            this.successStreak = 0;
        }

        // Update metrics
        this.performanceMetrics.averageResponseTime = (this.performanceMetrics.averageResponseTime * 0.9) + (responseTime * 0.1);

        if (wasBlocked) {
            this.performanceMetrics.blockingRate = (this.performanceMetrics.blockingRate * 0.95) + 0.05;
        } else {
            this.performanceMetrics.blockingRate *= 0.99;
        }

        // Trigger adaptive scaling if needed
        if (this.adaptiveConfig.enableAdaptiveScaling) {
            setTimeout(() => this.performAdaptiveScaling(), 1000);
        }
    }

    private startPerformanceMonitoring(): void {
        // Monitor performance every 30 seconds
        setInterval(() => {
            this.updatePerformanceMetrics();

            if (this.adaptiveConfig.enableAdaptiveScaling) {
                this.performAdaptiveScaling();
            }
        }, 30000);
    }

    /**
     * Get current configuration for crawler
     */
    getCrawlerConfig(): any {
        const profile = this.getOptimalConcurrency();

        return {
            maxConcurrency: profile.maxConcurrency,
            minConcurrency: profile.minConcurrency,
        };
    }

    /**
     * Get performance statistics
     */
    getStats() {
        return {
            currentProfile: this.currentProfile,
            performanceMetrics: this.performanceMetrics,
            adaptiveConfig: this.adaptiveConfig,
            scalingHistory: this.scalingHistory.slice(-10), // Last 10 events
            burstModeActive: this.burstModeActive,
            cooldownModeActive: this.cooldownModeActive,
            errorStreak: this.errorStreak,
            successStreak: this.successStreak,
            lastScaleTime: this.lastScaleTime,
        };
    }

    /**
     * Update adaptive configuration
     */
    updateAdaptiveConfig(config: Partial<AdaptiveConfig>): void {
        this.adaptiveConfig = { ...this.adaptiveConfig, ...config };
        log.info('Updated adaptive configuration:', config);
    }

    /**
     * Force specific concurrency level (for testing)
     */
    setConcurrency(concurrency: number): void {
        const oldConcurrency = this.currentProfile.desiredConcurrency;
        this.currentProfile.desiredConcurrency = Math.max(
            Math.min(concurrency, this.currentProfile.maxConcurrency),
            this.currentProfile.minConcurrency,
        );

        this.recordScalingEvent('manual_override', `from ${oldConcurrency} to ${this.currentProfile.desiredConcurrency}`);
        log.info(`Manually set concurrency: ${oldConcurrency} → ${this.currentProfile.desiredConcurrency}`);
    }
}

interface ScalingEvent {
    type: string;
    details: string;
    timestamp: number;
    concurrency: number;
    metrics: PerformanceMetrics;
}

// Global concurrency manager
export const concurrencyManager = new AdvancedConcurrencyManager();

export { ConcurrencyProfile, PerformanceMetrics, AdaptiveConfig, AdvancedConcurrencyManager };
