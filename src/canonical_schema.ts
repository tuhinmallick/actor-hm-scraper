/**
 * H&M Product Canonical Schema
 * Following strict camelCase convention with language suffixes
 */

export interface CanonicalProduct {
    // Core Identifiers
    productId: string;                  // Unique H&M article code
    variantId?: string;                 // Specific variant ID (color/size combination)
    sku: string;                        // Stock keeping unit
    gtin?: string;                      // Global Trade Item Number (if available)
    
    // Product Information
    title: string;                      // English canonical title
    title_original?: string;            // Original language title
    description: string;                // English canonical description
    description_original?: string;      // Original language description
    shortDescription?: string;          // Brief product summary
    shortDescription_original?: string;
    
    // Categorization (Domain-Specific Ontology)
    domain: 'apparel' | 'accessories' | 'home' | 'beauty' | 'sport';
    category: string;                   // Main category (e.g., "dresses")
    subCategory?: string;               // Sub-category (e.g., "midi dresses")
    productType: string;                // Specific type (e.g., "A-line dress")
    gender: 'women' | 'men' | 'girls' | 'boys' | 'baby' | 'unisex';
    ageGroup: 'adult' | 'teen' | 'kids' | 'baby';
    
    // Pricing
    price: number;                      // Current price
    originalPrice: number;              // Original/list price
    salePrice?: number;                 // Sale price if on sale
    discountAmount?: number;            // Absolute discount
    discountPercentage?: number;        // Discount percentage
    currency: string;                   // Currency code (EUR, USD, etc.)
    pricePerUnit?: number;              // For multi-packs
    
    // Variants & Options
    color: string;                      // Primary color name in English
    color_original?: string;            // Original language color name
    colorCode: string;                  // H&M color code
    hexColor?: string;                  // Hex color value
    secondaryColors?: string[];         // Additional colors
    
    size: string;                       // Current variant size
    availableSizes: Size[];             // All available sizes
    sizeGuide?: SizeGuide;              // Size measurements
    sizeType: string;                   // Size system (EU, US, UK)
    
    // Materials & Composition
    materials: Material[];              // Fabric composition
    mainMaterial: string;               // Primary material
    careInstructions: string[];         // Washing/care instructions
    careInstructions_original?: string[];
    
    // Product Attributes
    fit?: 'slim' | 'regular' | 'relaxed' | 'oversized' | 'tailored';
    length?: 'mini' | 'short' | 'midi' | 'knee' | 'maxi' | 'floor';
    sleeves?: 'sleeveless' | 'short' | 'three-quarter' | 'long';
    neckline?: string;                  // Collar/neckline type
    closure?: string;                   // Zipper, buttons, etc.
    pattern?: string;                   // Print/pattern type
    style?: string[];                   // Style tags
    occasion?: string[];                // Suitable occasions
    season?: string[];                  // Seasonal tags
    
    // Sustainability & Ethics
    sustainable: boolean;               // Part of conscious collection
    sustainabilityLabels: string[];     // Specific eco labels
    recycledContent?: number;           // Percentage of recycled materials
    organicContent?: number;            // Percentage of organic materials
    certifications?: string[];          // GOTS, OEKO-TEX, etc.
    
    // Media
    images: ProductImage[];             // All product images
    videos?: ProductVideo[];            // Product videos
    thumbnail: string;                  // Main thumbnail URL
    
    // Availability
    inStock: boolean;                   // Overall availability
    stockLevel?: 'low' | 'medium' | 'high' | 'out';
    availableQuantity?: number;         // Exact stock if known
    backInStockDate?: string;           // Expected restock date
    limitedEdition: boolean;
    exclusive: boolean;                 // Online exclusive
    
    // URLs & References
    url: string;                        // Product page URL
    canonicalUrl: string;               // Canonical product URL
    mobileUrl?: string;                 // Mobile-specific URL
    
    // Metadata
    brand: string;                      // Always "H&M" or sub-brands
    manufacturer?: string;              // Manufacturing company
    countryOfOrigin?: string;           // Where it's made
    importedFrom?: string;              // Import country
    
    // Timestamps
    scrapedAt: string;                  // ISO timestamp of scraping
    releasedAt?: string;                // Product release date
    lastModified?: string;              // Last update on H&M
    
    // Market/Store Information
    market: string;                     // Country code (de_de, en_us, etc.)
    marketName: string;                 // Human-readable market name
    storeAvailability?: StoreInfo[];    // Physical store availability
    onlineOnly: boolean;
    
    // Customer Data
    rating?: number;                    // Average rating (1-5)
    reviewCount?: number;               // Number of reviews
    favoriteCount?: number;             // Times favorited
    
    // SEO & Marketing
    metaTitle?: string;                 // SEO title
    metaDescription?: string;           // SEO description
    keywords?: string[];                // SEO keywords
    badges?: string[];                  // "New", "Bestseller", etc.
    
    // Technical Details
    weight?: number;                    // Product weight (grams)
    dimensions?: Dimensions;            // Product dimensions
    modelInfo?: ModelInfo;              // Model wearing the item
    
    // Related Products
    relatedProducts?: string[];         // Related product IDs
    outfitProducts?: string[];          // Complete the look items
    similarProducts?: string[];         // Similar style items
    
    // Promotions
    promotions?: Promotion[];           // Active promotions
    memberPrice?: number;               // H&M member price
    bulkPricing?: BulkPrice[];          // Quantity discounts
    
    // Additional Raw Data
    rawData?: any;                      // Original H&M data structure
}

// Supporting Interfaces

export interface Size {
    code: string;                       // Size code
    name: string;                       // Display name (S, M, L, etc.)
    stock: 'in' | 'low' | 'out';       // Stock status
    measurements?: SizeMeasurements;
}

export interface SizeMeasurements {
    chest?: number;
    waist?: number;
    hips?: number;
    length?: number;
    sleeve?: number;
    inseam?: number;
    [key: string]: number | undefined;  // Allow custom measurements
}

export interface SizeGuide {
    unit: 'cm' | 'inch';
    measurements: SizeMeasurements[];
    fitNotes?: string;
    fitNotes_original?: string;
}

export interface Material {
    name: string;                       // Material name
    percentage: number;                 // Percentage in composition
    part?: string;                      // Part of garment (e.g., "Shell", "Lining")
}

export interface ProductImage {
    url: string;                        // Full resolution URL
    thumbnailUrl?: string;              // Thumbnail URL
    type: 'model' | 'product' | 'detail' | 'lifestyle';
    angle?: 'front' | 'back' | 'side' | 'detail';
    order: number;                      // Display order
    alt?: string;                       // Alt text
    width?: number;
    height?: number;
}

export interface ProductVideo {
    url: string;
    thumbnailUrl: string;
    type: 'product' | 'styling' | 'catwalk';
    duration?: number;                  // Seconds
    format?: string;
}

export interface StoreInfo {
    storeId: string;
    storeName: string;
    address: string;
    city: string;
    availableSizes: string[];
    stockLevel: 'low' | 'medium' | 'high';
    distance?: number;                  // Distance from search location
}

export interface Dimensions {
    length?: number;
    width?: number;
    height?: number;
    unit: 'cm' | 'inch';
}

export interface ModelInfo {
    height?: string;                    // e.g., "178 cm"
    size?: string;                      // Size worn by model
    notes?: string;                     // Additional fit notes
}

export interface Promotion {
    type: 'percentage' | 'fixed' | 'bogo' | 'bundle';
    description: string;
    description_original?: string;
    code?: string;                      // Promo code
    validUntil?: string;
    conditions?: string[];
}

export interface BulkPrice {
    quantity: number;
    price: number;
    saveAmount: number;
    savePercentage: number;
}

// Output Format Configuration
export interface OutputConfig {
    includeRawData?: boolean;           // Include original H&M data
    includeTranslations?: boolean;      // Include _original fields
    includeRelatedProducts?: boolean;   // Include related/outfit products
    includeStoreAvailability?: boolean; // Include physical store data
    compressImages?: boolean;           // Use compressed image URLs
    fields?: string[];                  // Specific fields to include
}