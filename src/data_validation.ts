import { log } from 'crawlee';
import { safeLogError } from './types.js';

/**
 * Comprehensive data validation and cleaning utilities
 * Ensures high-quality, consistent data output
 */

export interface ProductData {
    company: string;
    country: string;
    productName: string;
    articleNo: number;
    division: string;
    category: string;
    subCategory: string;
    listPrice: number;
    salePrice: number | null;
    currency: string;
    description: string;
    url: string;
    imageUrl: string;
    timestamp: string;
}

/**
 * Data validation rules and schemas
 */
export const VALIDATION_RULES = {
    productName: {
        minLength: 3,
        maxLength: 200,
        required: true,
    },
    articleNo: {
        min: 100000,
        max: 999999999,
        required: true,
    },
    listPrice: {
        min: 0.01,
        max: 10000,
        required: true,
    },
    salePrice: {
        min: 0.01,
        max: 10000,
        required: false,
    },
    description: {
        minLength: 10,
        maxLength: 1000,
        required: true,
    },
    url: {
        pattern: /^https?:\/\/.+/,
        required: true,
    },
    imageUrl: {
        pattern: /^https?:\/\/.+/,
        required: true,
    },
};

/**
 * Clean and normalize text data
 */
export const cleanText = (text: string): string => {
    if (!text || typeof text !== 'string') return '';
    
    return text
        .trim()
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .replace(/[\r\n\t]/g, ' ') // Replace line breaks and tabs with spaces
        .replace(/[^\x20-\x7E\u00A0-\uFFFF]/g, '') // Remove non-printable characters except extended unicode
        .trim();
};

/**
 * Clean and normalize price data
 */
export const cleanPrice = (price: string | number): number | null => {
    if (typeof price === 'number') {
        return price > 0 ? Math.round(price * 100) / 100 : null;
    }
    
    if (!price || typeof price !== 'string') return null;
    
    // Extract numeric value from price string
    const numericMatch = price.replace(/[^\d.,]/g, '').match(/(\d+)[.,]?(\d*)/);
    if (!numericMatch) return null;
    
    const integerPart = parseInt(numericMatch[1], 10);
    const decimalPart = numericMatch[2] ? parseInt(numericMatch[2], 10) : 0;
    const decimalPlaces = numericMatch[2] ? numericMatch[2].length : 0;
    
    const priceValue = integerPart + (decimalPart / Math.pow(10, decimalPlaces));
    return priceValue > 0 ? Math.round(priceValue * 100) / 100 : null;
};

/**
 * Clean and normalize URL
 */
export const cleanUrl = (url: string): string => {
    if (!url || typeof url !== 'string') return '';
    
    try {
        const urlObj = new URL(url);
        // Remove tracking parameters
        const trackingParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid'];
        trackingParams.forEach(param => urlObj.searchParams.delete(param));
        
        return urlObj.toString();
    } catch (error: unknown) {
        log.warning(`Invalid URL: ${url}`, safeLogError(error));
        return '';
    }
};

/**
 * Clean and normalize image URL
 */
export const cleanImageUrl = (imageUrl: string): string => {
    if (!imageUrl || typeof imageUrl !== 'string') return '';
    
    try {
        // Ensure HTTPS
        if (imageUrl.startsWith('//')) {
            imageUrl = 'https:' + imageUrl;
        } else if (imageUrl.startsWith('/')) {
            imageUrl = 'https://www2.hm.com' + imageUrl;
        }
        
        const urlObj = new URL(imageUrl);
        return urlObj.toString();
    } catch (error: unknown) {
        log.warning(`Invalid image URL: ${imageUrl}`, safeLogError(error));
        return '';
    }
};

/**
 * Validate product data against rules
 */
export const validateProductData = (product: Partial<ProductData>): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    // Validate product name
    if (VALIDATION_RULES.productName.required && !product.productName) {
        errors.push('Product name is required');
    } else if (product.productName) {
        const cleanedName = cleanText(product.productName);
        if (cleanedName.length < VALIDATION_RULES.productName.minLength) {
            errors.push(`Product name too short (min: ${VALIDATION_RULES.productName.minLength})`);
        }
        if (cleanedName.length > VALIDATION_RULES.productName.maxLength) {
            errors.push(`Product name too long (max: ${VALIDATION_RULES.productName.maxLength})`);
        }
    }
    
    // Validate article number
    if (VALIDATION_RULES.articleNo.required && !product.articleNo) {
        errors.push('Article number is required');
    } else if (product.articleNo) {
        if (product.articleNo < VALIDATION_RULES.articleNo.min || product.articleNo > VALIDATION_RULES.articleNo.max) {
            errors.push(`Article number out of range (${VALIDATION_RULES.articleNo.min}-${VALIDATION_RULES.articleNo.max})`);
        }
    }
    
    // Validate list price
    if (VALIDATION_RULES.listPrice.required && !product.listPrice) {
        errors.push('List price is required');
    } else if (product.listPrice) {
        if (product.listPrice < VALIDATION_RULES.listPrice.min || product.listPrice > VALIDATION_RULES.listPrice.max) {
            errors.push(`List price out of range (${VALIDATION_RULES.listPrice.min}-${VALIDATION_RULES.listPrice.max})`);
        }
    }
    
    // Validate sale price
    if (product.salePrice && (product.salePrice < VALIDATION_RULES.salePrice.min || product.salePrice > VALIDATION_RULES.salePrice.max)) {
        errors.push(`Sale price out of range (${VALIDATION_RULES.salePrice.min}-${VALIDATION_RULES.salePrice.max})`);
    }
    
    // Validate description
    if (VALIDATION_RULES.description.required && !product.description) {
        errors.push('Description is required');
    } else if (product.description) {
        const cleanedDesc = cleanText(product.description);
        if (cleanedDesc.length < VALIDATION_RULES.description.minLength) {
            errors.push(`Description too short (min: ${VALIDATION_RULES.description.minLength})`);
        }
        if (cleanedDesc.length > VALIDATION_RULES.description.maxLength) {
            errors.push(`Description too long (max: ${VALIDATION_RULES.description.maxLength})`);
        }
    }
    
    // Validate URL
    if (VALIDATION_RULES.url.required && !product.url) {
        errors.push('URL is required');
    } else if (product.url && !VALIDATION_RULES.url.pattern.test(product.url)) {
        errors.push('Invalid URL format');
    }
    
    // Validate image URL
    if (VALIDATION_RULES.imageUrl.required && !product.imageUrl) {
        errors.push('Image URL is required');
    } else if (product.imageUrl && !VALIDATION_RULES.imageUrl.pattern.test(product.imageUrl)) {
        errors.push('Invalid image URL format');
    }
    
    return {
        isValid: errors.length === 0,
        errors,
    };
};

/**
 * Clean and validate product data
 */
export const cleanAndValidateProduct = (rawProduct: any): ProductData | null => {
    try {
        // Clean all text fields
        const cleanedProduct: ProductData = {
            company: cleanText(rawProduct.company || ''),
            country: cleanText(rawProduct.country || ''),
            productName: cleanText(rawProduct.productName || ''),
            articleNo: typeof rawProduct.articleNo === 'number' ? rawProduct.articleNo : parseInt(rawProduct.articleNo || '0', 10),
            division: cleanText(rawProduct.division || ''),
            category: cleanText(rawProduct.category || ''),
            subCategory: cleanText(rawProduct.subCategory || ''),
            listPrice: cleanPrice(rawProduct.listPrice) || 0,
            salePrice: cleanPrice(rawProduct.salePrice),
            currency: cleanText(rawProduct.currency || ''),
            description: cleanText(rawProduct.description || ''),
            url: cleanUrl(rawProduct.url || ''),
            imageUrl: cleanImageUrl(rawProduct.imageUrl || ''),
            timestamp: rawProduct.timestamp || new Date().toISOString(),
        };
        
        // Validate cleaned data
        const validation = validateProductData(cleanedProduct);
        
        if (!validation.isValid) {
            log.warning(`Product validation failed: ${validation.errors.join(', ')}`, {
                productName: cleanedProduct.productName,
                articleNo: cleanedProduct.articleNo,
            });
            return null;
        }
        
        return cleanedProduct;
    } catch (error: unknown) {
        log.error('Error cleaning product data:', safeLogError(error));
        return null;
    }
};

/**
 * Deduplicate products based on article number and country
 */
export const deduplicateProducts = (products: ProductData[]): ProductData[] => {
    const seen = new Set<string>();
    const unique: ProductData[] = [];
    
    for (const product of products) {
        const key = `${product.articleNo}_${product.country}`;
        if (!seen.has(key)) {
            seen.add(key);
            unique.push(product);
        }
    }
    
    return unique;
};

/**
 * Quality scoring for products
 */
export const calculateProductQualityScore = (product: ProductData): number => {
    let score = 0;
    const maxScore = 100;
    
    // Product name quality (20 points)
    if (product.productName && product.productName.length > 10) score += 20;
    else if (product.productName && product.productName.length > 5) score += 10;
    
    // Description quality (20 points)
    if (product.description && product.description.length > 50) score += 20;
    else if (product.description && product.description.length > 20) score += 10;
    
    // Price information (20 points)
    if (product.listPrice > 0) score += 15;
    if (product.salePrice && product.salePrice > 0) score += 5;
    
    // Image availability (20 points)
    if (product.imageUrl && product.imageUrl.includes('hm.com')) score += 20;
    else if (product.imageUrl) score += 10;
    
    // URL validity (10 points)
    if (product.url && product.url.includes('hm.com')) score += 10;
    
    // Article number validity (10 points)
    if (product.articleNo && product.articleNo > 100000) score += 10;
    
    return Math.min(score, maxScore);
};

/**
 * Filter products by quality score
 */
export const filterByQuality = (products: ProductData[], minScore: number = 70): ProductData[] => {
    return products.filter(product => calculateProductQualityScore(product) >= minScore);
};