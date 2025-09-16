/**
 * Complete list of ALL H&M markets worldwide
 * Updated for 2024/2025
 */

export interface Market {
    code: string;
    name: string;
    language: string;
    currency: string;
    region: string;
    url: string;
    timezone: string;
    features?: string[]; // Special features available in this market
}

export const HM_MARKETS: Market[] = [
    // Europe
    {
        code: 'en_gb',
        name: 'United Kingdom',
        language: 'English',
        currency: 'GBP',
        region: 'Europe',
        url: 'https://www2.hm.com/en_gb',
        timezone: 'Europe/London',
        features: ['Click & Collect', 'Same Day Delivery']
    },
    {
        code: 'de_de',
        name: 'Germany',
        language: 'German',
        currency: 'EUR',
        region: 'Europe',
        url: 'https://www2.hm.com/de_de',
        timezone: 'Europe/Berlin',
        features: ['Click & Collect', 'Express Delivery']
    },
    {
        code: 'fr_fr',
        name: 'France',
        language: 'French',
        currency: 'EUR',
        region: 'Europe',
        url: 'https://www2.hm.com/fr_fr',
        timezone: 'Europe/Paris',
        features: ['Click & Collect']
    },
    {
        code: 'es_es',
        name: 'Spain',
        language: 'Spanish',
        currency: 'EUR',
        region: 'Europe',
        url: 'https://www2.hm.com/es_es',
        timezone: 'Europe/Madrid'
    },
    {
        code: 'it_it',
        name: 'Italy',
        language: 'Italian',
        currency: 'EUR',
        region: 'Europe',
        url: 'https://www2.hm.com/it_it',
        timezone: 'Europe/Rome'
    },
    {
        code: 'nl_nl',
        name: 'Netherlands',
        language: 'Dutch',
        currency: 'EUR',
        region: 'Europe',
        url: 'https://www2.hm.com/nl_nl',
        timezone: 'Europe/Amsterdam',
        features: ['Click & Collect']
    },
    {
        code: 'sv_se',
        name: 'Sweden',
        language: 'Swedish',
        currency: 'SEK',
        region: 'Europe',
        url: 'https://www2.hm.com/sv_se',
        timezone: 'Europe/Stockholm',
        features: ['Click & Collect', 'Garment Collecting']
    },
    {
        code: 'da_dk',
        name: 'Denmark',
        language: 'Danish',
        currency: 'DKK',
        region: 'Europe',
        url: 'https://www2.hm.com/da_dk',
        timezone: 'Europe/Copenhagen'
    },
    {
        code: 'no_no',
        name: 'Norway',
        language: 'Norwegian',
        currency: 'NOK',
        region: 'Europe',
        url: 'https://www2.hm.com/no_no',
        timezone: 'Europe/Oslo'
    },
    {
        code: 'fi_fi',
        name: 'Finland',
        language: 'Finnish',
        currency: 'EUR',
        region: 'Europe',
        url: 'https://www2.hm.com/fi_fi',
        timezone: 'Europe/Helsinki'
    },
    {
        code: 'de_at',
        name: 'Austria',
        language: 'German',
        currency: 'EUR',
        region: 'Europe',
        url: 'https://www2.hm.com/de_at',
        timezone: 'Europe/Vienna'
    },
    {
        code: 'fr_be',
        name: 'Belgium (French)',
        language: 'French',
        currency: 'EUR',
        region: 'Europe',
        url: 'https://www2.hm.com/fr_be',
        timezone: 'Europe/Brussels'
    },
    {
        code: 'nl_be',
        name: 'Belgium (Dutch)',
        language: 'Dutch',
        currency: 'EUR',
        region: 'Europe',
        url: 'https://www2.hm.com/nl_be',
        timezone: 'Europe/Brussels'
    },
    {
        code: 'de_ch',
        name: 'Switzerland (German)',
        language: 'German',
        currency: 'CHF',
        region: 'Europe',
        url: 'https://www2.hm.com/de_ch',
        timezone: 'Europe/Zurich'
    },
    {
        code: 'fr_ch',
        name: 'Switzerland (French)',
        language: 'French',
        currency: 'CHF',
        region: 'Europe',
        url: 'https://www2.hm.com/fr_ch',
        timezone: 'Europe/Zurich'
    },
    {
        code: 'it_ch',
        name: 'Switzerland (Italian)',
        language: 'Italian',
        currency: 'CHF',
        region: 'Europe',
        url: 'https://www2.hm.com/it_ch',
        timezone: 'Europe/Zurich'
    },
    {
        code: 'pt_pt',
        name: 'Portugal',
        language: 'Portuguese',
        currency: 'EUR',
        region: 'Europe',
        url: 'https://www2.hm.com/pt_pt',
        timezone: 'Europe/Lisbon'
    },
    {
        code: 'en_ie',
        name: 'Ireland',
        language: 'English',
        currency: 'EUR',
        region: 'Europe',
        url: 'https://www2.hm.com/en_ie',
        timezone: 'Europe/Dublin'
    },
    {
        code: 'pl_pl',
        name: 'Poland',
        language: 'Polish',
        currency: 'PLN',
        region: 'Europe',
        url: 'https://www2.hm.com/pl_pl',
        timezone: 'Europe/Warsaw'
    },
    {
        code: 'cs_cz',
        name: 'Czech Republic',
        language: 'Czech',
        currency: 'CZK',
        region: 'Europe',
        url: 'https://www2.hm.com/cs_cz',
        timezone: 'Europe/Prague'
    },
    {
        code: 'hu_hu',
        name: 'Hungary',
        language: 'Hungarian',
        currency: 'HUF',
        region: 'Europe',
        url: 'https://www2.hm.com/hu_hu',
        timezone: 'Europe/Budapest'
    },
    {
        code: 'ro_ro',
        name: 'Romania',
        language: 'Romanian',
        currency: 'RON',
        region: 'Europe',
        url: 'https://www2.hm.com/ro_ro',
        timezone: 'Europe/Bucharest'
    },
    {
        code: 'sk_sk',
        name: 'Slovakia',
        language: 'Slovak',
        currency: 'EUR',
        region: 'Europe',
        url: 'https://www2.hm.com/sk_sk',
        timezone: 'Europe/Bratislava'
    },
    {
        code: 'bg_bg',
        name: 'Bulgaria',
        language: 'Bulgarian',
        currency: 'BGN',
        region: 'Europe',
        url: 'https://www2.hm.com/bg_bg',
        timezone: 'Europe/Sofia'
    },
    {
        code: 'hr_hr',
        name: 'Croatia',
        language: 'Croatian',
        currency: 'EUR',
        region: 'Europe',
        url: 'https://www2.hm.com/hr_hr',
        timezone: 'Europe/Zagreb'
    },
    {
        code: 'sl_si',
        name: 'Slovenia',
        language: 'Slovenian',
        currency: 'EUR',
        region: 'Europe',
        url: 'https://www2.hm.com/sl_si',
        timezone: 'Europe/Ljubljana'
    },
    {
        code: 'el_gr',
        name: 'Greece',
        language: 'Greek',
        currency: 'EUR',
        region: 'Europe',
        url: 'https://www2.hm.com/el_gr',
        timezone: 'Europe/Athens'
    },
    {
        code: 'tr_tr',
        name: 'Turkey',
        language: 'Turkish',
        currency: 'TRY',
        region: 'Europe',
        url: 'https://www2.hm.com/tr_tr',
        timezone: 'Europe/Istanbul'
    },
    {
        code: 'ru_ru',
        name: 'Russia',
        language: 'Russian',
        currency: 'RUB',
        region: 'Europe',
        url: 'https://www2.hm.com/ru_ru',
        timezone: 'Europe/Moscow',
        features: ['Currently Limited']
    },
    
    // Americas
    {
        code: 'en_us',
        name: 'United States',
        language: 'English',
        currency: 'USD',
        region: 'Americas',
        url: 'https://www2.hm.com/en_us',
        timezone: 'America/New_York',
        features: ['Same Day Delivery', 'Find in Store']
    },
    {
        code: 'en_ca',
        name: 'Canada (English)',
        language: 'English',
        currency: 'CAD',
        region: 'Americas',
        url: 'https://www2.hm.com/en_ca',
        timezone: 'America/Toronto'
    },
    {
        code: 'fr_ca',
        name: 'Canada (French)',
        language: 'French',
        currency: 'CAD',
        region: 'Americas',
        url: 'https://www2.hm.com/fr_ca',
        timezone: 'America/Toronto'
    },
    {
        code: 'es_mx',
        name: 'Mexico',
        language: 'Spanish',
        currency: 'MXN',
        region: 'Americas',
        url: 'https://www2.hm.com/es_mx',
        timezone: 'America/Mexico_City'
    },
    {
        code: 'es_cl',
        name: 'Chile',
        language: 'Spanish',
        currency: 'CLP',
        region: 'Americas',
        url: 'https://www2.hm.com/es_cl',
        timezone: 'America/Santiago'
    },
    {
        code: 'es_pe',
        name: 'Peru',
        language: 'Spanish',
        currency: 'PEN',
        region: 'Americas',
        url: 'https://www2.hm.com/es_pe',
        timezone: 'America/Lima'
    },
    {
        code: 'es_co',
        name: 'Colombia',
        language: 'Spanish',
        currency: 'COP',
        region: 'Americas',
        url: 'https://www2.hm.com/es_co',
        timezone: 'America/Bogota'
    },
    {
        code: 'es_uy',
        name: 'Uruguay',
        language: 'Spanish',
        currency: 'UYU',
        region: 'Americas',
        url: 'https://www2.hm.com/es_uy',
        timezone: 'America/Montevideo'
    },
    
    // Asia Pacific
    {
        code: 'en_au',
        name: 'Australia',
        language: 'English',
        currency: 'AUD',
        region: 'Asia Pacific',
        url: 'https://www2.hm.com/en_au',
        timezone: 'Australia/Sydney',
        features: ['Click & Collect']
    },
    {
        code: 'en_nz',
        name: 'New Zealand',
        language: 'English',
        currency: 'NZD',
        region: 'Asia Pacific',
        url: 'https://www2.hm.com/en_nz',
        timezone: 'Pacific/Auckland'
    },
    {
        code: 'ja_jp',
        name: 'Japan',
        language: 'Japanese',
        currency: 'JPY',
        region: 'Asia Pacific',
        url: 'https://www2.hm.com/ja_jp',
        timezone: 'Asia/Tokyo',
        features: ['Store Reserve']
    },
    {
        code: 'ko_kr',
        name: 'South Korea',
        language: 'Korean',
        currency: 'KRW',
        region: 'Asia Pacific',
        url: 'https://www2.hm.com/ko_kr',
        timezone: 'Asia/Seoul'
    },
    {
        code: 'zh_cn',
        name: 'China',
        language: 'Chinese (Simplified)',
        currency: 'CNY',
        region: 'Asia Pacific',
        url: 'https://www2.hm.com/zh_cn',
        timezone: 'Asia/Shanghai',
        features: ['WeChat Integration']
    },
    {
        code: 'zh_hk',
        name: 'Hong Kong',
        language: 'Chinese (Traditional)',
        currency: 'HKD',
        region: 'Asia Pacific',
        url: 'https://www2.hm.com/zh_hk',
        timezone: 'Asia/Hong_Kong'
    },
    {
        code: 'en_hk',
        name: 'Hong Kong (English)',
        language: 'English',
        currency: 'HKD',
        region: 'Asia Pacific',
        url: 'https://www2.hm.com/en_hk',
        timezone: 'Asia/Hong_Kong'
    },
    {
        code: 'zh_tw',
        name: 'Taiwan',
        language: 'Chinese (Traditional)',
        currency: 'TWD',
        region: 'Asia Pacific',
        url: 'https://www2.hm.com/zh_tw',
        timezone: 'Asia/Taipei'
    },
    {
        code: 'en_sg',
        name: 'Singapore',
        language: 'English',
        currency: 'SGD',
        region: 'Asia Pacific',
        url: 'https://www2.hm.com/en_sg',
        timezone: 'Asia/Singapore'
    },
    {
        code: 'en_my',
        name: 'Malaysia',
        language: 'English',
        currency: 'MYR',
        region: 'Asia Pacific',
        url: 'https://www2.hm.com/en_my',
        timezone: 'Asia/Kuala_Lumpur'
    },
    {
        code: 'en_ph',
        name: 'Philippines',
        language: 'English',
        currency: 'PHP',
        region: 'Asia Pacific',
        url: 'https://www2.hm.com/en_ph',
        timezone: 'Asia/Manila'
    },
    {
        code: 'th_th',
        name: 'Thailand',
        language: 'Thai',
        currency: 'THB',
        region: 'Asia Pacific',
        url: 'https://www2.hm.com/th_th',
        timezone: 'Asia/Bangkok'
    },
    {
        code: 'vi_vn',
        name: 'Vietnam',
        language: 'Vietnamese',
        currency: 'VND',
        region: 'Asia Pacific',
        url: 'https://www2.hm.com/vi_vn',
        timezone: 'Asia/Ho_Chi_Minh'
    },
    {
        code: 'en_in',
        name: 'India',
        language: 'English',
        currency: 'INR',
        region: 'Asia Pacific',
        url: 'https://www2.hm.com/en_in',
        timezone: 'Asia/Kolkata',
        features: ['Cash on Delivery']
    },
    
    // Middle East & Africa
    {
        code: 'en_ae',
        name: 'UAE',
        language: 'English',
        currency: 'AED',
        region: 'Middle East',
        url: 'https://www2.hm.com/en_ae',
        timezone: 'Asia/Dubai'
    },
    {
        code: 'ar_ae',
        name: 'UAE (Arabic)',
        language: 'Arabic',
        currency: 'AED',
        region: 'Middle East',
        url: 'https://www2.hm.com/ar_ae',
        timezone: 'Asia/Dubai'
    },
    {
        code: 'en_sa',
        name: 'Saudi Arabia',
        language: 'English',
        currency: 'SAR',
        region: 'Middle East',
        url: 'https://www2.hm.com/en_sa',
        timezone: 'Asia/Riyadh'
    },
    {
        code: 'ar_sa',
        name: 'Saudi Arabia (Arabic)',
        language: 'Arabic',
        currency: 'SAR',
        region: 'Middle East',
        url: 'https://www2.hm.com/ar_sa',
        timezone: 'Asia/Riyadh'
    },
    {
        code: 'en_kw',
        name: 'Kuwait',
        language: 'English',
        currency: 'KWD',
        region: 'Middle East',
        url: 'https://www2.hm.com/en_kw',
        timezone: 'Asia/Kuwait'
    },
    {
        code: 'en_qa',
        name: 'Qatar',
        language: 'English',
        currency: 'QAR',
        region: 'Middle East',
        url: 'https://www2.hm.com/en_qa',
        timezone: 'Asia/Qatar'
    },
    {
        code: 'en_bh',
        name: 'Bahrain',
        language: 'English',
        currency: 'BHD',
        region: 'Middle East',
        url: 'https://www2.hm.com/en_bh',
        timezone: 'Asia/Bahrain'
    },
    {
        code: 'en_om',
        name: 'Oman',
        language: 'English',
        currency: 'OMR',
        region: 'Middle East',
        url: 'https://www2.hm.com/en_om',
        timezone: 'Asia/Muscat'
    },
    {
        code: 'en_jo',
        name: 'Jordan',
        language: 'English',
        currency: 'JOD',
        region: 'Middle East',
        url: 'https://www2.hm.com/en_jo',
        timezone: 'Asia/Amman'
    },
    {
        code: 'en_lb',
        name: 'Lebanon',
        language: 'English',
        currency: 'LBP',
        region: 'Middle East',
        url: 'https://www2.hm.com/en_lb',
        timezone: 'Asia/Beirut'
    },
    {
        code: 'en_eg',
        name: 'Egypt',
        language: 'English',
        currency: 'EGP',
        region: 'Africa',
        url: 'https://www2.hm.com/en_eg',
        timezone: 'Africa/Cairo'
    },
    {
        code: 'ar_eg',
        name: 'Egypt (Arabic)',
        language: 'Arabic',
        currency: 'EGP',
        region: 'Africa',
        url: 'https://www2.hm.com/ar_eg',
        timezone: 'Africa/Cairo'
    },
    {
        code: 'en_za',
        name: 'South Africa',
        language: 'English',
        currency: 'ZAR',
        region: 'Africa',
        url: 'https://www2.hm.com/en_za',
        timezone: 'Africa/Johannesburg'
    },
    {
        code: 'en_ma',
        name: 'Morocco',
        language: 'English',
        currency: 'MAD',
        region: 'Africa',
        url: 'https://www2.hm.com/en_ma',
        timezone: 'Africa/Casablanca'
    },
    {
        code: 'fr_ma',
        name: 'Morocco (French)',
        language: 'French',
        currency: 'MAD',
        region: 'Africa',
        url: 'https://www2.hm.com/fr_ma',
        timezone: 'Africa/Casablanca'
    },
    {
        code: 'he_il',
        name: 'Israel',
        language: 'Hebrew',
        currency: 'ILS',
        region: 'Middle East',
        url: 'https://www2.hm.com/he_il',
        timezone: 'Asia/Jerusalem'
    }
];

// Helper functions

export function getMarketByCode(code: string): Market | undefined {
    return HM_MARKETS.find(m => m.code === code);
}

export function getMarketsByRegion(region: string): Market[] {
    return HM_MARKETS.filter(m => m.region === region);
}

export function getMarketsByCurrency(currency: string): Market[] {
    return HM_MARKETS.filter(m => m.currency === currency);
}

export function getAllRegions(): string[] {
    return [...new Set(HM_MARKETS.map(m => m.region))];
}

export function getAllCurrencies(): string[] {
    return [...new Set(HM_MARKETS.map(m => m.currency))];
}

export function getMarketUrl(code: string, path?: string): string {
    const market = getMarketByCode(code);
    if (!market) return '';
    return path ? `${market.url}${path}` : market.url;
}