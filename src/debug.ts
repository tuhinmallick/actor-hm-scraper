import { Request } from 'crawlee';
import { BASE_URL, COUNTRIES, Labels } from './constants.js';

export const getMockStartUrls = (): Request[] => {
    const country = COUNTRIES[0];

    const subCategoryRequest = new Request({
        url: `${BASE_URL}/en_gb/men/shop-by-product/suits-blazers/blazers.html`,
        userData: {
            label: Labels.SUB_CATEGORY_COUNT,
            divisionName: 'Men from path',
            categoryName: 'Make-up',
            subCategoryName: 'Augen',
            country,
        },
    });

    const productRequests = [
        new Request({
            url: `https://www2.hm.com/en_gb/productpage.1023045002.html`,
            userData: {
                label: Labels.PRODUCT,
                divisionName: 'Division from path',
                categoryName: 'Category from path',
                subCategoryName: 'Sub from path',
                country,
            },
        }),
        new Request({
            url: `https://www2.hm.com/en_gb/productpage.1023045003.html`,
            userData: {
                label: Labels.PRODUCT,
                divisionName: 'Division from path',
                categoryName: 'Category from path',
                subCategoryName: 'Sub from path',
                country,
            },
        }),
        new Request({
            url: `https://www2.hm.com/en_gb/productpage.1023045002.html`,
            userData: {
                label: Labels.PRODUCT,
                divisionName: 'Division from path',
                categoryName: 'Category from path',
                subCategoryName: 'Sub from path',
                country,
            },
            uniqueKey: 'unique',
        }),
    ];

    return [
        subCategoryRequest,
        ...productRequests,
    ];
};
