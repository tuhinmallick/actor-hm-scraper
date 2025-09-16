import { Actor } from 'apify';
import { CheerioCrawler, log, LogLevel } from 'crawlee';
import { router } from './routes.js';
import { getStartUrls } from './tools.js';
import actorStatistics from './actor_statistics.js';
// import { CONCURRENCY } from './constants.js'; // Unused - concurrency managed by concurrencyManager
import { getAntiBotCrawlerConfig, smartScheduler } from './anti_bot.js';
import { concurrencyManager } from './concurrency_manager.js';
import { advancedSessionManager } from './advanced_stealth.js';
import { behavioralSimulator } from './behavioral_simulation.js';
import { stealthMode } from './stealth_mode.js';
import { javaScriptRenderer } from './javascript_renderer.js';
import { createEnhancedErrorHandler, retryWithBackoff } from './error_handling.js';
import { progressiveDataSaver, MemoryOptimizer, DataQualityMonitor, DataPersistence } from './progressive_saving.js';
import { getEnhancedProxyConfiguration } from './proxy_manager.js';
import { createApifyProxyConfig } from './apify_proxy_config.js';

interface InputSchema {
    debug?: boolean,
    useMockRequests?: boolean,
    inputCountry?: string,
    maxItems?: number,
    maxRunSeconds?: number,
    enableAntiBot?: boolean,
    enableProgressiveSaving?: boolean,
    batchSize?: number,
    minQualityScore?: number,
    enableMemoryOptimization?: boolean,
}
const {
    inputCountry,
    maxItems,
    maxRunSeconds,
    debug: inputDebug,
    useMockRequests,
    enableAntiBot = true,
    enableProgressiveSaving = true,
    batchSize = 50,
    minQualityScore = 70,
    enableMemoryOptimization = true,
} = (await Actor.getInput<InputSchema>())
?? {
    inputCountry: 'UNITED KINGDOM',
};

const debug = Boolean(inputDebug);

// Enhanced logging configuration
if (debug) {
    log.setLevel(LogLevel.DEBUG);
} else {
    log.setLevel(LogLevel.INFO);
}

log.info('Starting enhanced HM.com scraper with best practices', {
    inputCountry,
    maxItems,
    maxRunSeconds,
    enableAntiBot,
    enableProgressiveSaving,
    batchSize,
    minQualityScore,
    enableMemoryOptimization,
});

// Initialize progressive data saver
if (enableProgressiveSaving) {
    progressiveDataSaver.config = {
        ...progressiveDataSaver.config,
        batchSize,
        minQualityScore,
    };
    log.info('Progressive data saving enabled');
}

// Initialize memory optimization
if (enableMemoryOptimization) {
    MemoryOptimizer.startMonitoring();
    log.info('Memory optimization enabled');
}

// Load previous state for recovery
const previousState = await DataPersistence.loadState();
if (previousState) {
    log.info('Loaded previous state for recovery:', previousState);
}

const startUrls = getStartUrls(useMockRequests, inputCountry);

// Proxy configuration
let proxyConfiguration;
let enhancedProxyConfig: any;
const proxyInput = await Actor.getInput<any>();

// Check if user wants to use proxies
if (proxyInput?.proxyConfiguration) {
    try {
        // Use Apify proxy configuration
        proxyConfiguration = await createApifyProxyConfig(
            proxyInput.proxyConfiguration,
            inputCountry?.toLowerCase()
        );
        
        if (proxyConfiguration) {
            log.info('Apify proxy configuration loaded successfully');
        } else {
            log.info('Running without proxy configuration');
        }
    } catch (error: any) {
        log.warning('Failed to create proxy configuration:', error);
    }
} else if (enableAntiBot) {
    // Use enhanced proxy configuration for anti-bot
    try {
        enhancedProxyConfig = await getEnhancedProxyConfiguration();
        log.info('Enhanced anti-bot proxy configuration loaded');
        // Note: Enhanced proxy config returns a custom object, not ProxyConfiguration
        // We'll use it in the anti-bot config
    } catch (error: any) {
        log.warning('Enhanced proxy not available:', error);
    }
}

// Advanced crawler configuration with cutting-edge anti-bot techniques
const crawlerConfig = getAntiBotCrawlerConfig({
    proxyConfiguration,
    requestHandler: router,
    errorHandler: createEnhancedErrorHandler(),
    failedRequestHandler: createEnhancedErrorHandler(),
        // Additional optimizations
        // For proper operation, we need to allow enough requests to navigate through categories to products
        // Minimum should be high enough to handle navigation -> categories -> subcategories -> products
        maxRequestsPerCrawl: maxItems ? Math.max(maxItems * 100, 1000) : undefined, // Allow sufficient requests for navigation
    // Request optimization
    additionalMimeTypes: ['text/html', 'application/json', 'application/xml'],
    ignoreSslErrors: false,
});

const crawler = new CheerioCrawler(crawlerConfig);

// Set up enhanced statistics
actorStatistics.setLimit(maxItems);

// Enhanced timeout handling with graceful shutdown
if (typeof maxRunSeconds === 'number' && maxRunSeconds > 0) {
    setTimeout(async () => {
        log.info(`Max run time reached (${maxRunSeconds}s). Initiating graceful shutdown.`);

        try {
            // Save any remaining data
            if (enableProgressiveSaving) {
                await progressiveDataSaver.forceSave();
            }

            // Log final statistics
            actorStatistics.logStatistics();
            DataQualityMonitor.logQualityReport();

            // Log scheduler statistics
            const schedulerStats = smartScheduler.getStats();
            log.info('Final scheduler statistics:', schedulerStats);

            // Log advanced session statistics
            const sessionStats = advancedSessionManager.getStats();
            log.info('Final advanced session statistics:', sessionStats);

            // Log behavioral simulation statistics
            const behavioralStats = behavioralSimulator.getStats();
            log.info('Final behavioral simulation statistics:', behavioralStats);

            // Log concurrency management statistics
            const concurrencyStats = concurrencyManager.getStats();
            log.info('Final concurrency management statistics:', concurrencyStats);

            // Log proxy statistics
            if (enhancedProxyConfig) {
                const proxyStats = enhancedProxyConfig.getStats();
                log.info('Final proxy statistics:', proxyStats);
            }

            // Log stealth mode statistics
            const stealthStats = stealthMode.getStealthConfig();
            log.info('Final stealth mode statistics:', stealthStats);

            // Log JavaScript renderer statistics
            const rendererStats = javaScriptRenderer.getPerformanceMetrics();
            log.info('Final JavaScript renderer statistics:', Object.fromEntries(rendererStats));

            // Save final state
            await DataPersistence.saveState({
                totalSaved: actorStatistics.getSavedCount(),
                qualityMetrics: DataQualityMonitor.getMetrics(),
                timestamp: new Date().toISOString(),
            });

            // Graceful shutdown
            await crawler.autoscaledPool?.abort();
        } catch (error: any) {
            log.error('Error during graceful shutdown:', error);
        } finally {
            await Actor.exit();
        }
    }, maxRunSeconds * 1000);
}

// Enhanced startup sequence
try {
    log.info('Starting crawler with enhanced configuration');

    // Save startup state
    await DataPersistence.saveState({
        startTime: new Date().toISOString(),
        configuration: {
            inputCountry,
            maxItems,
            enableAntiBot,
            enableProgressiveSaving,
        },
    });

    // Start crawling with retry mechanism using Crawlee v3's batch request method
    await retryWithBackoff(
        async () => {
            // Use Crawlee v3's new addRequests method for better performance
            log.info(`Adding ${startUrls.length} initial requests using Crawlee v3 batch method`);
            await crawler.addRequests(startUrls);
            
            // Start the crawler without initial URLs (they're now in the queue)
            await crawler.run();
        },
        {
            maxRetries: 2,
            baseDelay: 5000,
            maxDelay: 30000,
            backoffMultiplier: 2,
            retryableErrors: ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND'],
        },
        'crawler startup',
    );
} catch (error: any) {
    log.error('Crawler failed to start:', error);

    // Attempt recovery
    try {
        log.info('Attempting recovery...');
        await progressiveDataSaver.forceSave();
        await DataPersistence.saveState({
            error: error.toString(),
            recoveryAttempted: true,
            timestamp: new Date().toISOString(),
        });
    } catch (recoveryError: any) {
        log.error('Recovery failed:', recoveryError);
    }

    throw error;
} finally {
    // Final cleanup and statistics
    try {
        log.info('Performing final cleanup...');

        // Save any remaining data
        if (enableProgressiveSaving) {
            await progressiveDataSaver.cleanup();
        }

        // Log final statistics
        actorStatistics.logStatistics();
        DataQualityMonitor.logQualityReport();

        // Log scheduler statistics
        const schedulerStats = smartScheduler.getStats();
        log.info('Final scheduler statistics:', schedulerStats);

        // Log advanced session statistics
        const sessionStats = advancedSessionManager.getStats();
        log.info('Final advanced session statistics:', sessionStats);

        // Log behavioral simulation statistics
        const behavioralStats = behavioralSimulator.getStats();
        log.info('Final behavioral simulation statistics:', behavioralStats);

        // Log concurrency management statistics
        const concurrencyStats = concurrencyManager.getStats();
        log.info('Final concurrency management statistics:', concurrencyStats);

        // Log proxy statistics
        if (enhancedProxyConfig) {
            const proxyStats = enhancedProxyConfig.getStats();
            log.info('Final proxy statistics:', proxyStats);
        }

        // Log stealth mode statistics
        const stealthStats = stealthMode.getStealthConfig();
        log.info('Final stealth mode statistics:', stealthStats);

        // Log JavaScript renderer statistics
        const rendererStats = javaScriptRenderer.getPerformanceMetrics();
        log.info('Final JavaScript renderer statistics:', Object.fromEntries(rendererStats));

        // Save final state
        await DataPersistence.saveState({
            endTime: new Date().toISOString(),
            finalStats: {
                totalSaved: actorStatistics.getSavedCount(),
                qualityMetrics: DataQualityMonitor.getMetrics(),
                progressiveSaverStats: progressiveDataSaver.getStats(),
            },
        });

        log.info('Scraping completed successfully');
    } catch (cleanupError: any) {
        log.error('Error during final cleanup:', cleanupError);
    }
}

await Actor.exit();
