import { log } from 'crawlee';

/**
 * Robust data sanitization for H&M product data
 * Ensures data integrity and consistency
 */

export class DataSanitizer {
    /**
     * Sanitize string values
     */
    static sanitizeString(value: any, fieldName: string = 'field'): string {
        if (value === null || value === undefined) {
            return '';
        }
        
        if (typeof value !== 'string') {
            log.debug(`Converting non-string value for ${fieldName}:`, value);
            value = String(value);
        }
        
        // Remove null bytes and control characters
        value = value.replace(/\0/g, '').replace(/[\x00-\x1F\x7F]/g, '');
        
        // Trim whitespace
        value = value.trim();
        
        // Remove multiple spaces
        value = value.replace(/\s+/g, ' ');
        
        // Decode HTML entities
        value = this.decodeHtmlEntities(value);
        
        // Remove script tags and content
        value = value.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        
        // Remove style tags and content
        value = value.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
        
        return value;
    }
    
    /**
     * Sanitize numeric values
     */
    static sanitizeNumber(value: any, fieldName: string = 'field', defaultValue: number = 0): number {
        if (value === null || value === undefined || value === '') {
            return defaultValue;
        }
        
        if (typeof value === 'number') {
            if (isNaN(value) || !isFinite(value)) {
                log.debug(`Invalid number for ${fieldName}: ${value}`);
                return defaultValue;
            }
            return value;
        }
        
        if (typeof value === 'string') {
            // Remove currency symbols and spaces
            value = value.replace(/[^0-9.,\-]/g, '');
            // Handle European number format (comma as decimal separator)
            value = value.replace(',', '.');
        }
        
        const parsed = parseFloat(value);
        if (isNaN(parsed) || !isFinite(parsed)) {
            log.debug(`Failed to parse number for ${fieldName}:`, value);
            return defaultValue;
        }
        
        return Math.round(parsed * 100) / 100; // Round to 2 decimal places
    }
    
    /**
     * Sanitize boolean values
     */
    static sanitizeBoolean(value: any, defaultValue: boolean = false): boolean {
        if (value === null || value === undefined) {
            return defaultValue;
        }
        
        if (typeof value === 'boolean') {
            return value;
        }
        
        if (typeof value === 'string') {
            const lower = value.toLowerCase().trim();
            return ['true', 'yes', '1', 'on'].includes(lower);
        }
        
        if (typeof value === 'number') {
            return value !== 0;
        }
        
        return defaultValue;
    }
    
    /**
     * Sanitize URL
     */
    static sanitizeUrl(value: any, baseUrl: string = 'https://www2.hm.com'): string {
        if (!value) return '';
        
        let url = this.sanitizeString(value, 'url');
        if (!url) return '';
        
        // Handle relative URLs
        if (url.startsWith('/')) {
            url = baseUrl + url;
        }
        
        // Ensure protocol
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }
        
        try {
            const urlObj = new URL(url);
            // Ensure it's from H&M domain
            if (!urlObj.hostname.includes('hm.com')) {
                log.warning(`Suspicious URL domain: ${urlObj.hostname}`);
            }
            return urlObj.toString();
        } catch (error) {
            log.debug(`Invalid URL: ${url}`);
            return '';
        }
    }
    
    /**
     * Sanitize product ID
     */
    static sanitizeProductId(value: any): string {
        if (!value) return '';
        
        let id = this.sanitizeString(value, 'productId');
        
        // Remove non-alphanumeric characters except dots and dashes
        id = id.replace(/[^a-zA-Z0-9.\-]/g, '');
        
        // Ensure it's not too long
        if (id.length > 50) {
            id = id.substring(0, 50);
        }
        
        return id;
    }
    
    /**
     * Sanitize color value
     */
    static sanitizeColor(value: any): string {
        if (!value) return '';
        
        let color = this.sanitizeString(value, 'color');
        
        // Standardize color names
        const colorMap: Record<string, string> = {
            'schwarz': 'black',
            'weiß': 'white',
            'weiss': 'white',
            'rot': 'red',
            'blau': 'blue',
            'grün': 'green',
            'gruen': 'green',
            'gelb': 'yellow',
            'grau': 'gray',
            'braun': 'brown',
            'rosa': 'pink',
            'lila': 'purple',
            'orange': 'orange',
            'beige': 'beige',
            'navy': 'navy',
            'khaki': 'khaki',
        };
        
        const lower = color.toLowerCase();
        return colorMap[lower] || color;
    }
    
    /**
     * Sanitize hex color
     */
    static sanitizeHexColor(value: any): string {
        if (!value) return '';
        
        let hex = this.sanitizeString(value, 'hexColor');
        
        // Remove non-hex characters
        hex = hex.replace(/[^#a-fA-F0-9]/g, '');
        
        // Ensure it starts with #
        if (!hex.startsWith('#')) {
            hex = '#' + hex;
        }
        
        // Validate hex color
        if (!/^#[0-9A-F]{3}$|^#[0-9A-F]{6}$/i.test(hex)) {
            return '';
        }
        
        return hex.toUpperCase();
    }
    
    /**
     * Sanitize size value
     */
    static sanitizeSize(value: any): string {
        if (!value) return '';
        
        let size = this.sanitizeString(value, 'size');
        
        // Standardize common sizes
        const sizeMap: Record<string, string> = {
            'extra small': 'XS',
            'x-small': 'XS',
            'small': 'S',
            'medium': 'M',
            'large': 'L',
            'extra large': 'XL',
            'x-large': 'XL',
            'xx-large': 'XXL',
            'xxx-large': 'XXXL',
        };
        
        const lower = size.toLowerCase();
        return sizeMap[lower] || size.toUpperCase();
    }
    
    /**
     * Sanitize currency code
     */
    static sanitizeCurrency(value: any): string {
        if (!value) return 'EUR';
        
        let currency = this.sanitizeString(value, 'currency').toUpperCase();
        
        // Validate against known currencies
        const validCurrencies = [
            'EUR', 'USD', 'GBP', 'SEK', 'DKK', 'NOK', 'CHF', 'PLN', 'CZK',
            'HUF', 'RON', 'BGN', 'HRK', 'TRY', 'RUB', 'CAD', 'MXN', 'CLP',
            'PEN', 'COP', 'UYU', 'AUD', 'NZD', 'JPY', 'KRW', 'CNY', 'HKD',
            'TWD', 'SGD', 'MYR', 'PHP', 'THB', 'VND', 'INR', 'AED', 'SAR',
            'KWD', 'QAR', 'BHD', 'OMR', 'JOD', 'LBP', 'EGP', 'ZAR', 'MAD', 'ILS'
        ];
        
        if (!validCurrencies.includes(currency)) {
            log.warning(`Invalid currency code: ${currency}, defaulting to EUR`);
            return 'EUR';
        }
        
        return currency;
    }
    
    /**
     * Sanitize array of strings
     */
    static sanitizeStringArray(value: any, fieldName: string = 'array'): string[] {
        if (!value) return [];
        
        if (!Array.isArray(value)) {
            log.debug(`Converting non-array value for ${fieldName}:`, value);
            value = [value];
        }
        
        return value
            .map((item: any) => this.sanitizeString(item))
            .filter((item: string) => item.length > 0);
    }
    
    /**
     * Sanitize date/timestamp
     */
    static sanitizeDate(value: any, defaultValue: string = ''): string {
        if (!value) return defaultValue;
        
        try {
            const date = new Date(value);
            if (isNaN(date.getTime())) {
                return defaultValue;
            }
            return date.toISOString();
        } catch (error) {
            log.debug(`Invalid date value:`, value);
            return defaultValue;
        }
    }
    
    /**
     * Decode HTML entities
     */
    private static decodeHtmlEntities(text: string): string {
        const entities: Record<string, string> = {
            '&amp;': '&',
            '&lt;': '<',
            '&gt;': '>',
            '&quot;': '"',
            '&#39;': "'",
            '&apos;': "'",
            '&nbsp;': ' ',
            '&copy;': '©',
            '&reg;': '®',
            '&trade;': '™',
            '&euro;': '€',
            '&pound;': '£',
            '&yen;': '¥',
            '&sect;': '§',
            '&deg;': '°',
            '&plusmn;': '±',
            '&frac12;': '½',
            '&frac14;': '¼',
            '&times;': '×',
            '&divide;': '÷',
            '&alpha;': 'α',
            '&beta;': 'β',
            '&infin;': '∞',
        };
        
        let result = text;
        for (const [entity, char] of Object.entries(entities)) {
            result = result.replace(new RegExp(entity, 'g'), char);
        }
        
        // Decode numeric entities
        result = result.replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec));
        result = result.replace(/&#x([0-9A-Fa-f]+);/g, (match, hex) => String.fromCharCode(parseInt(hex, 16)));
        
        return result;
    }
    
    /**
     * Validate and sanitize email
     */
    static sanitizeEmail(value: any): string {
        if (!value) return '';
        
        let email = this.sanitizeString(value, 'email').toLowerCase();
        
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return '';
        }
        
        return email;
    }
    
    /**
     * Sanitize phone number
     */
    static sanitizePhone(value: any): string {
        if (!value) return '';
        
        let phone = this.sanitizeString(value, 'phone');
        
        // Keep only digits, spaces, and common phone characters
        phone = phone.replace(/[^0-9\s\-\+\(\)]/g, '');
        
        return phone;
    }
    
    /**
     * Sanitize complete product object
     */
    static sanitizeProduct(product: any): any {
        const sanitized: any = {};
        
        // Core identifiers
        sanitized.productId = this.sanitizeProductId(product.productId || product.articleNo);
        sanitized.variantId = this.sanitizeProductId(product.variantId);
        sanitized.sku = this.sanitizeString(product.sku);
        
        // Product information
        sanitized.title = this.sanitizeString(product.title || product.productName);
        sanitized.description = this.sanitizeString(product.description);
        
        // Categorization
        sanitized.category = this.sanitizeString(product.category);
        sanitized.subCategory = this.sanitizeString(product.subCategory);
        sanitized.gender = this.sanitizeString(product.gender);
        
        // Pricing
        sanitized.price = this.sanitizeNumber(product.price);
        sanitized.originalPrice = this.sanitizeNumber(product.originalPrice);
        sanitized.salePrice = product.salePrice ? this.sanitizeNumber(product.salePrice) : undefined;
        sanitized.currency = this.sanitizeCurrency(product.currency);
        
        // Variants
        sanitized.color = this.sanitizeColor(product.color);
        sanitized.colorCode = this.sanitizeString(product.colorCode);
        sanitized.hexColor = this.sanitizeHexColor(product.hexColor);
        sanitized.size = this.sanitizeSize(product.size);
        
        // Arrays
        sanitized.materials = this.sanitizeStringArray(product.materials);
        sanitized.careInstructions = this.sanitizeStringArray(product.careInstructions);
        sanitized.images = Array.isArray(product.images) ? product.images.map((img: any) => ({
            url: this.sanitizeUrl(img.url || img),
            alt: this.sanitizeString(img.alt)
        })) : [];
        
        // Availability
        sanitized.inStock = this.sanitizeBoolean(product.inStock);
        sanitized.stockLevel = this.sanitizeString(product.stockLevel);
        
        // URLs
        sanitized.url = this.sanitizeUrl(product.url);
        sanitized.imageUrl = this.sanitizeUrl(product.imageUrl);
        
        // Metadata
        sanitized.market = this.sanitizeString(product.market);
        sanitized.marketName = this.sanitizeString(product.marketName);
        sanitized.scrapedAt = this.sanitizeDate(product.scrapedAt || new Date().toISOString());
        
        // Remove null/undefined values
        Object.keys(sanitized).forEach(key => {
            if (sanitized[key] === null || sanitized[key] === undefined || sanitized[key] === '') {
                delete sanitized[key];
            }
        });
        
        return sanitized;
    }
}