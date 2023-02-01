import { createCheerioRouter, Request } from 'crawlee';
import { Actor } from 'apify';
import {
    BASE_URL,
    COMPANY,
    DEFAULT_NUMBER_OF_PRODUCTS,
    Labels,
    MAX_PRODUCTS_PER_PAGE,
    SCRAPED_PRODUCTS_KEY,
    STATE_KEY,
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

export const router = createCheerioRouter();

const stateStore = await Actor.openKeyValueStore(STATE_KEY);

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
 * Saves product details to dataset.
 * Enqueues other combinations of this product
 */
router.addHandler(Labels.PRODUCT, async ({ log, request, $, body }) => {
    const { divisionName, categoryName, country, label } = request.userData;
    log.info(`${label}: country: ${country.name} - ${request.loadedUrl}`);

    const timestamp = new Date().toISOString()

    const {
        productName,
        division: breadcrumbDivision,
        category: breadcrumbCategory,
        subCategory: breadcrumbSubCategory,
    } = getProductInfo($, body as string);

    // Prefer getting categorization data from breadcrumb
    // If breadcrumb is incomplete, get data from path, the product was found
    // Subcategory from inherits the category name, because products with incomplete breadcrumb usually are not assigned to subcategory
    const division = breadcrumbDivision ?? divisionName;
    const category = breadcrumbCategory ?? categoryName;
    const subCategory = breadcrumbSubCategory ?? categoryName;

    const productObject = getProductInfoObject(body as string);
    const combinationInfo = getCombinationsInfoFromProductObject(productObject);
    const combinationImages = getAllCombinationImages($);

    const products = combinationInfo.map((combination) => {
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
        if (scrapedProducts[uniqueProductKey]) return null;
        scrapedProducts[uniqueProductKey] = true;

        // Try to get image from miniature if possible
        const imageUrl = combinationImages[articleNo] ? getMainImageFromMiniature(combinationImages[articleNo]) : combinationImageUrl;

        return {
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
    });

    await Actor.pushData(products);
    actorStatistics.incrementCounter(products.length);
});
