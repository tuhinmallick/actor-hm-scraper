import type { Request } from '@crawlee/types';
import { Request as CoreRequest } from '@crawlee/core';
import { BASE_URL, COUNTRIES, Labels } from './constants.js';
import { getMockStartUrls } from './debug.js';

/**
 * Returns the initial list of Requests to start the crawl.
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
        return new CoreRequest({
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
