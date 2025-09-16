export const BASE_URL = 'https://www2.hm.com';

export const COMPANY = 'HM';
export const DEFAULT_NUMBER_OF_PRODUCTS = 32;
export const MAX_PRODUCTS_PER_PAGE = 128;
export const CONCURRENCY = 30;

export const SCRAPED_PRODUCTS_KEY = 'SCRAPED_PRODUCTS';

export const LOGGING_PERIOD = 120;
export const STATISTICS_KEY = 'STATISTICS';

export interface CountryInformation {
    name: string,
    code: string,
    currency: string,
}
export const COUNTRIES: CountryInformation[] = [
    {
        name: 'UNITED KINGDOM',
        code: 'en_gb',
        currency: 'GBP',
    },
    {
        name: 'USA',
        code: 'en_us',
        currency: 'USD',
    },
    {
        name: 'ITALY',
        code: 'it_it',
        currency: 'EUR',
    },
    {
        name: 'GERMANY',
        code: 'de_de',
        currency: 'EUR',
    },
    {
        name: 'FRANCE',
        code: 'fr_fr',
        currency: 'EUR',
    },
    {
        name: 'AUSTRALIA',
        code: 'en_au',
        currency: 'AUD',
    },
    {
        name: 'SPAIN',
        code: 'es_es',
        currency: 'EUR',
    },
    {
        name: 'CANADA',
        code: 'en_ca',
        currency: 'CAD',
    },
    {
        name: 'MEXICO',
        code: 'es_mx',
        currency: 'MXN',
    },
];

export const Labels = {
    NAVIGATION: 'navigation',
    HOMEPAGE: 'homepage',
    DIVISION: 'division',
    CATEGORY: 'category',
    SUB_CATEGORY_COUNT: 'subCategoryCount',
    SUB_CATEGORY: 'subCategory',
    PRODUCT: 'product',
};
