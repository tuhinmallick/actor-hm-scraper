import { Actor } from 'apify';
import { log } from 'crawlee';
import { ProductData, cleanAndValidateProduct, deduplicateProducts, filterByQuality } from './data_validation.js';

/**
 * Progressive data saving system
 * Saves data as it's scraped to prevent data loss and improve performance
 */

export interface SaveConfig {
    batchSize: number;
    saveInterval: number; // milliseconds
    maxRetries: number;
    enableCompression: boolean;
    enableDeduplication: boolean;
    minQualityScore: number;
}

export const DEFAULT_SAVE_CONFIG: SaveConfig = {
    batchSize: 50,
    saveInterval: 30000, // 30 seconds
    maxRetries: 3,
    enableCompression: true,
    enableDeduplication: true,
    minQualityScore: 70,
};

/**
 * Progressive data saver class
 */
export class ProgressiveDataSaver {
    private buffer: ProductData[] = [];
    private lastSaveTime = Date.now();
    private saveInProgress = false;
    private totalSaved = 0;
    private config: SaveConfig;
    private saveTimer?: NodeJS.Timeout;
    
    constructor(config: Partial<SaveConfig> = {}) {
        this.config = { ...DEFAULT_SAVE_CONFIG, ...config };
        this.startPeriodicSave();
    }
    
    /**
     * Add product to buffer
     */
    async addProduct(rawProduct: any): Promise<boolean> {
        try {
            // Clean and validate product
            const cleanedProduct = cleanAndValidateProduct(rawProduct);
            if (!cleanedProduct) {
                log.warning('Product validation failed, skipping:', rawProduct);
                return false;
            }
            
            // Add to buffer
            this.buffer.push(cleanedProduct);
            log.debug(`Added product to buffer: ${cleanedProduct.productName} (${cleanedProduct.articleNo})`);
            
            // Check if we should save immediately
            if (this.buffer.length >= this.config.batchSize) {
                await this.saveBuffer();
            }
            
            return true;
        } catch (error: any) {
            log.error('Error adding product to buffer:', error);
            return false;
        }
    }
    
    /**
     * Save buffer to dataset
     */
    private async saveBuffer(): Promise<void> {
        if (this.saveInProgress || this.buffer.length === 0) {
            return;
        }
        
        this.saveInProgress = true;
        
        try {
            let productsToSave = [...this.buffer];
            
            // Apply quality filtering
            if (this.config.minQualityScore > 0) {
                productsToSave = filterByQuality(productsToSave, this.config.minQualityScore);
            }
            
            // Apply deduplication
            if (this.config.enableDeduplication) {
                productsToSave = deduplicateProducts(productsToSave);
            }
            
            if (productsToSave.length === 0) {
                log.info('No products to save after filtering');
                this.buffer = [];
                return;
            }
            
            // Save to Apify dataset
            await Actor.pushData(productsToSave);
            
            this.totalSaved += productsToSave.length;
            this.buffer = [];
            this.lastSaveTime = Date.now();
            
            log.info(`Saved ${productsToSave.length} products to dataset (total: ${this.totalSaved})`);
            
        } catch (error: any) {
            log.error('Error saving buffer to dataset:', error);
            
            // Retry with exponential backoff
            await this.retrySave();
        } finally {
            this.saveInProgress = false;
        }
    }
    
    /**
     * Retry save with exponential backoff
     */
    private async retrySave(): Promise<void> {
        for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
            try {
                const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
                log.info(`Retrying save in ${delay}ms (attempt ${attempt}/${this.config.maxRetries})`);
                
                await new Promise(resolve => setTimeout(resolve, delay));
                await Actor.pushData(this.buffer);
                
                this.totalSaved += this.buffer.length;
                this.buffer = [];
                this.lastSaveTime = Date.now();
                
                log.info(`Retry save successful: ${this.buffer.length} products saved`);
                return;
                
            } catch (error: any) {
                log.error(`Retry attempt ${attempt} failed:`, error);
                
                if (attempt === this.config.maxRetries) {
                    log.error('All retry attempts failed, data may be lost');
                    // Could implement fallback to local storage here
                }
            }
        }
    }
    
    /**
     * Start periodic save timer
     */
    private startPeriodicSave(): void {
        this.saveTimer = setInterval(async () => {
            const timeSinceLastSave = Date.now() - this.lastSaveTime;
            
            if (timeSinceLastSave >= this.config.saveInterval && this.buffer.length > 0) {
                log.info('Periodic save triggered');
                await this.saveBuffer();
            }
        }, this.config.saveInterval);
    }
    
    /**
     * Force save all buffered data
     */
    async forceSave(): Promise<void> {
        log.info('Force saving all buffered data');
        await this.saveBuffer();
    }
    
    /**
     * Get statistics
     */
    getStats(): { bufferSize: number; totalSaved: number; lastSaveTime: number } {
        return {
            bufferSize: this.buffer.length,
            totalSaved: this.totalSaved,
            lastSaveTime: this.lastSaveTime,
        };
    }
    
    /**
     * Cleanup resources
     */
    async cleanup(): Promise<void> {
        if (this.saveTimer) {
            clearInterval(this.saveTimer);
        }
        
        // Save any remaining data
        if (this.buffer.length > 0) {
            log.info('Cleaning up: saving remaining buffered data');
            await this.forceSave();
        }
    }
}

/**
 * Global progressive data saver instance
 */
export const progressiveDataSaver = new ProgressiveDataSaver();

/**
 * Enhanced data saving with compression and optimization
 */
export const saveProductsOptimized = async (products: ProductData[]): Promise<void> => {
    try {
        // Compress data if enabled
        let dataToSave = products;
        
        if (progressiveDataSaver['config'].enableCompression) {
            // Remove unnecessary fields for compression
            dataToSave = products.map(product => ({
                ...product,
                // Remove redundant fields or compress them
                timestamp: product.timestamp.substring(0, 10), // Store only date
            }));
        }
        
        // Save in batches to avoid memory issues
        const batchSize = progressiveDataSaver['config'].batchSize;
        for (let i = 0; i < dataToSave.length; i += batchSize) {
            const batch = dataToSave.slice(i, i + batchSize);
            await Actor.pushData(batch);
            
            log.debug(`Saved batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(dataToSave.length / batchSize)}`);
        }
        
        log.info(`Successfully saved ${products.length} products`);
        
    } catch (error: any) {
        log.error('Error saving products:', error);
        throw error;
    }
};

/**
 * Data persistence and recovery
 */
export class DataPersistence {
    private static readonly PERSISTENCE_KEY = 'SCRAPER_PERSISTENCE';
    
    /**
     * Save current state for recovery
     */
    static async saveState(state: any): Promise<void> {
        try {
            await Actor.setValue(this.PERSISTENCE_KEY, {
                ...state,
                timestamp: new Date().toISOString(),
            });
        } catch (error: any) {
            log.warning('Could not save persistence state:', error);
        }
    }
    
    /**
     * Load saved state for recovery
     */
    static async loadState(): Promise<any | null> {
        try {
            const state = await Actor.getValue(this.PERSISTENCE_KEY);
            return state;
        } catch (error: any) {
            log.warning('Could not load persistence state:', error);
            return null;
        }
    }
    
    /**
     * Clear saved state
     */
    static async clearState(): Promise<void> {
        try {
            await Actor.setValue(this.PERSISTENCE_KEY, null);
        } catch (error: any) {
            log.warning('Could not clear persistence state:', error);
        }
    }
}

/**
 * Memory optimization for large datasets
 */
export class MemoryOptimizer {
    private static readonly MAX_MEMORY_USAGE = 100 * 1024 * 1024; // 100MB
    
    /**
     * Check memory usage and trigger cleanup if needed
     */
    static checkMemoryUsage(): void {
        const usage = process.memoryUsage();
        const heapUsed = usage.heapUsed;
        
        if (heapUsed > this.MAX_MEMORY_USAGE) {
            log.warning(`High memory usage detected: ${Math.round(heapUsed / 1024 / 1024)}MB`);
            
            // Force garbage collection if available
            if (global.gc) {
                global.gc();
                log.info('Garbage collection triggered');
            }
            
            // Force save any buffered data
            progressiveDataSaver.forceSave().catch(error => {
                log.error('Error during memory cleanup save:', error);
            });
        }
    }
    
    /**
     * Start memory monitoring
     */
    static startMonitoring(): void {
        setInterval(() => {
            this.checkMemoryUsage();
        }, 30000); // Check every 30 seconds
    }
}

/**
 * Data quality monitoring
 */
export class DataQualityMonitor {
    private static qualityMetrics = {
        totalProcessed: 0,
        validProducts: 0,
        invalidProducts: 0,
        averageQualityScore: 0,
        qualityScores: [] as number[],
    };
    
    /**
     * Record product quality
     */
    static recordProduct(_product: ProductData, isValid: boolean, qualityScore: number): void {
        this.qualityMetrics.totalProcessed++;
        
        if (isValid) {
            this.qualityMetrics.validProducts++;
            this.qualityMetrics.qualityScores.push(qualityScore);
            
            // Update average quality score
            const totalScore = this.qualityMetrics.qualityScores.reduce((sum, score) => sum + score, 0);
            this.qualityMetrics.averageQualityScore = totalScore / this.qualityMetrics.qualityScores.length;
        } else {
            this.qualityMetrics.invalidProducts++;
        }
    }
    
    /**
     * Get quality metrics
     */
    static getMetrics() {
        return { ...this.qualityMetrics };
    }
    
    /**
     * Log quality report
     */
    static logQualityReport(): void {
        const metrics = this.getMetrics();
        const successRate = metrics.totalProcessed > 0 ? (metrics.validProducts / metrics.totalProcessed) * 100 : 0;
        
        log.info('Data Quality Report:', {
            totalProcessed: metrics.totalProcessed,
            validProducts: metrics.validProducts,
            invalidProducts: metrics.invalidProducts,
            successRate: `${successRate.toFixed(2)}%`,
            averageQualityScore: metrics.averageQualityScore.toFixed(2),
        });
    }
}