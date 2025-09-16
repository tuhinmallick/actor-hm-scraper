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
import { SmartDataExtractor } from './smart_extractor.js';
import { HMUrlBuilder } from './url_builder.js';
import { DataSanitizer } from './data_sanitizer.js';

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
router.addHandler(Labels.SUB_CATEGORY_COUNT, async ({ log, request, $, body, crawler }) => {
    const { divisionName, categoryName, country, label } = request.userData;
    log.info(`${label}: country: ${country.name} - ${request.loadedUrl}`);

    let productCount = DEFAULT_NUMBER_OF_PRODUCTS;
    
    // Try to extract product count from Next.js data first
    try {
        const scriptMatch = (body as string).match(/<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/s);
        
        if (scriptMatch) {
            const jsonData = JSON.parse(scriptMatch[1]);
            const totalHits = jsonData?.props?.pageProps?.plpProps?.productListingProps?.totalHits;
            
            if (totalHits && typeof totalHits === 'number') {
                productCount = totalHits;
                log.info(`Found ${productCount} total products from Next.js data`);
            } else {
                // Fallback to HTML selector
                const productCountText = getProductCount($);
                const productCountString = $(productCountText).text().trim().match(/\d+/g)
                    ?.join('');

                if (productCountString) {
                    productCount = parseInt(productCountString, 10);
                } else {
                    log.info('Number of products not found. Using default value.');
                }
            }
        } else {
            // Fallback to HTML selector
            const productCountText = getProductCount($);
            const productCountString = $(productCountText).text().trim().match(/\d+/g)
                ?.join('');

            if (productCountString) {
                productCount = parseInt(productCountString, 10);
            } else {
                log.info('Number of products not found. Using default value.');
            }
        }
    } catch (error: any) {
        log.error('Error extracting product count:', error);
        // Use default value
    }

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
router.addHandler(Labels.SUB_CATEGORY, async ({ log, request, $, body, crawler, enqueueLinks }) => {
    const { divisionName, categoryName, country, label } = request.userData;
    log.info(`${label}: country: ${country.name} - ${request.loadedUrl}`);
    
    try {
        // Use smart extractor
        const extractedData = SmartDataExtractor.extract(body as string, $);
        
        if (extractedData && extractedData.products.length > 0) {
            log.info(`Smart extractor found ${extractedData.products.length} products (total: ${extractedData.totalProducts})`);
            
            // Check if we should extract detailed product info
            const extractDetails = request.userData.extractProductDetails || false;
            
            if (extractDetails) {
                // Enqueue product URLs for detailed extraction
                const requests = [];
                for (const product of extractedData.products) {
                    if (product.pdpUrl) {
                        const productUrl = product.pdpUrl.startsWith('http') 
                            ? product.pdpUrl 
                            : new URL(product.pdpUrl, BASE_URL).toString();
                        
                        const baseProductId = getBaseProductId(productUrl);
                        
                        requests.push({
                            url: productUrl,
                            uniqueKey: `productpage_${baseProductId}_${country.code}`,
                            userData: {
                                label: Labels.PRODUCT,
                                divisionName,
                                categoryName,
                                country,
                                productData: product, // Pass product data to save network requests
                            },
                        });
                    }
                }
                
                await crawler.addRequests(requests);
                log.info(`Enqueued ${requests.length} product URLs for detailed extraction`);
            } else {
                // Save products directly without visiting product pages
                let savedCount = 0;
                for (const product of extractedData.products) {
                    // Check limit
                    if (actorStatistics.hasReachedLimit()) {
                        log.info('Product limit reached. Stopping extraction.');
                        break;
                    }
                    
                    const uniqueProductKey = `${product.articleCode}_${country.code}`;
                    
                    // Skip if already scraped
                    if (scrapedProducts[uniqueProductKey]) continue;
                    scrapedProducts[uniqueProductKey] = true;
                    
                    const timestamp = new Date().toISOString();
                    
                    const rawProduct = {
                        company: COMPANY,
                        country: country.name,
                        productName: DataSanitizer.sanitizeString(product.title),
                        articleNo: DataSanitizer.sanitizeProductId(product.articleCode),
                        division: DataSanitizer.sanitizeString(divisionName),
                        category: DataSanitizer.sanitizeString(categoryName),
                        subCategory: DataSanitizer.sanitizeString(product.category),
                        listPrice: DataSanitizer.sanitizeNumber(product.regularPrice),
                        salePrice: product.redPrice ? DataSanitizer.sanitizeNumber(product.redPrice) : null,
                        currency: DataSanitizer.sanitizeCurrency(country.currency),
                        description: '',
                        url: DataSanitizer.sanitizeUrl(product.pdpUrl),
                        imageUrl: DataSanitizer.sanitizeUrl(product.imageUrl),
                        timestamp,
                        colors: product.colors,
                        sizes: product.sizes,
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
                }
                
                log.info(`Saved ${savedCount} products directly from listing page`);
            }
            
            // Handle pagination
            if (extractedData.totalProducts > extractedData.products.length) {
                const currentOffset = parseInt(new URL(request.loadedUrl as string).searchParams.get('offset') || '0');
                const pageSize = parseInt(new URL(request.loadedUrl as string).searchParams.get('page-size') || '36');
                const maxOffset = Math.min(extractedData.totalProducts, request.userData.maxProducts || extractedData.totalProducts);
                
                if (currentOffset + pageSize < maxOffset) {
                    // Enqueue next page
                    const urlBuilder = new HMUrlBuilder(request.loadedUrl as string);
                    const nextPageUrl = urlBuilder.applyPagination({ 
                        offset: currentOffset + pageSize, 
                        pageSize 
                    }).build();
                    
                    await crawler.addRequests([{
                        url: nextPageUrl,
                        userData: request.userData,
                    }]);
                    
                    log.info(`Enqueued next page: offset ${currentOffset + pageSize}`);
                }
            }
        } else {
            log.warning('Smart extractor found no products');
                
                // Fallback to traditional selector-based approach
                await enqueueLinks({
                    selector: '.product-item article .item-heading a',
                    userData: {
                        label: Labels.PRODUCT,
                        divisionName,
                        categoryName,
                        country,
                    },
                    transformRequestFunction: (requestToEnqueue: any) => {
                        const baseProductId = getBaseProductId(requestToEnqueue.url);
                        requestToEnqueue.uniqueKey = `productpage_${baseProductId}_${country.code}`;
                        return requestToEnqueue;
                    },
                });
            }
    } catch (error: any) {
        log.error('Error parsing Next.js data:', error);
        
        // Fallback to traditional selector-based approach
        await enqueueLinks({
            selector: '.product-item article .item-heading a',
            userData: {
                label: Labels.PRODUCT,
                divisionName,
                categoryName,
                country,
            },
            transformRequestFunction: (requestToEnqueue) => {
                const baseProductId = getBaseProductId(requestToEnqueue.url);
                requestToEnqueue.uniqueKey = `productpage_${baseProductId}_${country.code}`;
                return requestToEnqueue;
            },
        });
    }
});

/**
 * Handle direct product URLs - extract product data directly without navigation
 */
router.addHandler('PRODUCT_URL', async ({ log, request, $, body }) => {
    const { country, label } = request.userData;
    log.info(`${label}: Extracting product from URL - ${request.loadedUrl}`);
    
    try {
        // Check for blocking
        const isBlocked = await detectAndHandleBlocking({ $, response: request });
        if (isBlocked) {
            log.warning('Blocking detected on product page');
            return;
        }
        
        // Use smart extractor to get product data
        const extractedData = SmartDataExtractor.extract(body as string, $);
        
        if (extractedData && extractedData.products.length > 0) {
            const product = extractedData.products[0];
            
            // Extract additional details from product page
            const productObject = await retryWithBackoff(
                async () => getProductInfoObject(body as string),
                {
                    maxRetries: 2,
                    baseDelay: 1000,
                    maxDelay: 30000,
                    backoffMultiplier: 2,
                    retryableErrors: ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND'],
                },
                'product object extraction',
            );
            
            const timestamp = new Date().toISOString();
            
            // Build comprehensive product data
            const rawProduct = {
                company: COMPANY,
                country: country.name,
                productName: DataSanitizer.sanitizeString(product.title),
                articleNo: DataSanitizer.sanitizeProductId(product.articleCode),
                division: DataSanitizer.sanitizeString(product.category),
                category: DataSanitizer.sanitizeString(product.category),
                subCategory: DataSanitizer.sanitizeString(product.subCategory || product.category),
                listPrice: DataSanitizer.sanitizeNumber(product.regularPrice),
                salePrice: product.redPrice ? DataSanitizer.sanitizeNumber(product.redPrice) : null,
                currency: DataSanitizer.sanitizeCurrency(country.currency),
                description: DataSanitizer.sanitizeString($('.product-description').text() || ''),
                url: DataSanitizer.sanitizeUrl(request.loadedUrl as string),
                imageUrl: DataSanitizer.sanitizeUrl(product.imageUrl),
                timestamp,
                colors: product.colors,
                sizes: product.sizes,
                materials: DataSanitizer.sanitizeStringArray($('.product-details-material').text().split(',')),
                inStock: DataSanitizer.sanitizeBoolean(product.inStock !== false),
                sustainable: DataSanitizer.sanitizeBoolean($('.sustainable-style').length > 0),
            };
            
            // Sanitize the entire product
            const sanitizedProduct = DataSanitizer.sanitizeProduct(rawProduct);
            
            // Validate and save
            const cleanedProduct = cleanAndValidateProduct(sanitizedProduct);
            if (cleanedProduct) {
                const qualityScore = calculateProductQualityScore(cleanedProduct);
                DataQualityMonitor.recordProduct(cleanedProduct, true, qualityScore);
                
                const saved = await progressiveDataSaver.addProduct(cleanedProduct);
                if (saved) {
                    actorStatistics.incrementCounter(1);
                    log.info(`Saved product from direct URL: ${cleanedProduct.productName} (${cleanedProduct.articleNo})`);
                }
            } else {
                log.warning('Product validation failed for direct URL');
            }
        } else {
            log.warning('Could not extract product data from URL');
        }
    } catch (error: any) {
        log.error(`Error processing product URL ${request.loadedUrl}:`, error);
    }
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
                retryableErrors: ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND'],
            },
            'product info extraction',
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
                retryableErrors: ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND'],
            },
            'product object extraction',
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
