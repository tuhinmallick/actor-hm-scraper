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

await Actor.init();

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

// Enhanced proxy configuration with retry
let proxyConfiguration;
try {
    proxyConfiguration = await retryWithBackoff(
        () => Actor.createProxyConfiguration(),
        { maxRetries: 3, baseDelay: 1000 }
    );
    log.info('Proxy configuration loaded successfully');
} catch (error) {
    log.warning('Proxy not configured or unavailable; continuing without a proxy.', error);
}

// Enhanced crawler configuration with all best practices
const crawlerConfig = getAntiBotCrawlerConfig({
    proxyConfiguration,
    maxConcurrency: CONCURRENCY,
    requestHandler: router,
    errorHandler: createEnhancedErrorHandler(),
    failedRequestHandler: createEnhancedErrorHandler(),
    // Additional optimizations
    maxRequestsPerCrawl: maxItems ? maxItems * 2 : undefined, // Allow some overhead
    requestHandlerTimeoutSecs: 60,
    maxRequestRetries: 3,
    // Memory optimizations
    maxMemoryUsage: 0.8, // 80% of available memory
    // Request optimization
    additionalMimeTypes: ['text/html', 'application/json'],
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
            
            // Save final state
            await DataPersistence.saveState({
                totalSaved: actorStatistics.getSavedCount(),
                qualityMetrics: DataQualityMonitor.getMetrics(),
                timestamp: new Date().toISOString(),
            });
            
            // Graceful shutdown
            await crawler.autoscaledPool?.abort();
        } catch (error) {
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
        { maxRetries: 2, baseDelay: 5000 },
        'crawler startup'
    );
    
} catch (error) {
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
    } catch (recoveryError) {
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
        
    } catch (cleanupError) {
        log.error('Error during final cleanup:', cleanupError);
    }
}

await Actor.exit();
