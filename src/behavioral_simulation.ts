import { log } from 'crawlee';

/**
 * Advanced Behavioral Simulation System
 * Implements human-like browsing patterns and interactions
 */

interface BehavioralState {
    isReading: boolean;
    isScrolling: boolean;
    isClicking: boolean;
    currentElement: string | null;
    attentionLevel: number;
    fatigueLevel: number;
    multitaskingLevel: number;
    lastActivity: number;
    sessionDuration: number;
}

interface InteractionPattern {
    mouseMovements: MouseMovement[];
    scrollPatterns: ScrollPattern[];
    clickPatterns: ClickPattern[];
    focusPatterns: FocusPattern[];
    timingPatterns: TimingPattern;
}

interface MouseMovement {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    duration: number;
    curve: 'linear' | 'bezier' | 'natural';
    speed: number;
}

interface ScrollPattern {
    direction: 'up' | 'down' | 'left' | 'right';
    distance: number;
    speed: number;
    pauses: number[];
    duration: number;
}

interface ClickPattern {
    element: string;
    position: { x: number; y: number };
    delay: number;
    doubleClick: boolean;
    contextMenu: boolean;
}

interface FocusPattern {
    element: string;
    duration: number;
    keystrokes: Keystroke[];
    tabSwitches: number;
}

interface TimingPattern {
    readingTime: number;
    thinkingTime: number;
    reactionTime: number;
    attentionSpan: number;
    breakFrequency: number;
}

interface Keystroke {
    key: string;
    timestamp: number;
    duration: number;
    accuracy: number;
}

class AdvancedBehavioralSimulator {
    private behavioralState: BehavioralState;
    private interactionPattern: InteractionPattern;
    private sessionStartTime: number;
    private activityHistory: ActivityRecord[] = [];
    
    constructor() {
        this.sessionStartTime = Date.now();
        this.behavioralState = this.initializeBehavioralState();
        this.interactionPattern = this.generateInteractionPattern();
    }
    
    private initializeBehavioralState(): BehavioralState {
        return {
            isReading: false,
            isScrolling: false,
            isClicking: false,
            currentElement: null,
            attentionLevel: 0.8 + Math.random() * 0.2, // 0.8-1.0
            fatigueLevel: Math.random() * 0.3, // 0-0.3
            multitaskingLevel: Math.random() * 0.4, // 0-0.4
            lastActivity: Date.now(),
            sessionDuration: 0
        };
    }
    
    private generateInteractionPattern(): InteractionPattern {
        return {
            mouseMovements: this.generateMousePatterns(),
            scrollPatterns: this.generateScrollPatterns(),
            clickPatterns: this.generateClickPatterns(),
            focusPatterns: this.generateFocusPatterns(),
            timingPatterns: this.generateTimingPatterns()
        };
    }
    
    private generateMousePatterns(): MouseMovement[] {
        const patterns: MouseMovement[] = [];
        
        // Generate realistic mouse movement patterns
        for (let i = 0; i < 10; i++) {
            patterns.push({
                startX: Math.random() * 1920,
                startY: Math.random() * 1080,
                endX: Math.random() * 1920,
                endY: Math.random() * 1080,
                duration: 200 + Math.random() * 800, // 200-1000ms
                curve: Math.random() > 0.7 ? 'bezier' : 'natural',
                speed: 0.5 + Math.random() * 0.5 // 0.5-1.0
            });
        }
        
        return patterns;
    }
    
    private generateScrollPatterns(): ScrollPattern[] {
        const patterns: ScrollPattern[] = [];
        
        for (let i = 0; i < 5; i++) {
            patterns.push({
                direction: Math.random() > 0.5 ? 'down' : 'up',
                distance: 100 + Math.random() * 500, // 100-600px
                speed: 0.3 + Math.random() * 0.4, // 0.3-0.7
                pauses: this.generateScrollPauses(),
                duration: 1000 + Math.random() * 2000 // 1-3 seconds
            });
        }
        
        return patterns;
    }
    
    private generateScrollPauses(): number[] {
        const pauses: number[] = [];
        const pauseCount = Math.floor(Math.random() * 3) + 1; // 1-3 pauses
        
        for (let i = 0; i < pauseCount; i++) {
            pauses.push(Math.random() * 1000); // 0-1000ms pause
        }
        
        return pauses.sort((a, b) => a - b);
    }
    
    private generateClickPatterns(): ClickPattern[] {
        const patterns: ClickPattern[] = [];
        
        for (let i = 0; i < 8; i++) {
            patterns.push({
                element: this.getRandomElement(),
                position: { x: Math.random() * 1920, y: Math.random() * 1080 },
                delay: 50 + Math.random() * 200, // 50-250ms
                doubleClick: Math.random() > 0.9, // 10% chance
                contextMenu: Math.random() > 0.95 // 5% chance
            });
        }
        
        return patterns;
    }
    
    private getRandomElement(): string {
        const elements = [
            'a', 'button', 'div', 'span', 'img', 'input', 'select', 'textarea',
            '.product-item', '.price', '.title', '.image', '.description',
            '.add-to-cart', '.size-selector', '.color-selector', '.quantity'
        ];
        return elements[Math.floor(Math.random() * elements.length)];
    }
    
    private generateFocusPatterns(): FocusPattern[] {
        const patterns: FocusPattern[] = [];
        
        for (let i = 0; i < 6; i++) {
            patterns.push({
                element: this.getRandomElement(),
                duration: 2000 + Math.random() * 5000, // 2-7 seconds
                keystrokes: this.generateKeystrokes(),
                tabSwitches: Math.floor(Math.random() * 3) // 0-2 tab switches
            });
        }
        
        return patterns;
    }
    
    private generateKeystrokes(): Keystroke[] {
        const keystrokes: Keystroke[] = [];
        const keyCount = Math.floor(Math.random() * 10) + 1; // 1-10 keystrokes
        
        for (let i = 0; i < keyCount; i++) {
            keystrokes.push({
                key: this.getRandomKey(),
                timestamp: i * (50 + Math.random() * 100), // 50-150ms between keys
                duration: 20 + Math.random() * 80, // 20-100ms key press
                accuracy: 0.85 + Math.random() * 0.15 // 85-100% accuracy
            });
        }
        
        return keystrokes;
    }
    
    private getRandomKey(): string {
        const keys = [
            'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
            'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
            '1', '2', '3', '4', '5', '6', '7', '8', '9', '0',
            'Backspace', 'Enter', 'Tab', 'Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'
        ];
        return keys[Math.floor(Math.random() * keys.length)];
    }
    
    private generateTimingPatterns(): TimingPattern {
        return {
            readingTime: 2000 + Math.random() * 4000, // 2-6 seconds
            thinkingTime: 500 + Math.random() * 1500, // 0.5-2 seconds
            reactionTime: 200 + Math.random() * 300, // 200-500ms
            attentionSpan: 10000 + Math.random() * 20000, // 10-30 seconds
            breakFrequency: 0.1 + Math.random() * 0.2 // 10-30% chance
        };
    }
    
    /**
     * Simulate realistic page interaction
     */
    async simulatePageInteraction(page: any, url: string): Promise<void> {
        try {
            const session = await this.getSessionInfo();
            const interactionType = this.determineInteractionType(url);
            
            log.debug(`Simulating ${interactionType} interaction for ${url}`);
            
            switch (interactionType) {
                case 'product_page':
                    await this.simulateProductPageInteraction(page);
                    break;
                case 'category_page':
                    await this.simulateCategoryPageInteraction(page);
                    break;
                case 'navigation':
                    await this.simulateNavigationInteraction(page);
                    break;
                case 'api_call':
                    await this.simulateApiInteraction(page);
                    break;
                default:
                    await this.simulateGenericInteraction(page);
            }
            
            this.updateBehavioralState();
            this.recordActivity(url, interactionType, true);
            
        } catch (error: any) {
            log.warning('Behavioral simulation failed:', error);
            this.recordActivity(url, 'error', false);
        }
    }
    
    private determineInteractionType(url: string): string {
        if (url.includes('/produkte/') || url.includes('/products/')) {
            return 'product_page';
        } else if (url.includes('/apis/') || url.includes('/api/')) {
            return 'api_call';
        } else if (url.includes('/navigation/')) {
            return 'navigation';
        } else if (url.includes('/kategorien/') || url.includes('/categories/')) {
            return 'category_page';
        }
        return 'generic';
    }
    
    private async simulateProductPageInteraction(page: any): Promise<void> {
        // Simulate reading product information
        await this.simulateReading(page, 3000 + Math.random() * 4000);
        
        // Simulate scrolling to see product details
        await this.simulateScrolling(page, 'down', 200 + Math.random() * 300);
        
        // Simulate hovering over product images
        await this.simulateHovering(page, '.product-image', 1000 + Math.random() * 2000);
        
        // Simulate checking size/color options
        await this.simulateElementInteraction(page, '.size-selector');
        await this.simulateElementInteraction(page, '.color-selector');
        
        // Simulate reading description
        await this.simulateReading(page, 2000 + Math.random() * 3000);
        
        // Simulate scrolling to reviews
        await this.simulateScrolling(page, 'down', 100 + Math.random() * 200);
        
        // Simulate brief pause (thinking)
        await this.simulatePause(500 + Math.random() * 1000);
    }
    
    private async simulateCategoryPageInteraction(page: any): Promise<void> {
        // Simulate scanning product grid
        await this.simulateReading(page, 2000 + Math.random() * 3000);
        
        // Simulate scrolling through products
        for (let i = 0; i < 3 + Math.random() * 3; i++) {
            await this.simulateScrolling(page, 'down', 150 + Math.random() * 200);
            await this.simulatePause(200 + Math.random() * 500);
        }
        
        // Simulate hovering over products
        await this.simulateHovering(page, '.product-item', 800 + Math.random() * 1200);
    }
    
    private async simulateNavigationInteraction(page: any): Promise<void> {
        // Quick navigation - minimal interaction
        await this.simulateReading(page, 500 + Math.random() * 1000);
        await this.simulatePause(200 + Math.random() * 500);
    }
    
    private async simulateApiInteraction(_page: any): Promise<void> {
        // API calls - very minimal interaction
        await this.simulatePause(100 + Math.random() * 200);
    }
    
    private async simulateGenericInteraction(page: any): Promise<void> {
        // Generic page interaction
        await this.simulateReading(page, 1000 + Math.random() * 2000);
        await this.simulateScrolling(page, 'down', 100 + Math.random() * 200);
        await this.simulatePause(300 + Math.random() * 700);
    }
    
    private async simulateReading(page: any, duration: number): Promise<void> {
        this.behavioralState.isReading = true;
        
        // Simulate eye movement patterns
        await page.evaluate((duration: number) => {
            const startTime = Date.now();
            const interval = setInterval(() => {
                if (Date.now() - startTime > duration) {
                    clearInterval(interval);
                    return;
                }
                
                // Simulate eye movement
                const event = new MouseEvent('mousemove', {
                    clientX: Math.random() * window.innerWidth,
                    clientY: Math.random() * window.innerHeight,
                });
                document.dispatchEvent(event);
            }, 200 + Math.random() * 300);
        }, duration);
        
        await new Promise(resolve => setTimeout(resolve, duration));
        this.behavioralState.isReading = false;
    }
    
    private async simulateScrolling(page: any, direction: 'up' | 'down' | 'left' | 'right', distance: number): Promise<void> {
        this.behavioralState.isScrolling = true;
        
        await page.evaluate((direction: string, distance: number) => {
            const scrollStep = 20;
            const steps = Math.ceil(distance / scrollStep);
            const stepDelay = 50 + Math.random() * 50; // 50-100ms per step
            
            let currentStep = 0;
            const scrollInterval = setInterval(() => {
                if (currentStep >= steps) {
                    clearInterval(scrollInterval);
                    return;
                }
                
                switch (direction) {
                    case 'down':
                        window.scrollBy(0, scrollStep);
                        break;
                    case 'up':
                        window.scrollBy(0, -scrollStep);
                        break;
                    case 'left':
                        window.scrollBy(-scrollStep, 0);
                        break;
                    case 'right':
                        window.scrollBy(scrollStep, 0);
                        break;
                }
                
                currentStep++;
            }, stepDelay);
        }, direction, distance);
        
        await new Promise(resolve => setTimeout(resolve, distance * 2)); // Wait for scroll completion
        this.behavioralState.isScrolling = false;
    }
    
    private async simulateHovering(page: any, selector: string, duration: number): Promise<void> {
        try {
            await page.evaluate((selector: string, duration: number) => {
                const element = document.querySelector(selector);
                if (element) {
                    const rect = element.getBoundingClientRect();
                    const event = new MouseEvent('mouseover', {
                        clientX: rect.left + rect.width / 2,
                        clientY: rect.top + rect.height / 2,
                    });
                    element.dispatchEvent(event);
                    
                    setTimeout(() => {
                        const leaveEvent = new MouseEvent('mouseout', {
                            clientX: rect.left + rect.width / 2,
                            clientY: rect.top + rect.height / 2,
                        });
                        element.dispatchEvent(leaveEvent);
                    }, duration);
                }
            }, selector, duration);
            
            await new Promise(resolve => setTimeout(resolve, duration));
        } catch (error: any) {
            log.debug('Hover simulation failed:', error);
        }
    }
    
    private async simulateElementInteraction(page: any, selector: string): Promise<void> {
        try {
            await page.evaluate((selector: string) => {
                const element = document.querySelector(selector);
                if (element) {
                    // Simulate focus
                    (element as HTMLElement).focus();
                    
                    // Simulate click
                    const clickEvent = new MouseEvent('click', {
                        clientX: element.getBoundingClientRect().left + element.getBoundingClientRect().width / 2,
                        clientY: element.getBoundingClientRect().top + element.getBoundingClientRect().height / 2,
                    });
                    element.dispatchEvent(clickEvent);
                }
            }, selector);
            
            await this.simulatePause(200 + Math.random() * 500);
        } catch (error: any) {
            log.debug('Element interaction simulation failed:', error);
        }
    }
    
    private async simulatePause(duration: number): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, duration));
    }
    
    private updateBehavioralState(): void {
        const now = Date.now();
        this.behavioralState.sessionDuration = now - this.sessionStartTime;
        this.behavioralState.lastActivity = now;
        
        // Update fatigue level based on session duration
        const fatigueIncrease = (now - this.sessionStartTime) / 3600000; // Increase per hour
        this.behavioralState.fatigueLevel = Math.min(this.behavioralState.fatigueLevel + fatigueIncrease, 1.0);
        
        // Update attention level based on fatigue
        this.behavioralState.attentionLevel = Math.max(0.3, 1.0 - this.behavioralState.fatigueLevel);
    }
    
    private recordActivity(url: string, type: string, success: boolean): void {
        this.activityHistory.push({
            url,
            type,
            success,
            timestamp: Date.now(),
            behavioralState: { ...this.behavioralState }
        });
        
        // Keep only last 100 activities
        if (this.activityHistory.length > 100) {
            this.activityHistory.shift();
        }
    }
    
    private async getSessionInfo(): Promise<any> {
        return {
            sessionDuration: this.behavioralState.sessionDuration,
            attentionLevel: this.behavioralState.attentionLevel,
            fatigueLevel: this.behavioralState.fatigueLevel,
            activityCount: this.activityHistory.length
        };
    }
    
    getStats() {
        return {
            sessionDuration: this.behavioralState.sessionDuration,
            activityCount: this.activityHistory.length,
            successRate: this.activityHistory.filter(a => a.success).length / this.activityHistory.length,
            attentionLevel: this.behavioralState.attentionLevel,
            fatigueLevel: this.behavioralState.fatigueLevel,
            currentState: this.behavioralState
        };
    }
}

interface ActivityRecord {
    url: string;
    type: string;
    success: boolean;
    timestamp: number;
    behavioralState: BehavioralState;
}

// Global behavioral simulator
export const behavioralSimulator = new AdvancedBehavioralSimulator();

export { BehavioralState, InteractionPattern, AdvancedBehavioralSimulator };