import { Request } from 'crawlee';
import { BASE_URL, COUNTRIES, Labels } from './constants.js';

/**
 * Determine if a URL is a product page
 */
export const isProductUrl = (url: string): boolean => {
    return url.includes('/productpage.') || 
           url.includes('/product/') || 
           url.includes('article=') ||
           /\/\d{7,10}\.html/.test(url); // Pattern like /1234567001.html
};

/**
 * Determine URL type and create appropriate request
 */
export const createRequestFromUrl = (url: string, country: any, userData?: any): Request => {
    const isProduct = isProductUrl(url);
    
    return new Request({
        url,
        userData: {
            label: isProduct ? 'PRODUCT_URL' : Labels.SUB_CATEGORY,
            country,
            ...userData,
        },
    });
};
import { getMockStartUrls } from './debug.js';

/**
 * Returns the initial list of Requests to start the crawl.
 * 
 * Note: These requests are now added using Crawlee v3's crawler.addRequests() method
 * for better performance and batch processing.
 *
 * @param useMockStartRequests - When true, return mock start URLs for local debugging.
 * @param inputCountry - Exact country name from `COUNTRIES` to target in production mode.
 * @returns Array of Crawlee Requests used to seed the crawler.
 */
export const getStartUrls = (useMockStartRequests: boolean | undefined, inputCountry: string | undefined, ...extra: unknown[]): Request[] => {
    if (extra.length > 0) {
        throw new Error(`getStartUrls expected 2 arguments, received ${2 + extra.length}`);
    }
    if (useMockStartRequests) return getMockStartUrls();

    return getProductionStartUrls(inputCountry);
};

/**
 * Returns production start URLs for the given country.
 *
 * @param inputCountry - Exact country name from `COUNTRIES`.
 * @returns Array of Crawlee Requests for navigation data of the selected country.
 */
export const getProductionStartUrls = (inputCountry:string | undefined, ...extra: unknown[]): Request[] => {
    if (extra.length > 0) {
        throw new Error(`getProductionStartUrls expected 1 argument, received ${1 + extra.length}`);
    }
    if (!inputCountry) {
        throw new Error('getProductionStartUrls: inputCountry is required');
    }

    const inputCountryDetails = COUNTRIES.filter((countryDetails) => countryDetails.name === inputCountry);

    if (inputCountryDetails.length === 0) {
        const supportedCountries = COUNTRIES.map((c) => c.name).join(', ');
        throw new Error(`Unsupported country: ${inputCountry}. Supported countries: ${supportedCountries}`);
    }

    return inputCountryDetails.map((country) => {
        return new Request({
            url: `${BASE_URL}/${country.code}/apis/navigation/v1/nav-data.json`,
            userData: {
                label: Labels.NAVIGATION,
                country,
            },
        });
    });
};

export const getMainImageFromMiniature = (imageUrl: string) => {
    const fullImage = imageUrl.replace('miniature', 'main');
    return `https:${fullImage}`;
};

export const getBaseProductId = (productUrl: string) => {
    const productId = productUrl.split('productpage.')[1].split('.html')[0];
    return productId.slice(0, productId.length - 3);
};
