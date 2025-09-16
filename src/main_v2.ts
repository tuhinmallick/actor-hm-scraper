import { Actor } from 'apify';
import { CheerioCrawler, log, LogLevel, Request } from 'crawlee';
import { router } from './routes.js';
import { getStartUrls } from './tools.js';
import actorStatistics from './actor_statistics.js';
import { getAntiBotCrawlerConfig } from './anti_bot.js';
import { concurrencyManager } from './concurrency_manager.js';
import { progressiveDataSaver, MemoryOptimizer, DataQualityMonitor, DataPersistence } from './progressive_saving.js';
import { getEnhancedProxyConfiguration } from './proxy_manager.js';
import { HMUrlBuilder, FilterOptions } from './url_builder.js';
import { Labels, COUNTRIES } from './constants.js';

interface EnhancedInputSchema {
    // URL-based options
    startUrls?: string[];
    searchQueries?: string[];
    categories?: string[];
    
    // Market selection
    country?: string;
    
    // Filters
    filters?: FilterOptions;
    
    // Scraping options
    maxProducts?: number;
    maxPages?: number;
    sortBy?: 'stock' | 'newProduct' | 'ascPrice' | 'descPrice';
    includeVariants?: boolean;
    extractProductDetails?: boolean;
    outputFields?: string[];
    
    // Technical options
    proxyConfiguration?: any;
    maxConcurrency?: number;
    requestTimeout?: number;
    retryAttempts?: number;
    enableAntiBot?: boolean;
    enableSmartExtraction?: boolean;
    enableProgressiveSaving?: boolean;
    debug?: boolean;
}

// Get input
const input = await Actor.getInput<EnhancedInputSchema>() || {};

// Set defaults
const {
    startUrls = [],
    searchQueries = [],
    categories = [],
    country = 'en_us',
    filters = {},
    maxProducts = 100,
    maxPages = 0,
    sortBy = 'stock',
    includeVariants = true,
    extractProductDetails = false,
    outputFields = [],
    maxConcurrency = 5,
    requestTimeout = 60,
    retryAttempts = 3,
    enableAntiBot = true,
    enableSmartExtraction = true,
    enableProgressiveSaving = true,
    debug = false,
} = input;

// Configure logging
log.setLevel(debug ? LogLevel.DEBUG : LogLevel.INFO);

log.info('Starting H&M Enhanced Scraper', {
    country,
    maxProducts,
    filtersApplied: Object.keys(filters).length,
    urlCount: startUrls.length,
    categoryCount: categories.length,
    searchCount: searchQueries.length,
});

// Find country configuration
const countryConfig = COUNTRIES.find(c => c.code === country) || COUNTRIES[0];
log.info(`Using country: ${countryConfig.name} (${countryConfig.code})`);

// Generate start URLs
const urls: Request[] = [];

// 1. Add direct URLs
for (const url of startUrls) {
    urls.push(new Request({
        url,
        userData: {
            label: Labels.SUB_CATEGORY,
            country: countryConfig,
            extractProductDetails,
            maxProducts,
        },
    }));
}

// 2. Generate category URLs
const baseUrl = `https://www2.hm.com/${countryConfig.code}`;
for (const category of categories) {
    const categoryPath = category.startsWith('/') ? category : `/${category}`;
    const url = `${baseUrl}${categoryPath}.html`;
    
    const urlBuilder = new HMUrlBuilder(url)
        .applyFilters(filters)
        .applySort({ sort: sortBy });
    
    urls.push(new Request({
        url: urlBuilder.build(),
        userData: {
            label: Labels.SUB_CATEGORY,
            country: countryConfig,
            extractProductDetails,
            maxProducts,
            category,
        },
    }));
}

// 3. Generate search URLs
for (const query of searchQueries) {
    const searchUrl = `${baseUrl}/search-results/_jcr_content/search.display.json?q=${encodeURIComponent(query)}`;
    
    urls.push(new Request({
        url: searchUrl,
        userData: {
            label: Labels.SEARCH_RESULTS,
            country: countryConfig,
            query,
            extractProductDetails,
            maxProducts,
        },
    }));
}

// If no URLs provided, use default
if (urls.length === 0) {
    urls.push(...getStartUrls(false, countryConfig.code));
}

log.info(`Generated ${urls.length} start URLs`);

// Initialize progressive saving
if (enableProgressiveSaving) {
    progressiveDataSaver.config = {
        ...progressiveDataSaver.config,
        batchSize: 50,
        minQualityScore: 70,
    };
    log.info('Progressive data saving enabled');
}

// Initialize memory optimization
MemoryOptimizer.startMonitoring();

// Configure proxy
let proxyConfiguration;
if (input.proxyConfiguration) {
    try {
        // Always use standard Apify proxy configuration for compatibility
        proxyConfiguration = await Actor.createProxyConfiguration(input.proxyConfiguration);
        log.info('Proxy configuration loaded');
        
        // If anti-bot is enabled, we can use enhanced proxy logic separately
        if (enableAntiBot) {
            // Enhanced proxy logic can be handled within the anti-bot config
            log.info('Anti-bot mode enabled with proxy configuration');
        }
    } catch (error: any) {
        log.warning('Proxy configuration failed:', error);
    }
}

// Configure concurrency
// concurrencyManager.updateProfile({
//     maxConcurrency,
//     desiredConcurrency: Math.min(maxConcurrency, 5),
//     minConcurrency: 1,
// });
// Note: updateProfile method doesn't exist, use setConcurrency instead
concurrencyManager.setConcurrency(Math.min(maxConcurrency, 5));

// Configure crawler
const crawlerConfig = enableAntiBot ? 
    getAntiBotCrawlerConfig({
        proxyConfiguration,
        requestHandler: router,
        maxRequestsPerCrawl: maxProducts ? Math.max(maxProducts * 10, 1000) : undefined,
        maxRequestRetries: retryAttempts,
        requestHandlerTimeoutSecs: requestTimeout,
        // Note: removed requestTimeoutSecs as it doesn't exist in CheerioCrawlerOptions
    }) : {
        proxyConfiguration,
        requestHandler: router,
        maxConcurrency,
        maxRequestsPerCrawl: maxProducts ? Math.max(maxProducts * 10, 1000) : undefined,
        maxRequestRetries: retryAttempts,
        requestHandlerTimeoutSecs: requestTimeout,
    };

const crawler = new CheerioCrawler(crawlerConfig);

// Set statistics limit
actorStatistics.setLimit(maxProducts || undefined);

// Handle timeout
if (input.proxyConfiguration?.maxSessionRotations) {
    const maxRuntime = input.proxyConfiguration.maxSessionRotations * 60; // Convert to seconds
    setTimeout(async () => {
        log.info('Max runtime reached, initiating graceful shutdown...');
        await crawler.autoscaledPool?.abort();
        await Actor.exit();
    }, maxRuntime * 1000);
}

// Start crawling
try {
    log.info('Starting crawl...');
    await crawler.run(urls);
    
    // Final save
    if (enableProgressiveSaving) {
        await progressiveDataSaver.forceSave();
    }
    
    log.info('Crawl completed successfully');
} catch (error: any) {
    log.error('Crawl failed:', error);
    
    // Save any remaining data
    if (enableProgressiveSaving) {
        await progressiveDataSaver.forceSave();
    }
    
    throw error;
} finally {
    // Log statistics
    actorStatistics.logStatistics();
    DataQualityMonitor.logQualityReport();
    
    // Cleanup
    await progressiveDataSaver.cleanup();
    await DataPersistence.saveState({
        finalStats: {
            totalSaved: actorStatistics.getSavedCount(),
            qualityMetrics: DataQualityMonitor.getMetrics(),
        },
    });
}

await Actor.exit();