import { log } from 'crawlee';

export interface FilterOptions {
    // Price range
    minPrice?: number;
    maxPrice?: number;
    
    // Colors (e.g., "schwarz_000000", "rot_ff0000")
    colors?: string[];
    
    // Sizes (e.g., "womenswear;NO_FORMAT[SML];M")
    sizes?: string[];
    
    // Styles (e.g., "Maxikleid", "Minikleid")
    clothingStyles?: string[];
    
    // Materials (e.g., "Baumwolle", "Polyester")
    materials?: string[];
    
    // Patterns (e.g., "Einfarbig", "Gestreift")
    patterns?: string[];
    
    // Brands
    brandNames?: string[];
    
    // Garment lengths
    garmentLengths?: string[];
    
    // Sleeve lengths
    sleeveLengths?: string[];
    
    // Fits
    fits?: string[];
    
    // Contexts/Occasions
    contexts?: string[];
    
    // Neckline styles
    necklineStyles?: string[];
    
    // Sale items only
    sale?: boolean;
    
    // Sustainable/Conscious items
    sustainabilities?: string[];
    
    // Store availability
    storeId?: string;
    
    // Custom filters (any other H&M specific filters)
    customFilters?: Record<string, string | string[]>;
}

export interface PaginationOptions {
    offset?: number;
    pageSize?: number; // H&M supports up to 128 items per page
}

export interface SortOptions {
    sort?: 'stock' | 'newProduct' | 'ascPrice' | 'descPrice';
}

export interface DisplayOptions {
    imageSize?: 'small' | 'large';
    imageType?: 'model' | 'product';
}

export class HMUrlBuilder {
    private baseUrl: string;
    private path: string;
    private params: URLSearchParams;

    constructor(urlOrPath: string) {
        // Handle both full URLs and paths
        if (urlOrPath.startsWith('http')) {
            const url = new URL(urlOrPath);
            this.baseUrl = `${url.protocol}//${url.host}`;
            this.path = url.pathname;
            this.params = new URLSearchParams(url.search);
        } else {
            this.baseUrl = 'https://www2.hm.com';
            this.path = urlOrPath.startsWith('/') ? urlOrPath : `/${urlOrPath}`;
            this.params = new URLSearchParams();
        }
    }

    /**
     * Apply filters to the URL
     */
    applyFilters(filters: FilterOptions): HMUrlBuilder {
        // Price range
        if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
            const min = filters.minPrice || 0;
            const max = filters.maxPrice || 9999;
            this.params.set('priceRange', `[${min},${max}]`);
        }

        // Colors
        if (filters.colors && filters.colors.length > 0) {
            filters.colors.forEach(color => {
                this.params.append('colorWithNames', color);
            });
        }

        // Sizes
        if (filters.sizes && filters.sizes.length > 0) {
            filters.sizes.forEach(size => {
                this.params.append('sizes', size);
            });
        }

        // Clothing styles
        if (filters.clothingStyles && filters.clothingStyles.length > 0) {
            filters.clothingStyles.forEach(style => {
                this.params.append('clothingStyles', style);
            });
        }

        // Materials
        if (filters.materials && filters.materials.length > 0) {
            filters.materials.forEach(material => {
                this.params.append('materials', material);
            });
        }

        // Patterns
        if (filters.patterns && filters.patterns.length > 0) {
            filters.patterns.forEach(pattern => {
                this.params.append('patterns', pattern);
            });
        }

        // Brands
        if (filters.brandNames && filters.brandNames.length > 0) {
            filters.brandNames.forEach(brand => {
                this.params.append('brandNames', brand);
            });
        }

        // Other filter arrays
        const filterArrays = [
            'garmentLengths', 'sleeveLengths', 'fits', 'contexts', 
            'necklineStyles', 'sustainabilities'
        ];
        
        filterArrays.forEach(filterName => {
            const values = (filters as any)[filterName];
            if (values && values.length > 0) {
                values.forEach((value: string) => {
                    this.params.append(filterName, value);
                });
            }
        });

        // Sale filter
        if (filters.sale) {
            this.params.set('sale', 'true');
        }

        // Store availability
        if (filters.storeId) {
            this.params.set('storeAvailability', filters.storeId);
        }

        // Custom filters
        if (filters.customFilters) {
            Object.entries(filters.customFilters).forEach(([key, value]) => {
                if (Array.isArray(value)) {
                    value.forEach(v => this.params.append(key, v));
                } else {
                    this.params.set(key, value);
                }
            });
        }

        return this;
    }

    /**
     * Apply pagination
     */
    applyPagination(options: PaginationOptions): HMUrlBuilder {
        if (options.offset !== undefined) {
            this.params.set('offset', options.offset.toString());
        }
        if (options.pageSize !== undefined) {
            // H&M max is 128
            const size = Math.min(options.pageSize, 128);
            this.params.set('page-size', size.toString());
        }
        return this;
    }

    /**
     * Apply sorting
     */
    applySort(options: SortOptions): HMUrlBuilder {
        if (options.sort) {
            this.params.set('sort', options.sort);
        }
        return this;
    }

    /**
     * Apply display options
     */
    applyDisplay(options: DisplayOptions): HMUrlBuilder {
        if (options.imageSize) {
            this.params.set('image-size', options.imageSize);
        }
        if (options.imageType) {
            this.params.set('image', options.imageType);
        }
        return this;
    }

    /**
     * Build the final URL
     */
    build(): string {
        const queryString = this.params.toString();
        return `${this.baseUrl}${this.path}${queryString ? '?' + queryString : ''}`;
    }

    /**
     * Get URL for a specific page number
     */
    getPageUrl(pageNumber: number, pageSize: number = 36): string {
        const offset = (pageNumber - 1) * pageSize;
        this.applyPagination({ offset, pageSize });
        return this.build();
    }

    /**
     * Generate all page URLs based on total products
     */
    generatePageUrls(totalProducts: number, pageSize: number = 36): string[] {
        const totalPages = Math.ceil(totalProducts / pageSize);
        const urls: string[] = [];
        
        for (let page = 1; page <= totalPages; page++) {
            // Clone current state for each page
            const pageBuilder = new HMUrlBuilder(this.build());
            urls.push(pageBuilder.getPageUrl(page, pageSize));
        }
        
        return urls;
    }

    /**
     * Parse filters from an existing URL
     */
    static parseUrl(url: string): {
        path: string;
        filters: FilterOptions;
        pagination: PaginationOptions;
        sort?: string;
        display: DisplayOptions;
    } {
        const urlObj = new URL(url);
        const params = new URLSearchParams(urlObj.search);
        
        const filters: FilterOptions = {
            customFilters: {}
        };
        const pagination: PaginationOptions = {};
        const display: DisplayOptions = {};
        let sort: string | undefined;

        // Parse each parameter
        for (const [key, value] of params.entries()) {
            switch (key) {
                case 'priceRange':
                    const priceMatch = value.match(/\[(\d+),(\d+)\]/);
                    if (priceMatch) {
                        filters.minPrice = parseFloat(priceMatch[1]);
                        filters.maxPrice = parseFloat(priceMatch[2]);
                    }
                    break;
                
                case 'colorWithNames':
                    if (!filters.colors) filters.colors = [];
                    filters.colors.push(value);
                    break;
                
                case 'sizes':
                    if (!filters.sizes) filters.sizes = [];
                    filters.sizes.push(value);
                    break;
                
                case 'offset':
                    pagination.offset = parseInt(value);
                    break;
                
                case 'page-size':
                    pagination.pageSize = parseInt(value);
                    break;
                
                case 'sort':
                    sort = value;
                    break;
                
                case 'image-size':
                    display.imageSize = value as 'small' | 'large';
                    break;
                
                case 'image':
                    display.imageType = value as 'model' | 'product';
                    break;
                
                default:
                    // Handle array filters
                    const arrayFilters = [
                        'clothingStyles', 'materials', 'patterns', 'brandNames',
                        'garmentLengths', 'sleeveLengths', 'fits', 'contexts',
                        'necklineStyles', 'sustainabilities'
                    ];
                    
                    if (arrayFilters.includes(key)) {
                        if (!(filters as any)[key]) {
                            (filters as any)[key] = [];
                        }
                        (filters as any)[key].push(value);
                    } else {
                        // Custom filter
                        if (!filters.customFilters![key]) {
                            filters.customFilters![key] = [];
                        }
                        if (Array.isArray(filters.customFilters![key])) {
                            (filters.customFilters![key] as string[]).push(value);
                        } else {
                            filters.customFilters![key] = [filters.customFilters![key] as string, value];
                        }
                    }
            }
        }

        return {
            path: urlObj.pathname,
            filters,
            pagination,
            sort,
            display
        };
    }
}