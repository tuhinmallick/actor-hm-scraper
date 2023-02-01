import { CheerioRoot, Request } from 'crawlee';
import { BASE_URL, CountryInformation, Labels } from './constants.js';

interface CategoryResponse {
    trackingLabel: string,
    path: string,
    aliasPath: string,
    title: string,
    children: CategoryResponse[]
}

interface SiteNavigationResponse {
    siteStructure: CategoryResponse[]
}

export const getCategoriesFromNavigation = (response: SiteNavigationResponse, country: CountryInformation): Request[] => {
    const linksToKeep = ['ladies', 'men', 'baby', 'kids', 'home', 'beauty'];
    return response
        .siteStructure.filter((link) => linksToKeep.includes(link.trackingLabel))
        .flatMap((division) => {
            return handleDivisionNavigation(division, country);
        });
};

const handleDivisionNavigation = (division: CategoryResponse, country: CountryInformation): Request[] => {
    const divisionName = division.title;
    const shopByProduct = division.children.filter((category) => category.trackingLabel === 'shop-by-product')[0];
    if (!shopByProduct) return [];

    const categoriesToSkip = ['view-all', 'last-chance', 'the-bestsellers'];
    return shopByProduct.children
        .filter((category) => !categoriesToSkip.includes(category.trackingLabel))
        .flatMap((category) => handleCategoryNavigation(category, divisionName, country));
};

const handleCategoryNavigation = (category: CategoryResponse, divisionName: string, country: CountryInformation): Request[] => {
    const categoryName = category.title;
    const subcategoryRequests = category.children.map((subcategory) => {
        const url = new URL(subcategory.aliasPath, BASE_URL);
        return new Request({
            url: url.toString(),
            userData: {
                label: Labels.SUB_CATEGORY_COUNT,
                divisionName,
                categoryName,
                country,
            },
        });
    });

    const categoryUrl = new URL(category.aliasPath, BASE_URL);
    const categoryRequest = new Request({
        url: categoryUrl.toString(),
        userData: {
            label: Labels.SUB_CATEGORY_COUNT,
            divisionName,
            categoryName,
            country,
        },
    });

    return [
        ...subcategoryRequests,
        categoryRequest,
    ];
};

export const getCategoryLinks = ($: CheerioRoot) => $('aside [data-tracking-label=\'shop-by-product\'] + ul a');

export const getSubCategoryLinks = ($: CheerioRoot) => $('aside .link.current + ul a');

export const getProductCount = ($: CheerioRoot) => $('.filter-pagination');

export const getProductInfo = ($: CheerioRoot, body: string) => {
    // Correct breadcrumb has structure: HM.com/MainCategory/Category/SubCategory/Product
    // Some breadcrumbs are incomplete and only have product name
    const breadcrumbParts = $('.breadcrumbs-placeholder li');
    const correctBreadcrumb = breadcrumbParts.length >= 5;

    const division = correctBreadcrumb
        ? breadcrumbParts.eq(1).text().trim()
        : null;
    const category = correctBreadcrumb
        ? breadcrumbParts.eq(2).text().trim()
        : null;
    const subCategory = correctBreadcrumb
        ? breadcrumbParts.eq(breadcrumbParts.length - 2).text().trim()
        : null;

    try {
        return {
            productName: $('.product-name-price h1').text().trim(),
            listPrice: body.split('regularPrice:"')[1].split('"')[0],
            salePrice: body.split('redPrice:"')[1].split('"')[0],
            articleNo: body.split('\'articleCode\':\'')[1].split('\'')[0],
            description: body.split('const description = \'')[1].split('\'')[0],
            miniatureImage: $('.product-colors .active img').attr('src') as string,
            division,
            category,
            subCategory,
        };
    } catch (error) {
        throw new Error('Product object could not be parsed');
    }
};

interface CombinationInfo {
    listPrice: number,
    salePrice: number | null,
    articleNo: string,
    description: string,
    urlPath: string,
    imageUrl?: string,
}

export const getCombinationsInfoFromProductObject = (productObject: object): CombinationInfo[] => {
    const combinationInfo = [];

    for (const [key, product] of Object.entries(productObject)) {
        // Filter only product combinations
        if (!product.description) continue;

        combinationInfo.push({
            listPrice: parseFloat(product.whitePriceValue),
            salePrice: product.redPriceValue ? parseFloat(product.redPriceValue) : null,
            articleNo: key,
            description: product.description,
            urlPath: product.url,
            imageUrl: product.images[0]?.thumbnail,
        });
    }

    return combinationInfo;
};

export const getAllCombinationImages = ($: CheerioRoot) => {
    const images: Record<string, string> = {};
    const combinationLinks = $('.product-colors a');
    combinationLinks.each((_id, el) => {
        const element = $(el);

        const id = element.data('articlecode') as string;
        const imageUrl = element.find('img').attr('src');

        if (id && imageUrl) images[id] = imageUrl;
    });

    return images;
};

export const getProductInfoObject = (body: string) => {
    const splitByStart = body.split('var productArticleDetails = ');
    if (splitByStart.length !== 2) throw new Error('Could not find the JS object with product data');

    const splitByEnd = splitByStart[1].split('</script>');
    if (splitByEnd.length < 2) throw new Error('Could not find the JS object with product data');

    const objectString = `${splitByEnd[0]}`;
    const objectStringFixed = objectString
        .replace(/: '(.*)"(.*)'/g, ': "replaced"') // Remove texts with " inside, very uncommon for this site, only in unnecessary data
        .replace(/'/g, '"') // Replace ' with ", so it is valid JSON
        .replace(/:(.*)isDesktop(.*)",/g, ': "replaced",') // Remove ternary expression, unnecessary data
        .replace(/:(.*)isDesktop(.*)"/g, ': "replaced"') // Remove ternary expression, unnecessary data
        .replace(/,(?!\s*?[{["'\w])/g, '') // Remove trailing commas
        .replace('};', '}');

    return JSON.parse(objectStringFixed);
};
