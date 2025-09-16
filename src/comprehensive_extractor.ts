import { log } from 'crawlee';
import { CanonicalProduct, Size, Material, ProductImage, StoreInfo, Promotion } from './canonical_schema.js';

/**
 * Comprehensive product data extractor for H&M
 * Extracts every possible detail from product pages and listing pages
 */

export class ComprehensiveExtractor {
    /**
     * Extract all product details from a product page
     */
    static async extractProductDetails(
        $: any,
        body: string,
        url: string,
        market: string,
        marketName: string
    ): Promise<CanonicalProduct | null> {
        try {
            // Extract Next.js data
            const scriptMatch = body.match(/<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/s);
            if (!scriptMatch) {
                log.warning('No Next.js data found on product page');
                return null;
            }

            const jsonData = JSON.parse(scriptMatch[1]);
            const pageProps = jsonData?.props?.pageProps;
            const productData = pageProps?.productData || pageProps?.product;
            
            if (!productData) {
                log.warning('No product data found in Next.js data');
                return null;
            }

            // Extract all possible fields
            const product: CanonicalProduct = {
                // Core Identifiers
                productId: productData.articleCode || productData.code || productData.id,
                variantId: productData.variantCode,
                sku: productData.sku || productData.articleCode,
                gtin: productData.gtin || productData.ean,

                // Product Information
                title: this.extractTitle(productData, 'en'),
                title_original: this.extractTitle(productData, market),
                description: this.extractDescription(productData, 'en'),
                description_original: this.extractDescription(productData, market),
                shortDescription: productData.shortDescription,
                shortDescription_original: productData.shortDescriptionLocal,

                // Categorization
                domain: this.determineDomain(productData),
                category: productData.category || productData.mainCategory,
                subCategory: productData.subCategory || productData.productType,
                productType: productData.productTypeName || productData.garmentType,
                gender: this.extractGender(productData),
                ageGroup: this.extractAgeGroup(productData),

                // Pricing
                price: this.extractPrice(productData.price || productData.whitePrice),
                originalPrice: this.extractPrice(productData.originalPrice || productData.whitePrice),
                salePrice: productData.redPrice ? this.extractPrice(productData.redPrice) : undefined,
                discountAmount: this.calculateDiscountAmount(productData),
                discountPercentage: this.calculateDiscountPercentage(productData),
                currency: productData.currency || this.getCurrencyForMarket(market),
                pricePerUnit: productData.pricePerUnit,

                // Variants & Options
                color: this.extractColorName(productData, 'en'),
                color_original: this.extractColorName(productData, market),
                colorCode: productData.colorCode || productData.color,
                hexColor: productData.rgbColor || productData.hexColor,
                secondaryColors: this.extractSecondaryColors(productData),

                size: productData.size || productData.sizeCode,
                availableSizes: this.extractSizes(productData),
                sizeGuide: this.extractSizeGuide(productData),
                sizeType: productData.sizeSystem || this.detectSizeSystem(productData),

                // Materials & Composition
                materials: this.extractMaterials(productData),
                mainMaterial: this.extractMainMaterial(productData),
                careInstructions: this.extractCareInstructions(productData, 'en'),
                careInstructions_original: this.extractCareInstructions(productData, market),

                // Product Attributes
                fit: productData.fit || productData.fitType,
                length: productData.length || productData.garmentLength,
                sleeves: productData.sleeveLength,
                neckline: productData.necklineStyle || productData.collarType,
                closure: productData.closure || productData.fasteningType,
                pattern: productData.pattern || productData.print,
                style: this.extractStyles(productData),
                occasion: this.extractOccasions(productData),
                season: this.extractSeasons(productData),

                // Sustainability & Ethics
                sustainable: this.isSustainable(productData),
                sustainabilityLabels: this.extractSustainabilityLabels(productData),
                recycledContent: productData.recycledContentPercentage,
                organicContent: productData.organicContentPercentage,
                certifications: this.extractCertifications(productData),

                // Media
                images: this.extractAllImages(productData),
                videos: this.extractVideos(productData),
                thumbnail: this.extractThumbnail(productData),

                // Availability
                inStock: this.isInStock(productData),
                stockLevel: this.getStockLevel(productData),
                availableQuantity: productData.stock?.quantity,
                backInStockDate: productData.expectedRestockDate,
                limitedEdition: productData.limitedEdition || false,
                exclusive: productData.exclusive || productData.onlineExclusive || false,

                // URLs & References
                url: url,
                canonicalUrl: productData.canonicalUrl || url,
                mobileUrl: productData.mobileUrl,

                // Metadata
                brand: productData.brand || 'H&M',
                manufacturer: productData.manufacturer,
                countryOfOrigin: productData.countryOfOrigin,
                importedFrom: productData.importCountry,

                // Timestamps
                scrapedAt: new Date().toISOString(),
                releasedAt: productData.releaseDate,
                lastModified: productData.lastModified,

                // Market/Store Information
                market: market,
                marketName: marketName,
                storeAvailability: this.extractStoreAvailability(productData),
                onlineOnly: productData.onlineOnly || false,

                // Customer Data
                rating: productData.rating?.average,
                reviewCount: productData.rating?.count,
                favoriteCount: productData.favoriteCount,

                // SEO & Marketing
                metaTitle: $('meta[property="og:title"]').attr('content'),
                metaDescription: $('meta[property="og:description"]').attr('content'),
                keywords: this.extractKeywords($),
                badges: this.extractBadges(productData),

                // Technical Details
                weight: productData.weight,
                dimensions: this.extractDimensions(productData),
                modelInfo: this.extractModelInfo(productData),

                // Related Products
                relatedProducts: this.extractRelatedProducts(productData),
                outfitProducts: this.extractOutfitProducts(productData),
                similarProducts: this.extractSimilarProducts(productData),

                // Promotions
                promotions: this.extractPromotions(productData),
                memberPrice: productData.memberPrice,
                bulkPricing: this.extractBulkPricing(productData),

                // Raw Data (optional)
                rawData: productData,
            };

            return product;
        } catch (error) {
            log.error('Error extracting product details:', error as any);
            return null;
        }
    }

    // Helper methods for extraction

    private static extractTitle(data: any, language: string): string {
        if (language === 'en') {
            return data.title || data.name || data.productName || '';
        }
        return data.localTitle || data.title || data.name || '';
    }

    private static extractDescription(data: any, language: string): string {
        if (language === 'en') {
            return data.description || data.detailedDescriptions?.description || '';
        }
        return data.localDescription || data.description || '';
    }

    private static determineDomain(data: any): 'apparel' | 'accessories' | 'home' | 'beauty' | 'sport' {
        const category = (data.mainCategory || data.department || '').toLowerCase();
        if (category.includes('home')) return 'home';
        if (category.includes('beauty')) return 'beauty';
        if (category.includes('sport')) return 'sport';
        if (category.includes('accessories')) return 'accessories';
        return 'apparel';
    }

    private static extractGender(data: any): 'women' | 'men' | 'girls' | 'boys' | 'baby' | 'unisex' {
        const gender = (data.gender || data.department || '').toLowerCase();
        if (gender.includes('women') || gender.includes('ladies')) return 'women';
        if (gender.includes('men')) return 'men';
        if (gender.includes('girl')) return 'girls';
        if (gender.includes('boy')) return 'boys';
        if (gender.includes('baby')) return 'baby';
        return 'unisex';
    }

    private static extractAgeGroup(data: any): 'adult' | 'teen' | 'kids' | 'baby' {
        const dept = (data.department || '').toLowerCase();
        if (dept.includes('baby')) return 'baby';
        if (dept.includes('kids') || dept.includes('children')) return 'kids';
        if (dept.includes('teen')) return 'teen';
        return 'adult';
    }

    private static extractPrice(priceStr: string | number): number {
        if (typeof priceStr === 'number') return priceStr;
        if (!priceStr) return 0;
        return parseFloat(priceStr.toString().replace(/[^0-9.,]/g, '').replace(',', '.'));
    }

    private static calculateDiscountAmount(data: any): number | undefined {
        if (data.redPrice && data.whitePrice) {
            const original = this.extractPrice(data.whitePrice);
            const sale = this.extractPrice(data.redPrice);
            return original - sale;
        }
        return undefined;
    }

    private static calculateDiscountPercentage(data: any): number | undefined {
        if (data.discountPercentage) return data.discountPercentage;
        if (data.redPrice && data.whitePrice) {
            const original = this.extractPrice(data.whitePrice);
            const sale = this.extractPrice(data.redPrice);
            return Math.round(((original - sale) / original) * 100);
        }
        return undefined;
    }

    private static getCurrencyForMarket(market: string): string {
        const currencyMap: Record<string, string> = {
            'en_us': 'USD',
            'en_gb': 'GBP',
            'de_de': 'EUR',
            'fr_fr': 'EUR',
            'es_es': 'EUR',
            'it_it': 'EUR',
            'nl_nl': 'EUR',
            'sv_se': 'SEK',
            'en_ca': 'CAD',
            'en_au': 'AUD',
            'ja_jp': 'JPY',
            'zh_cn': 'CNY',
        };
        return currencyMap[market] || 'EUR';
    }

    private static extractColorName(data: any, language: string): string {
        if (language === 'en') {
            return data.colorName || data.color || data.mainColor || '';
        }
        return data.localColorName || data.colorName || '';
    }

    private static extractSecondaryColors(data: any): string[] | undefined {
        const colors: string[] = [];
        if (data.secondaryColors) {
            colors.push(...data.secondaryColors);
        }
        if (data.accentColors) {
            colors.push(...data.accentColors);
        }
        return colors.length > 0 ? colors : undefined;
    }

    private static extractSizes(data: any): Size[] {
        const sizes: Size[] = [];
        const sizeData = data.sizes || data.availableSizes || data.variantSizes || [];
        
        for (const size of sizeData) {
            sizes.push({
                code: size.sizeCode || size.code,
                name: size.name || size.size,
                stock: this.getSizeStock(size),
                measurements: size.measurements,
            });
        }
        
        return sizes;
    }

    private static getSizeStock(size: any): 'in' | 'low' | 'out' {
        if (size.availability === 'OutOfStock' || size.stock === 0) return 'out';
        if (size.availability === 'LowStock' || size.stock < 10) return 'low';
        return 'in';
    }

    private static extractSizeGuide(data: any): any {
        if (data.sizeGuide) {
            return {
                unit: data.sizeGuide.unit || 'cm',
                measurements: data.sizeGuide.measurements,
                fitNotes: data.sizeGuide.fitNotes,
                fitNotes_original: data.sizeGuide.localFitNotes,
            };
        }
        return undefined;
    }

    private static detectSizeSystem(data: any): string {
        const market = data.market || '';
        if (market.includes('us')) return 'US';
        if (market.includes('gb')) return 'UK';
        return 'EU';
    }

    private static extractMaterials(data: any): Material[] {
        const materials: Material[] = [];
        const composition = data.composition || data.materialComposition || data.fabric || {};
        
        for (const [part, materialList] of Object.entries(composition)) {
            if (Array.isArray(materialList)) {
                for (const mat of materialList) {
                    materials.push({
                        name: mat.material || mat.name,
                        percentage: mat.percentage || 0,
                        part: part,
                    });
                }
            }
        }
        
        return materials;
    }

    private static extractMainMaterial(data: any): string {
        const materials = this.extractMaterials(data);
        if (materials.length === 0) return '';
        
        // Find material with highest percentage
        const main = materials.reduce((prev, current) => 
            (current.percentage > prev.percentage) ? current : prev
        );
        
        return main.name;
    }

    private static extractCareInstructions(data: any, language: string): string[] {
        const instructions = language === 'en' 
            ? data.careInstructions || data.care
            : data.localCareInstructions || data.careInstructions || data.care;
        
        if (Array.isArray(instructions)) return instructions;
        if (typeof instructions === 'string') return instructions.split('\n');
        return [];
    }

    private static extractStyles(data: any): string[] | undefined {
        const styles: string[] = [];
        if (data.styles) styles.push(...data.styles);
        if (data.styleTags) styles.push(...data.styleTags);
        if (data.looks) styles.push(...data.looks);
        return styles.length > 0 ? styles : undefined;
    }

    private static extractOccasions(data: any): string[] | undefined {
        const occasions: string[] = [];
        if (data.occasions) occasions.push(...data.occasions);
        if (data.contexts) occasions.push(...data.contexts);
        return occasions.length > 0 ? occasions : undefined;
    }

    private static extractSeasons(data: any): string[] | undefined {
        const seasons: string[] = [];
        if (data.seasons) seasons.push(...data.seasons);
        if (data.collection?.includes('Spring')) seasons.push('Spring');
        if (data.collection?.includes('Summer')) seasons.push('Summer');
        if (data.collection?.includes('Autumn')) seasons.push('Autumn');
        if (data.collection?.includes('Winter')) seasons.push('Winter');
        return seasons.length > 0 ? seasons : undefined;
    }

    private static isSustainable(data: any): boolean {
        return data.sustainable || 
               data.conscious || 
               data.isConscious || 
               data.sustainabilityTag || 
               false;
    }

    private static extractSustainabilityLabels(data: any): string[] {
        const labels: string[] = [];
        if (data.sustainabilityLabels) labels.push(...data.sustainabilityLabels);
        if (data.consciousLabels) labels.push(...data.consciousLabels);
        if (data.ecoLabels) labels.push(...data.ecoLabels);
        if (data.conscious) labels.push('Conscious');
        return labels;
    }

    private static extractCertifications(data: any): string[] | undefined {
        const certs: string[] = [];
        if (data.certifications) certs.push(...data.certifications);
        if (data.certificates) certs.push(...data.certificates);
        if (data.hasGOTS) certs.push('GOTS');
        if (data.hasOekoTex) certs.push('OEKO-TEX');
        return certs.length > 0 ? certs : undefined;
    }

    private static extractAllImages(data: any): ProductImage[] {
        const images: ProductImage[] = [];
        let order = 0;

        // Main images
        if (data.images) {
            for (const img of data.images) {
                images.push({
                    url: img.url || img.src,
                    thumbnailUrl: img.thumbnail,
                    type: img.type || 'product',
                    angle: img.angle,
                    order: order++,
                    alt: img.alt,
                    width: img.width,
                    height: img.height,
                });
            }
        }

        // Gallery images
        if (data.galleryImages) {
            for (const img of data.galleryImages) {
                images.push({
                    url: img.url || img.src,
                    type: 'product',
                    order: order++,
                });
            }
        }

        return images;
    }

    private static extractVideos(data: any): any[] | undefined {
        if (!data.videos || data.videos.length === 0) return undefined;
        
        return data.videos.map((video: any) => ({
            url: video.url,
            thumbnailUrl: video.thumbnail,
            type: video.type || 'product',
            duration: video.duration,
            format: video.format,
        }));
    }

    private static extractThumbnail(data: any): string {
        return data.thumbnail || 
               data.mainImage || 
               data.defaultImage || 
               (data.images && data.images[0]?.url) || 
               '';
    }

    private static isInStock(data: any): boolean {
        return data.inStock || 
               data.availability === 'InStock' || 
               data.stock?.level > 0 || 
               false;
    }

    private static getStockLevel(data: any): 'low' | 'medium' | 'high' | 'out' | undefined {
        if (!this.isInStock(data)) return 'out';
        if (data.stockLevel) return data.stockLevel;
        if (data.stock?.level < 10) return 'low';
        if (data.stock?.level < 50) return 'medium';
        return 'high';
    }

    private static extractStoreAvailability(data: any): StoreInfo[] | undefined {
        if (!data.storeAvailability || data.storeAvailability.length === 0) return undefined;
        
        return data.storeAvailability.map((store: any) => ({
            storeId: store.storeId,
            storeName: store.name,
            address: store.address,
            city: store.city,
            availableSizes: store.availableSizes || [],
            stockLevel: store.stockLevel || 'medium',
            distance: store.distance,
        }));
    }

    private static extractKeywords($: any): string[] | undefined {
        const keywords = $('meta[name="keywords"]').attr('content');
        if (!keywords) return undefined;
        return keywords.split(',').map((k: string) => k.trim());
    }

    private static extractBadges(data: any): string[] | undefined {
        const badges: string[] = [];
        if (data.isNew || data.newProduct) badges.push('New');
        if (data.isBestseller || data.bestseller) badges.push('Bestseller');
        if (data.isPremium) badges.push('Premium');
        if (data.isExclusive) badges.push('Exclusive');
        if (data.isTrending) badges.push('Trending');
        if (data.badges) badges.push(...data.badges);
        return badges.length > 0 ? badges : undefined;
    }

    private static extractDimensions(data: any): any {
        if (!data.dimensions) return undefined;
        return {
            length: data.dimensions.length,
            width: data.dimensions.width,
            height: data.dimensions.height,
            unit: data.dimensions.unit || 'cm',
        };
    }

    private static extractModelInfo(data: any): any {
        if (!data.modelInfo && !data.model) return undefined;
        return {
            height: data.modelInfo?.height || data.model?.height,
            size: data.modelInfo?.wearingSize || data.model?.size,
            notes: data.modelInfo?.notes || data.model?.fitNotes,
        };
    }

    private static extractRelatedProducts(data: any): string[] | undefined {
        const related: string[] = [];
        if (data.relatedProducts) related.push(...data.relatedProducts);
        if (data.recommendations?.related) related.push(...data.recommendations.related);
        return related.length > 0 ? related : undefined;
    }

    private static extractOutfitProducts(data: any): string[] | undefined {
        const outfit: string[] = [];
        if (data.completeTheLook) outfit.push(...data.completeTheLook);
        if (data.outfitProducts) outfit.push(...data.outfitProducts);
        if (data.styleWith) outfit.push(...data.styleWith);
        return outfit.length > 0 ? outfit : undefined;
    }

    private static extractSimilarProducts(data: any): string[] | undefined {
        const similar: string[] = [];
        if (data.similarProducts) similar.push(...data.similarProducts);
        if (data.recommendations?.similar) similar.push(...data.recommendations.similar);
        return similar.length > 0 ? similar : undefined;
    }

    private static extractPromotions(data: any): Promotion[] | undefined {
        const promos: Promotion[] = [];
        
        if (data.promotions) {
            for (const promo of data.promotions) {
                promos.push({
                    type: promo.type || 'percentage',
                    description: promo.description || promo.text,
                    description_original: promo.localDescription,
                    code: promo.code,
                    validUntil: promo.endDate,
                    conditions: promo.conditions,
                });
            }
        }
        
        return promos.length > 0 ? promos : undefined;
    }

    private static extractBulkPricing(data: any): any[] | undefined {
        if (!data.bulkPricing || data.bulkPricing.length === 0) return undefined;
        
        return data.bulkPricing.map((bulk: any) => ({
            quantity: bulk.quantity,
            price: bulk.price,
            saveAmount: bulk.saveAmount,
            savePercentage: bulk.savePercentage,
        }));
    }
}