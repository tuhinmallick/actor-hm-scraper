import { Actor } from 'apify';
import { CheerioCrawler, log, LogLevel } from 'crawlee';
import { router } from './routes.js';
import { getStartUrls } from './tools.js';
import actorStatistics from './actor_statistics.js';
import { CONCURRENCY } from './constants.js';
import { getAntiBotCrawlerConfig, smartScheduler } from './anti_bot.js';
import { createEnhancedErrorHandler, retryWithBackoff } from './error_handling.js';
import { progressiveDataSaver, MemoryOptimizer, DataQualityMonitor } from './progressive_saving.js';
import { DataPersistence } from './progressive_saving.js';
import { getEnhancedProxyConfiguration } from './proxy_manager.js';

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
    progressiveDataSaver['config'] = {
        ...progressiveDataSaver['config'],
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

// Enhanced proxy configuration with intelligent rotation
let enhancedProxyConfig;
try {
    enhancedProxyConfig = await getEnhancedProxyConfiguration();
    log.info('Enhanced proxy configuration loaded successfully');
} catch (error: any) {
    log.warning('Enhanced proxy not configured or unavailable; continuing without enhanced proxy management.', error);
}

// Fallback to standard proxy configuration
let proxyConfiguration;
try {
    proxyConfiguration = await retryWithBackoff(
        () => Actor.createProxyConfiguration(),
        { 
            maxRetries: 3, 
            baseDelay: 1000,
            maxDelay: 30000,
            backoffMultiplier: 2,
            retryableErrors: ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND']
        }
    );
    log.info('Standard proxy configuration loaded successfully');
} catch (error: any) {
    log.warning('Proxy not configured or unavailable; continuing without a proxy.', error);
}

// Enhanced crawler configuration with all best practices
const crawlerConfig = getAntiBotCrawlerConfig({
    proxyConfiguration,
    maxConcurrency: CONCURRENCY, // Reduced concurrency for better stealth
    requestHandler: router,
    errorHandler: createEnhancedErrorHandler(),
    failedRequestHandler: createEnhancedErrorHandler(),
    // Additional optimizations
    maxRequestsPerCrawl: maxItems ? maxItems * 2 : undefined, // Allow some overhead
    requestHandlerTimeoutSecs: 90, // Increased timeout
    maxRequestRetries: 5, // Increased retries
    // Request optimization
    additionalMimeTypes: ['text/html', 'application/json'],
    ignoreSslErrors: false,
    // Enhanced stealth settings
    autoscaledPoolOptions: {
        maxConcurrency: CONCURRENCY,
        desiredConcurrency: Math.max(1, CONCURRENCY - 2), // Start with lower concurrency
        scaleUpStepRatio: 0.1, // Slower scaling up
        scaleDownStepRatio: 0.5, // Faster scaling down
    },
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
            
            // Log proxy statistics
            if (enhancedProxyConfig) {
                const proxyStats = enhancedProxyConfig.getStats();
                log.info('Final proxy statistics:', proxyStats);
            }
            
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
    
    // Start crawling with retry mechanism
    await retryWithBackoff(
        () => crawler.run(startUrls),
        { 
            maxRetries: 2, 
            baseDelay: 5000,
            maxDelay: 30000,
            backoffMultiplier: 2,
            retryableErrors: ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND']
        },
        'crawler startup'
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
        
        // Log proxy statistics
        if (enhancedProxyConfig) {
            const proxyStats = enhancedProxyConfig.getStats();
            log.info('Final proxy statistics:', proxyStats);
        }
        
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
