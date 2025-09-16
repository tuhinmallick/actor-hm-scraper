import { Actor, ProxyConfiguration } from 'apify';
import { log } from 'crawlee';

/**
 * Apify Proxy Configuration for H&M Scraper
 * Handles proxy setup with proper rotation and country selection
 */

export interface ApifyProxyOptions {
    useApifyProxy?: boolean;
    apifyProxyGroups?: string[];
    apifyProxyCountry?: string;
    proxyUrls?: string[];
}

/**
 * Create Apify proxy configuration with smart defaults
 */
export async function createApifyProxyConfig(options: ApifyProxyOptions, marketCode?: string): Promise<ProxyConfiguration | undefined> {
    try {
        // If not using Apify proxy, check for custom proxies
        if (!options.useApifyProxy) {
            if (options.proxyUrls && options.proxyUrls.length > 0) {
                log.info('Using custom proxy URLs');
                return await Actor.createProxyConfiguration({
                    proxyUrls: options.proxyUrls,
                });
            }
            log.info('No proxy configuration requested');
            return undefined;
        }

        // Determine proxy country based on market
        const proxyCountry = options.apifyProxyCountry || getProxyCountryForMarket(marketCode);
        
        // Default proxy groups
        const proxyGroups = options.apifyProxyGroups || ['RESIDENTIAL', 'DATACENTER'];
        
        log.info(`Creating Apify proxy configuration:`, {
            groups: proxyGroups,
            country: proxyCountry,
        });

        const proxyConfig = await Actor.createProxyConfiguration({
            groups: proxyGroups,
            countryCode: proxyCountry,
        });

        if (!proxyConfig) {
            log.warning('Failed to create proxy configuration');
            return undefined;
        }

        // Log proxy URL for debugging (without credentials)
        const proxyUrl = await proxyConfig.newUrl();
        const sanitizedUrl = proxyUrl.replace(/:[^@]+@/, ':***@');
        log.info(`Proxy configured: ${sanitizedUrl}`);

        return proxyConfig;
    } catch (error) {
        log.error('Error creating proxy configuration:', error as any);
        return undefined;
    }
}

/**
 * Get appropriate proxy country for H&M market
 */
function getProxyCountryForMarket(marketCode?: string): string {
    if (!marketCode) return 'US';

    // Map H&M market codes to proxy countries
    const marketToProxyCountry: Record<string, string> = {
        // Europe
        'en_gb': 'GB',
        'de_de': 'DE',
        'fr_fr': 'FR',
        'es_es': 'ES',
        'it_it': 'IT',
        'nl_nl': 'NL',
        'sv_se': 'SE',
        'da_dk': 'DK',
        'no_no': 'NO',
        'fi_fi': 'FI',
        'de_at': 'AT',
        'fr_be': 'BE',
        'nl_be': 'BE',
        'de_ch': 'CH',
        'fr_ch': 'CH',
        'it_ch': 'CH',
        'pt_pt': 'PT',
        'en_ie': 'IE',
        'pl_pl': 'PL',
        'cs_cz': 'CZ',
        'hu_hu': 'HU',
        'ro_ro': 'RO',
        'sk_sk': 'SK',
        'bg_bg': 'BG',
        'hr_hr': 'HR',
        'sl_si': 'SI',
        'el_gr': 'GR',
        'tr_tr': 'TR',
        
        // Americas
        'en_us': 'US',
        'en_ca': 'CA',
        'fr_ca': 'CA',
        'es_mx': 'MX',
        'es_cl': 'CL',
        'es_pe': 'PE',
        'es_co': 'CO',
        
        // Asia Pacific
        'en_au': 'AU',
        'en_nz': 'NZ',
        'ja_jp': 'JP',
        'ko_kr': 'KR',
        'zh_cn': 'CN',
        'zh_hk': 'HK',
        'en_hk': 'HK',
        'zh_tw': 'TW',
        'en_sg': 'SG',
        'en_my': 'MY',
        'en_ph': 'PH',
        'th_th': 'TH',
        'vi_vn': 'VN',
        'en_in': 'IN',
        
        // Middle East & Africa
        'en_ae': 'AE',
        'ar_ae': 'AE',
        'en_sa': 'SA',
        'ar_sa': 'SA',
        'en_za': 'ZA',
        'he_il': 'IL',
    };

    return marketToProxyCountry[marketCode] || 'US';
}

/**
 * Smart proxy rotation based on response
 */
export async function shouldRotateProxy(response: any, proxyConfig?: ProxyConfiguration): Promise<boolean> {
    if (!proxyConfig) return false;

    // Check for blocking indicators
    const statusCode = response?.statusCode || response?.status;
    const isBlocked = statusCode === 403 || statusCode === 429;
    
    if (isBlocked) {
        log.warning(`Proxy blocked with status ${statusCode}, rotating...`);
        return true;
    }

    // Check for rate limiting
    const retryAfter = response?.headers?.['retry-after'];
    if (retryAfter) {
        log.warning(`Rate limited, retry after ${retryAfter}s, rotating proxy...`);
        return true;
    }

    // Check for captcha or challenge
    const body = response?.body || response?.text || '';
    const hasCaptcha = body.includes('captcha') || body.includes('challenge') || body.includes('cf-browser-verification');
    if (hasCaptcha) {
        log.warning('Captcha/challenge detected, rotating proxy...');
        return true;
    }

    return false;
}

/**
 * Get proxy statistics for monitoring
 */
export async function getProxyStats(proxyConfig?: ProxyConfiguration): Promise<any> {
    if (!proxyConfig) {
        return { enabled: false };
    }

    try {
        // Get current proxy URL (without exposing credentials)
        const proxyUrl = await proxyConfig.newUrl();
        const sanitizedUrl = proxyUrl.replace(/:[^@]+@/, ':***@');
        
        return {
            enabled: true,
            currentProxy: sanitizedUrl,
            // Add more stats if available from Apify SDK
        };
    } catch (error) {
        log.error('Error getting proxy stats:', error as any);
        return { enabled: true, error: 'Failed to get stats' };
    }
}