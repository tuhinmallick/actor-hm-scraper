import { CheerioRoot, Request } from 'crawlee';
import { CountryInformation } from './constants.js';
interface CategoryResponse {
    trackingLabel: string;
    path: string;
    aliasPath: string;
    title: string;
    children: CategoryResponse[];
}
interface SiteNavigationResponse {
    siteStructure: CategoryResponse[];
}
export declare const getCategoriesFromNavigation: (response: SiteNavigationResponse, country: CountryInformation) => Request[];
export declare const getCategoryLinks: ($: CheerioRoot) => import("cheerio").Cheerio<import("domhandler").Element>;
export declare const getSubCategoryLinks: ($: CheerioRoot) => import("cheerio").Cheerio<import("domhandler").Element>;
export declare const getProductCount: ($: CheerioRoot) => import("cheerio").Cheerio<import("domhandler").Element>;
export declare const getProductInfo: ($: CheerioRoot, body: string) => {
    productName: string;
    listPrice: string;
    salePrice: string;
    articleNo: string;
    description: string;
    miniatureImage: string;
    division: string | null;
    category: string | null;
    subCategory: string | null;
};
interface CombinationInfo {
    listPrice: number;
    salePrice: number | null;
    articleNo: string;
    description: string;
    urlPath: string;
    imageUrl?: string;
}
export declare const getCombinationsInfoFromProductObject: (productObject: object) => CombinationInfo[];
export declare const getAllCombinationImages: ($: CheerioRoot) => Record<string, string>;
export declare const getProductInfoObject: (body: string) => any;
export {};
//# sourceMappingURL=extractors.d.ts.map