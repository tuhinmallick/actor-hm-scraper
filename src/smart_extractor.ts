import { log } from 'crawlee';

export interface ProductData {
    articleCode: string;
    title: string;
    pdpUrl: string;
    regularPrice: string;
    redPrice?: string;
    category: string;
    imageUrl: string;
    colors?: Array<{ name: string; code: string }>;
    sizes?: Array<{ code: string; name: string }>;
}

export interface ExtractedPageData {
    products: ProductData[];
    totalProducts: number;
    currentPage: number;
    totalPages: number;
    filters: Record<string, any>;
    nextPageUrl?: string;
}

/**
 * Smart extractor with multiple fallback strategies
 */
export class SmartDataExtractor {
    /**
     * Primary extraction method using Next.js __NEXT_DATA__
     */
    static extractFromNextJs(html: string): ExtractedPageData | null {
        try {
            // Try multiple regex patterns for Next.js data
            const patterns = [
                /<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/s,
                /<script id="__NEXT_DATA__"[^>]*>(.+?)<\/script>/s,
                /<script[^>]*type="application\/json"[^>]*id="__NEXT_DATA__"[^>]*>(.+?)<\/script>/s,
            ];

            let jsonData: any = null;
            for (const pattern of patterns) {
                const match = html.match(pattern);
                if (match && match[1]) {
                    try {
                        jsonData = JSON.parse(match[1]);
                        break;
                    } catch (e) {
                        log.debug(`Failed to parse JSON with pattern: ${pattern}`);
                    }
                }
            }

            if (!jsonData) return null;

            // Navigate through possible data structures
            const pathsToTry = [
                ['props', 'pageProps', 'plpProps', 'productListingProps'],
                ['props', 'pageProps', 'productListingProps'],
                ['props', 'pageProps', 'products'],
                ['pageProps', 'plpProps', 'productListingProps'],
            ];

            let productData: any = null;
            for (const path of pathsToTry) {
                let current = jsonData;
                for (const key of path) {
                    if (current && current[key]) {
                        current = current[key];
                    } else {
                        current = null;
                        break;
                    }
                }
                if (current && (current.hits || current.products)) {
                    productData = current;
                    break;
                }
            }

            if (!productData) return null;

            const products = (productData.hits || productData.products || []).map((p: any) => ({
                articleCode: p.articleCode || p.code || p.id,
                title: p.title || p.name || p.productName,
                pdpUrl: p.pdpUrl || p.url || p.link,
                regularPrice: p.regularPrice || p.price || p.whitePrice,
                redPrice: p.redPrice || p.salePrice || p.discountedPrice,
                category: p.category || p.categoryName,
                imageUrl: p.imageProductSrc || p.imageUrl || p.image,
                colors: p.swatches?.map((s: any) => ({ name: s.colorName, code: s.hexColor })),
                sizes: p.sizes?.map((s: any) => ({ code: s.sizeCode, name: s.name })),
            }));

            return {
                products,
                totalProducts: productData.totalHits || productData.total || products.length,
                currentPage: productData.pagination?.currentPage || 1,
                totalPages: productData.pagination?.totalPages || 1,
                filters: productData.facets || productData.filters || {},
                nextPageUrl: productData.nextPageUrl,
            };
        } catch (error) {
            log.debug('NextJS extraction failed:', error);
            return null;
        }
    }

    /**
     * Fallback: Extract from window object assignments
     */
    static extractFromWindowObject(html: string): ExtractedPageData | null {
        try {
            // Look for window.* assignments
            const patterns = [
                /window\.productList\s*=\s*(\{[\s\S]*?\});/,
                /window\.__INITIAL_STATE__\s*=\s*(\{[\s\S]*?\});/,
                /window\.HM_DATA\s*=\s*(\{[\s\S]*?\});/,
                /window\.pageData\s*=\s*(\{[\s\S]*?\});/,
            ];

            for (const pattern of patterns) {
                const match = html.match(pattern);
                if (match && match[1]) {
                    try {
                        // Clean and parse JSON
                        const cleanJson = match[1]
                            .replace(/undefined/g, 'null')
                            .replace(/'/g, '"')
                            .replace(/(\w+):/g, '"$1":');
                        
                        const data = JSON.parse(cleanJson);
                        // Process similar to NextJS extraction
                        return this.processRawData(data);
                    } catch (e) {
                        log.debug(`Failed to parse window object: ${e}`);
                    }
                }
            }
            return null;
        } catch (error) {
            log.debug('Window object extraction failed:', error);
            return null;
        }
    }

    /**
     * Fallback: Extract from JSON-LD structured data
     */
    static extractFromJsonLd(html: string): ExtractedPageData | null {
        try {
            const pattern = /<script type="application\/ld\+json">(.+?)<\/script>/gs;
            const matches = html.matchAll(pattern);
            
            for (const match of matches) {
                try {
                    const data = JSON.parse(match[1]);
                    if (data['@type'] === 'ItemList' || data['@type'] === 'ProductList') {
                        const products = (data.itemListElement || []).map((item: any) => ({
                            articleCode: item.sku || item.productID,
                            title: item.name,
                            pdpUrl: item.url,
                            regularPrice: item.offers?.price,
                            category: item.category,
                            imageUrl: item.image,
                        }));
                        
                        return {
                            products,
                            totalProducts: products.length,
                            currentPage: 1,
                            totalPages: 1,
                            filters: {},
                        };
                    }
                } catch (e) {
                    log.debug('Failed to parse JSON-LD:', e);
                }
            }
            return null;
        } catch (error) {
            log.debug('JSON-LD extraction failed:', error);
            return null;
        }
    }

    /**
     * Fallback: Extract from data attributes
     */
    static extractFromDataAttributes($: any): ExtractedPageData | null {
        try {
            const products: ProductData[] = [];
            
            // Try various product container selectors
            const selectors = [
                '[data-product]',
                '[data-article-code]',
                '[data-product-id]',
                '.product-item[data-article]',
                'article[data-test="product-card"]',
            ];

            for (const selector of selectors) {
                const items = $(selector);
                if (items.length > 0) {
                    items.each((i: number, elem: any) => {
                        const $elem = $(elem);
                        const product: ProductData = {
                            articleCode: $elem.data('article-code') || $elem.data('product-id') || $elem.data('article'),
                            title: $elem.find('[data-test="product-title"], .product-title, h2, h3').first().text().trim(),
                            pdpUrl: $elem.find('a').first().attr('href') || '',
                            regularPrice: $elem.find('[data-test="product-price"], .price, .regular-price').first().text().trim(),
                            redPrice: $elem.find('.sale-price, .red-price').text().trim() || undefined,
                            category: $elem.data('category') || '',
                            imageUrl: $elem.find('img').first().attr('src') || $elem.find('img').first().data('src') || '',
                        };
                        
                        if (product.articleCode && product.title) {
                            products.push(product);
                        }
                    });
                    
                    if (products.length > 0) break;
                }
            }

            if (products.length === 0) return null;

            return {
                products,
                totalProducts: products.length,
                currentPage: 1,
                totalPages: 1,
                filters: {},
            };
        } catch (error) {
            log.debug('Data attribute extraction failed:', error);
            return null;
        }
    }

    /**
     * Process raw data into standard format
     */
    private static processRawData(data: any): ExtractedPageData {
        // Generic processor for various data structures
        const products: ProductData[] = [];
        
        // Find products array in data
        const findProducts = (obj: any): any[] => {
            if (Array.isArray(obj)) return obj;
            if (obj && typeof obj === 'object') {
                for (const key of Object.keys(obj)) {
                    if (key.toLowerCase().includes('product') && Array.isArray(obj[key])) {
                        return obj[key];
                    }
                    const found = findProducts(obj[key]);
                    if (found.length > 0) return found;
                }
            }
            return [];
        };

        const rawProducts = findProducts(data);
        
        for (const p of rawProducts) {
            if (p && typeof p === 'object') {
                products.push({
                    articleCode: p.articleCode || p.code || p.id || p.sku,
                    title: p.title || p.name || p.productName,
                    pdpUrl: p.pdpUrl || p.url || p.link,
                    regularPrice: p.regularPrice || p.price || p.whitePrice,
                    redPrice: p.redPrice || p.salePrice,
                    category: p.category || p.categoryName,
                    imageUrl: p.imageProductSrc || p.imageUrl || p.image,
                });
            }
        }

        return {
            products,
            totalProducts: products.length,
            currentPage: 1,
            totalPages: 1,
            filters: {},
        };
    }

    /**
     * Main extraction method with all fallbacks
     */
    static extract(html: string, $?: any): ExtractedPageData | null {
        log.debug('Starting smart extraction...');
        
        // Try each extraction method in order
        const methods = [
            () => this.extractFromNextJs(html),
            () => this.extractFromWindowObject(html),
            () => this.extractFromJsonLd(html),
            () => $ ? this.extractFromDataAttributes($) : null,
        ];

        for (const [index, method] of methods.entries()) {
            try {
                const result = method();
                if (result && result.products.length > 0) {
                    log.debug(`Extraction successful with method ${index + 1}`);
                    return result;
                }
            } catch (error) {
                log.debug(`Extraction method ${index + 1} failed:`, error);
            }
        }

        log.warning('All extraction methods failed');
        return null;
    }
}