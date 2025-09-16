import { createCheerioRouter, Request } from 'crawlee';
import { Actor } from 'apify';
import {
    BASE_URL,
    COMPANY,
    DEFAULT_NUMBER_OF_PRODUCTS,
    Labels,
    MAX_PRODUCTS_PER_PAGE,
    SCRAPED_PRODUCTS_KEY,
} from './constants.js';
import {
    getAllCombinationImages,
    getCombinationsInfoFromProductObject,
    getProductCount,
    getProductInfo,
    getProductInfoObject,
    getCategoriesFromNavigation,
} from './extractors.js';
import { getBaseProductId, getMainImageFromMiniature } from './tools.js';
import actorStatistics from './actor_statistics.js';
import { progressiveDataSaver, DataQualityMonitor } from './progressive_saving.js';
import { cleanAndValidateProduct, calculateProductQualityScore } from './data_validation.js';
import { retryWithBackoff, classifyError } from './error_handling.js';
import { smartScheduler, detectAndHandleBlocking } from './anti_bot.js';

export const router = createCheerioRouter();

const defaultStore = await Actor.openKeyValueStore();
const scrapedProducts = await defaultStore.getAutoSavedValue<Record<string, boolean>>(
    SCRAPED_PRODUCTS_KEY,
    {},
);

/**
 * First route for each country.
 * Enqueues category requests
 */
router.addHandler(Labels.NAVIGATION, async ({ request, json, log, crawler }) => {
    const { label, country } = request.userData;
    log.info(`${label}: Enqueueing divisions, country: ${country.name} - ${request.loadedUrl}`);

    const requests = getCategoriesFromNavigation(json, country);
    await crawler.addRequests(requests);
});

/**
 * Subcategory page.
 * Route parses number of products in category and enqueues category requests with paginationK
 * It is also run for the category page as some products do not have assigned category on all levels.
 */
router.addHandler(Labels.SUB_CATEGORY_COUNT, async ({ log, request, $, crawler }) => {
    const { divisionName, categoryName, country, label } = request.userData;
    log.info(`${label}: country: ${country.name} - ${request.loadedUrl}`);

    const productCountText = getProductCount($);
    const productCountString = $(productCountText).text().trim().match(/\d+/g)
        ?.join('');

    if (!productCountString) {
        log.info('Number of products not found. Using default value.');
    }

    const productCount = productCountString ?? DEFAULT_NUMBER_OF_PRODUCTS;

    // Enqueue subcategory requests with pagination
    const requests = [];
    for (let offset = 0; offset < productCount; offset += MAX_PRODUCTS_PER_PAGE) {
        const url = new URL(request.loadedUrl as string);
        url.searchParams.set('offset', offset.toString());
        url.searchParams.set('page-size', MAX_PRODUCTS_PER_PAGE.toString());

        const newRequest = new Request({
            url: url.toString(),
            userData: {
                label: Labels.SUB_CATEGORY,
                divisionName,
                categoryName,
                country,
            },
        });

        requests.push(newRequest);
    }

    await crawler.addRequests(requests);
    log.info(`${label}: productCount: ${productCount} - ${request.loadedUrl}`);
});

/**
 * Subcategory page.
 * Enqueues all the products from given subcategory.
 */
router.addHandler(Labels.SUB_CATEGORY, async ({ log, request, enqueueLinks }) => {
    const { divisionName, categoryName, country, label } = request.userData;
    log.info(`${label}: country: ${country.name} - ${request.loadedUrl}`);
    await enqueueLinks({
        selector: '.product-item article .item-heading a',
        userData: {
            label: Labels.PRODUCT,
            divisionName,
            categoryName,
            country,
        },
        transformRequestFunction: (requestToEnqueue) => {
            // Last two digits of product id are given by it's color
            // Removing this parameter, so we do not enqueue product combination twice
            const baseProductId = getBaseProductId(requestToEnqueue.url);
            requestToEnqueue.uniqueKey = `productpage_${baseProductId}_${country.code}`;
            return requestToEnqueue;
        },
    });
});

/**
 * Product detail page.
 * Saves product details to dataset with progressive saving and quality monitoring.
 * Enqueues other combinations of this product
 */
router.addHandler(Labels.PRODUCT, async ({ log, request, $, body, crawler }) => {
    const { divisionName, categoryName, country, label } = request.userData;
    log.info(`${label}: country: ${country.name} - ${request.loadedUrl}`);

    try {
        // Check for blocking before processing
        const isBlocked = await detectAndHandleBlocking({ $, response: request });
        if (isBlocked) {
            log.warning('Blocking detected, skipping product page');
            return;
        }

        // Schedule request with smart rate limiting
        await smartScheduler.scheduleRequest();

        const timestamp = new Date().toISOString();

        // Enhanced product info extraction with error handling
        const productInfo = await retryWithBackoff(
            async () => getProductInfo($, body as string),
            { 
                maxRetries: 2, 
                baseDelay: 1000,
                maxDelay: 30000,
                backoffMultiplier: 2,
                retryableErrors: ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND']
            },
            'product info extraction'
        );

        const {
            productName,
            division: breadcrumbDivision,
            category: breadcrumbCategory,
            subCategory: breadcrumbSubCategory,
        } = productInfo as any;

        // Prefer getting categorization data from breadcrumb
        // If breadcrumb is incomplete, get data from path, the product was found
        // Subcategory from inherits the category name, because products with incomplete breadcrumb usually are not assigned to subcategory
        const division = breadcrumbDivision ?? divisionName;
        const category = breadcrumbCategory ?? categoryName;
        const subCategory = breadcrumbSubCategory ?? categoryName;

        // Enhanced product object extraction with retry
        const productObject = await retryWithBackoff(
            async () => getProductInfoObject(body as string),
            { 
                maxRetries: 2, 
                baseDelay: 1000,
                maxDelay: 30000,
                backoffMultiplier: 2,
                retryableErrors: ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND']
            },
            'product object extraction'
        );

        const combinationInfo = getCombinationsInfoFromProductObject(productObject as any);
        const combinationImages = getAllCombinationImages($);

        // Check if we've already reached the limit before processing this product
        if (actorStatistics.hasReachedLimit()) {
            log.info('Product limit reached. Skipping remaining products.');
            return;
        }

        const remaining = actorStatistics.remainingToLimit();
        const sliceTo = remaining === null ? combinationInfo.length : remaining;
        
        // Process products with enhanced quality monitoring
        let savedCount = 0;
        for (const combination of combinationInfo.slice(0, sliceTo)) {
            const {
                listPrice,
                salePrice,
                articleNo,
                description,
                urlPath,
                imageUrl: combinationImageUrl,
            } = combination;

            const url = new URL(urlPath, BASE_URL);
            const uniqueProductKey = `${articleNo}_${country.code}`;

            // Some products have duplicates, everything should be scraped only once
            if (scrapedProducts[uniqueProductKey]) continue;
            scrapedProducts[uniqueProductKey] = true;

            // Try to get image from miniature if possible
            const imageUrl = combinationImages[articleNo] ? getMainImageFromMiniature(combinationImages[articleNo]) : combinationImageUrl;

            const rawProduct = {
                company: COMPANY,
                country: country.name,
                productName,
                articleNo: parseInt(combination.articleNo, 10),
                division,
                category,
                subCategory,
                listPrice,
                salePrice,
                currency: country.currency,
                description,
                url: url.toString(),
                imageUrl,
                timestamp,
            };

            // Clean and validate product
            const cleanedProduct = cleanAndValidateProduct(rawProduct);
            if (!cleanedProduct) {
                log.warning('Product validation failed, skipping:', rawProduct);
                DataQualityMonitor.recordProduct(rawProduct as any, false, 0);
                continue;
            }

            // Calculate quality score
            const qualityScore = calculateProductQualityScore(cleanedProduct);
            DataQualityMonitor.recordProduct(cleanedProduct, true, qualityScore);

            // Save product progressively
            const saved = await progressiveDataSaver.addProduct(cleanedProduct);
            if (saved) {
                savedCount++;
                actorStatistics.incrementCounter(1);
                
                log.debug(`Saved product: ${cleanedProduct.productName} (${cleanedProduct.articleNo}) - Quality: ${qualityScore}`);
            }

            // Check limit after each product
            if (actorStatistics.hasReachedLimit()) {
                log.info('Product limit reached during processing.');
                break;
            }
        }

        log.info(`Processed ${savedCount} products from ${request.loadedUrl}`);
        
        // Record success in scheduler for adaptive behavior
        smartScheduler.recordSuccess();

        if (actorStatistics.hasReachedLimit()) {
            log.info('Product limit reached. Aborting crawl.');
            await crawler.autoscaledPool?.abort();
        }

    } catch (error: any) {
        const classifiedError = classifyError(error);
        
        // Record failure in scheduler for adaptive behavior
        smartScheduler.recordFailure();
        
        log.error(`Error processing product page ${request.loadedUrl}:`, {
            error: classifiedError.message,
            type: classifiedError.type,
            severity: classifiedError.severity,
        });

        // Handle different error types
        switch (classifiedError.type) {
            case 'PARSING':
                log.warning('Parsing error, skipping this product page');
                break;
            case 'NETWORK':
                log.warning('Network error, will retry this page');
                throw error; // Let crawler retry
            case 'BLOCKING':
                log.error('Blocking detected, implementing countermeasures');
                smartScheduler.recordFailure(); // Record additional failure for blocking
                throw error; // Let crawler retry with countermeasures
            default:
                log.warning('Unknown error, skipping this product page');
        }
    }
});
