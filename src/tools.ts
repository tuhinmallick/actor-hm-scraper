import { Request } from 'crawlee';
import { BASE_URL, COUNTRIES, Labels } from './constants.js';
import { getMockStartUrls } from './debug.js';

export const getStartUrls = (useMockStartRequests: boolean | undefined, inputCountry: string | undefined): Request[] => {
    if (useMockStartRequests) return getMockStartUrls();

    return getProductionStartUrls(inputCountry);
};

export const getProductionStartUrls = (inputCountry:string | undefined): Request[] => {
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
