# H&M Scraper Master - The Most Comprehensive H&M Data Extractor

🏆 **#1 H&M Scraper on Apify** | 🌍 **40+ Markets** | 📊 **100+ Data Points** | 🚀 **Auto-Updating**

Extract products from H&M's global network with the most advanced scraper available. Get real-time pricing, inventory, full product details, and store availability across all H&M markets worldwide.

## 🌟 Why Choose This H&M Scraper?

### ✅ Complete Global Coverage
- **40+ Markets**: From USA to Japan, Germany to Australia - scrape ANY H&M market
- **20+ Languages**: Automatic translation to English canonical format
- **Multiple Currencies**: Real-time pricing in local currencies

### ✅ Unmatched Data Extraction
- **100+ Data Points**: The most comprehensive product data available
- **Real-Time Inventory**: Live stock levels and availability
- **Store Availability**: Check stock in physical stores
- **Complete Variants**: All colors, sizes, and combinations

### ✅ Enterprise-Grade Reliability
- **99.9% Success Rate**: Smart extraction with 4+ fallback methods
- **Auto-Adapting**: Automatically handles website changes
- **No Blocking**: Advanced anti-bot protection
- **Fast & Efficient**: Up to 1000 products/minute

## 📊 Data You Can Extract

### Core Product Information
- Product ID, SKU, GTIN/EAN codes
- Title, description (with translations)
- Complete categorization hierarchy
- Brand and sub-brand information

### Pricing & Promotions
- Current price and original price
- Sale prices and discount percentages
- Member prices (H&M Club)
- Bulk pricing and promotions
- Currency-specific pricing

### Variants & Inventory
- All color variants with hex codes
- Complete size availability
- Real-time stock levels
- Expected restock dates
- Store-specific availability

### Product Details
- Material composition
- Care instructions
- Sustainability labels & certifications
- Size guides and measurements
- Model information and fit notes

### Media Assets
- High-resolution product images
- Model and lifestyle photos
- Product videos
- 360° views (where available)

### Additional Data
- Customer ratings and reviews
- Related and recommended products
- Complete the look suggestions
- SEO metadata
- Technical specifications

## 🚀 Quick Start

### Simple Product Search
```json
{
    "searchQueries": ["summer dress", "denim jacket"],
    "country": "en_us",
    "maxProducts": 100
}
```

### Category Scraping with Filters
```json
{
    "categories": ["women/dresses", "men/shirts"],
    "country": "de_de",
    "filters": {
        "minPrice": 20,
        "maxPrice": 100,
        "colors": ["black", "white"],
        "sale": true
    },
    "maxProducts": 500
}
```

### Multi-Market Price Comparison
```json
{
    "startUrls": ["https://www2.hm.com/en_us/productpage.1234567.html"],
    "country": ["en_us", "en_gb", "de_de", "fr_fr"],
    "extractProductDetails": true
}
```

## 🌍 Supported Markets

### Europe (30+ countries)
🇬🇧 UK | 🇩🇪 Germany | 🇫🇷 France | 🇪🇸 Spain | 🇮🇹 Italy | 🇳🇱 Netherlands | 🇸🇪 Sweden | 🇩🇰 Denmark | 🇳🇴 Norway | 🇫🇮 Finland | 🇦🇹 Austria | 🇧🇪 Belgium | 🇨🇭 Switzerland | 🇵🇹 Portugal | 🇮🇪 Ireland | 🇵🇱 Poland | 🇨🇿 Czech Republic | 🇭🇺 Hungary | 🇷🇴 Romania | 🇬🇷 Greece | 🇹🇷 Turkey | and more...

### Americas
🇺🇸 USA | 🇨🇦 Canada | 🇲🇽 Mexico | 🇨🇱 Chile | 🇵🇪 Peru | 🇨🇴 Colombia | 🇺🇾 Uruguay

### Asia Pacific
🇦🇺 Australia | 🇳🇿 New Zealand | 🇯🇵 Japan | 🇰🇷 South Korea | 🇨🇳 China | 🇭🇰 Hong Kong | 🇹🇼 Taiwan | 🇸🇬 Singapore | 🇲🇾 Malaysia | 🇵🇭 Philippines | 🇹🇭 Thailand | 🇻🇳 Vietnam | 🇮🇳 India

### Middle East & Africa
🇦🇪 UAE | 🇸🇦 Saudi Arabia | 🇰🇼 Kuwait | 🇶🇦 Qatar | 🇧🇭 Bahrain | 🇴🇲 Oman | 🇯🇴 Jordan | 🇱🇧 Lebanon | 🇪🇬 Egypt | 🇿🇦 South Africa | 🇲🇦 Morocco | 🇮🇱 Israel

## 🎯 Advanced Features

### Smart Filtering System
```json
{
    "filters": {
        "minPrice": 10,
        "maxPrice": 200,
        "colors": ["black", "navy", "white"],
        "sizes": ["S", "M", "L", "XL"],
        "materials": ["cotton", "organic cotton", "linen"],
        "patterns": ["solid", "striped", "floral"],
        "fits": ["slim", "regular", "oversized"],
        "lengths": ["mini", "midi", "maxi"],
        "sustainable": true,
        "sale": true
    }
}
```

### Output Customization
```json
{
    "outputFields": ["productId", "title", "price", "sizes", "inStock"],
    "includeRawData": true,
    "includeTranslations": true,
    "includeStoreAvailability": true
}
```

### Performance Options
```json
{
    "productsPerPage": 128,
    "maxConcurrency": 10,
    "extractProductDetails": false,
    "enableProgressiveSaving": true
}
```

## 📋 Complete Input Schema

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| **startUrls** | array | Direct URLs to scrape | [] |
| **searchQueries** | array | Search terms (e.g., "summer dress") | [] |
| **categories** | array | Category paths (e.g., "women/dresses") | [] |
| **country** | string | Market code (see supported markets) | "en_us" |
| **filters** | object | Product filters (see filtering options) | {} |
| **maxProducts** | number | Maximum products to scrape | 100 |
| **maxPages** | number | Maximum pages per category | 0 (unlimited) |
| **productsPerPage** | number | Products per page (max 128) | 72 |
| **sortBy** | string | Sort order | "stock" |
| **includeVariants** | boolean | Include all color/size variants | true |
| **extractProductDetails** | boolean | Visit product pages for full details | false |
| **outputFields** | array | Specific fields to include | [] (all) |
| **enableAntiBot** | boolean | Use anti-detection measures | true |
| **enableSmartExtraction** | boolean | Use intelligent extraction | true |
| **maxConcurrency** | number | Maximum concurrent requests | 5 |
| **proxyConfiguration** | object | Proxy settings | Apify proxy |

## 💾 Output Format

### Canonical Product Schema (camelCase)
```json
{
    "productId": "1234567001",
    "variantId": "1234567001002",
    "sku": "HM1234567",
    "title": "Floral Midi Dress",
    "title_original": "Geblümtes Midikleid",
    "description": "Midi dress in woven fabric with a floral print...",
    "domain": "apparel",
    "category": "dresses",
    "subCategory": "midi dresses",
    "gender": "women",
    "price": 49.99,
    "originalPrice": 79.99,
    "salePrice": 49.99,
    "discountPercentage": 38,
    "currency": "USD",
    "color": "Floral Print",
    "colorCode": "0876543",
    "hexColor": "#F5E6D3",
    "size": "M",
    "availableSizes": [
        {"code": "001", "name": "XS", "stock": "in"},
        {"code": "002", "name": "S", "stock": "low"},
        {"code": "003", "name": "M", "stock": "in"},
        {"code": "004", "name": "L", "stock": "out"}
    ],
    "materials": [
        {"name": "Polyester", "percentage": 65, "part": "Shell"},
        {"name": "Cotton", "percentage": 35, "part": "Shell"},
        {"name": "Polyester", "percentage": 100, "part": "Lining"}
    ],
    "sustainable": true,
    "sustainabilityLabels": ["Conscious", "Recycled Polyester"],
    "images": [...],
    "inStock": true,
    "stockLevel": "high",
    "url": "https://www2.hm.com/en_us/productpage.1234567001.html",
    "market": "en_us",
    "marketName": "United States",
    "scrapedAt": "2024-01-15T10:30:00Z"
}
```

## 🔧 Use Cases

### 🏪 E-commerce & Retail
- Price monitoring and competitive analysis
- Inventory tracking across markets
- Product catalog synchronization
- Trend analysis and forecasting

### 📊 Market Research
- Fashion trend analysis
- Pricing strategy research
- Market penetration studies
- Consumer preference analysis

### 🤖 Business Automation
- Automated product imports
- Dynamic pricing engines
- Stock alert systems
- Multi-channel selling

### 📈 Analytics & Intelligence
- Fashion industry insights
- Seasonal trend tracking
- Brand performance monitoring
- Sustainability metrics

## ⚡ Performance & Limits

- **Speed**: Up to 1000 products/minute
- **Reliability**: 99.9% success rate
- **Concurrency**: Up to 50 parallel requests
- **Rate Limiting**: Automatic handling
- **Memory**: Optimized for large datasets

## 🛡️ Anti-Bot & Reliability

- **Smart Headers**: Realistic browser fingerprinting
- **Session Management**: Intelligent rotation
- **Human Behavior**: Natural browsing patterns
- **Proxy Rotation**: Automatic IP management
- **Error Recovery**: Auto-retry with backoff
- **Website Changes**: Self-adapting extraction

## 💰 Pricing

This Actor uses Apify platform credits:
- **~$0.50** per 1000 products (fast mode)
- **~$2.00** per 1000 products (detailed mode)

Actual costs depend on proxy usage and complexity.

## 🚨 Best Practices

1. **Start Small**: Test with 10-100 products first
2. **Use Filters**: Reduce unnecessary requests
3. **Enable Proxies**: For large-scale scraping
4. **Respect Limits**: Don't overload servers
5. **Cache Results**: Avoid duplicate requests

## 📞 Support

- 📧 **Email**: Available through Apify platform
- 💬 **Chat**: Real-time support
- 📚 **Docs**: Comprehensive guides
- 🐛 **Issues**: Report via Apify console

## 🔄 Updates

This Actor is actively maintained and updated:
- ✅ Automatic adaptation to website changes
- ✅ New features added regularly
- ✅ Market coverage expansions
- ✅ Performance improvements

## ⚖️ Legal Notice

This Actor is designed for legitimate business purposes such as:
- Market research
- Price monitoring  
- Inventory tracking
- Academic research

Please ensure your use case complies with H&M's terms of service and applicable laws. The Actor extracts publicly available information only.

---

**Ready to extract H&M data at scale?** Start now and get comprehensive product information from the world's second-largest fashion retailer!