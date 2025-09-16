import { Request } from 'crawlee';
import { BASE_URL, Labels } from './constants.js';
export const getCategoriesFromNavigation = (response, country) => {
    const linksToKeep = ['ladies', 'men', 'baby', 'kids', 'home', 'beauty'];
    return response
        .siteStructure.filter((link) => linksToKeep.includes(link.trackingLabel))
        .flatMap((division) => {
        return handleDivisionNavigation(division, country);
    });
};
const handleDivisionNavigation = (division, country) => {
    const divisionName = division.title;
    const shopByProduct = division.children.filter((category) => category.trackingLabel === 'shop-by-product')[0];
    if (!shopByProduct)
        return [];
    const categoriesToSkip = ['view-all', 'last-chance', 'the-bestsellers'];
    return shopByProduct.children
        .filter((category) => !categoriesToSkip.includes(category.trackingLabel))
        .flatMap((category) => handleCategoryNavigation(category, divisionName, country));
};
const handleCategoryNavigation = (category, divisionName, country) => {
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
export const getCategoryLinks = ($) => $('aside [data-tracking-label=\'shop-by-product\'] + ul a');
export const getSubCategoryLinks = ($) => $('aside .link.current + ul a');
export const getProductCount = ($) => $('.filter-pagination');
export const getProductInfo = ($, body) => {
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
            miniatureImage: $('.product-colors .active img').attr('src'),
            division,
            category,
            subCategory,
        };
    }
    catch (error) {
        throw new Error('Product object could not be parsed');
    }
};
export const getCombinationsInfoFromProductObject = (productObject) => {
    const combinationInfo = [];
    for (const [key, product] of Object.entries(productObject)) {
        // Filter only product combinations
        if (!product.description)
            continue;
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
export const getAllCombinationImages = ($) => {
    const images = {};
    const combinationLinks = $('.product-colors a');
    combinationLinks.each((_id, el) => {
        const element = $(el);
        const id = element.data('articlecode');
        const imageUrl = element.find('img').attr('src');
        if (id && imageUrl)
            images[id] = imageUrl;
    });
    return images;
};
export const getProductInfoObject = (body) => {
    const splitByStart = body.split('var productArticleDetails = ');
    if (splitByStart.length !== 2)
        throw new Error('Could not find the JS object with product data');
    const splitByEnd = splitByStart[1].split('</script>');
    if (splitByEnd.length < 2)
        throw new Error('Could not find the JS object with product data');
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
//# sourceMappingURL=extractors.js.map