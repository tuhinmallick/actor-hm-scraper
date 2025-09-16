import { Request } from 'crawlee';
import { BASE_URL, COUNTRIES, Labels } from './constants.js';
import { getMockStartUrls } from './debug.js';
export const getStartUrls = (useMockStartRequests, inputCountry) => {
    if (useMockStartRequests)
        return getMockStartUrls();
    return getProductionStartUrls(inputCountry);
};
export const getProductionStartUrls = (inputCountry) => {
    const inputCountryDetails = COUNTRIES.filter((countryDetails) => countryDetails.name === inputCountry);
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
export const getMainImageFromMiniature = (imageUrl) => {
    const fullImage = imageUrl.replace('miniature', 'main');
    return `https:${fullImage}`;
};
export const getBaseProductId = (productUrl) => {
    const productId = productUrl.split('productpage.')[1].split('.html')[0];
    return productId.slice(0, productId.length - 3);
};
//# sourceMappingURL=tools.js.map