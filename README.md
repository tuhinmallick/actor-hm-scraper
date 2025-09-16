# H&M Enhanced Scraper

A powerful and flexible web scraper for H&M's online store, featuring smart data extraction, advanced filtering, anti-bot measures, and robust error handling.

## Features

### 🎯 Flexible Input Options
- **Direct URLs**: Scrape specific category or product pages
- **Search Queries**: Find products by search terms
- **Category Paths**: Scrape entire categories (e.g., "women/dresses", "men/shirts")
- **Multiple Markets**: Support for 10+ H&M country sites

### 🔍 Advanced Filtering
- **Price Range**: Set minimum and maximum prices
- **Colors**: Filter by color names or codes
- **Sizes**: Filter by specific sizes
- **Materials**: Cotton, polyester, wool, etc.
- **Patterns**: Solid, striped, floral, etc.
- **Sale Items**: Option to get only discounted products
- **Sustainable**: Filter for conscious/sustainable items

### 🤖 Smart Extraction
- **Automatic Detection**: Intelligently extracts data from H&M's Next.js structure
- **Multiple Fallbacks**: 4+ extraction methods ensure data capture
- **Fast Mode**: Extract from listing pages without visiting product pages
- **Detailed Mode**: Visit product pages for comprehensive information

### 🛡️ Anti-Bot Protection
- **Advanced Headers**: Realistic browser fingerprinting
- **Smart Delays**: Human-like browsing patterns
- **Session Management**: Intelligent session rotation
- **Proxy Support**: Built-in proxy configuration
- **Retry Logic**: Automatic retry with exponential backoff

### 📊 Data Management
- **Progressive Saving**: Data saved in batches during scraping
- **Quality Monitoring**: Automatic data validation and scoring
- **Memory Optimization**: Efficient memory usage for large scrapes
- **Custom Output**: Select specific fields to include

## Input Configuration

### Basic Example
```json
{
    "startUrls": ["https://www2.hm.com/en_us/women/products/dresses.html"],
    "maxProducts": 100
}
```

### Advanced Example with Filters
```json
{
    "country": "en_us",
    "categories": ["women/products/dresses", "women/products/tops"],
    "filters": {
        "minPrice": 20,
        "maxPrice": 100,
        "colors": ["black", "white"],
        "sizes": ["S", "M", "L"],
        "materials": ["cotton"],
        "sale": true
    },
    "maxProducts": 500,
    "productsPerPage": 72,
    "sortBy": "ascPrice",
    "extractProductDetails": false,
    "enableAntiBot": true
}
```

### Search Example
```json
{
    "searchQueries": ["summer dress", "denim jacket", "white shirt"],
    "country": "en_gb",
    "filters": {
        "maxPrice": 50
    },
    "maxProducts": 200
}
```

## Input Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `startUrls` | array | [] | Direct URLs to scrape |
| `searchQueries` | array | [] | Search terms to find products |
| `categories` | array | [] | Category paths (e.g., "women/dresses") |
| `country` | string | "en_us" | Market code (see supported countries) |
| `filters` | object | {} | Product filters (see filter options) |
| `maxProducts` | integer | 100 | Maximum products to scrape (0 = unlimited) |
| `maxPages` | integer | 0 | Maximum pages per category (0 = unlimited) |
| `productsPerPage` | integer | 72 | Products per page (max 128) |
| `sortBy` | string | "stock" | Sort order: stock, newProduct, ascPrice, descPrice |
| `includeVariants` | boolean | true | Include all color/size variants |
| `extractProductDetails` | boolean | false | Visit product pages for details |
| `outputFields` | array | [] | Specific fields to include (empty = all) |
| `enableAntiBot` | boolean | true | Use anti-detection measures |
| `enableSmartExtraction` | boolean | true | Use intelligent extraction |
| `enableProgressiveSaving` | boolean | true | Save data progressively |
| `maxConcurrency` | integer | 5 | Maximum concurrent requests |
| `requestTimeout` | integer | 60 | Request timeout in seconds |
| `debug` | boolean | false | Enable debug logging |

## Filter Options

### Price Filters
```json
{
    "filters": {
        "minPrice": 10,
        "maxPrice": 100
    }
}
```

### Color Filters
```json
{
    "filters": {
        "colors": ["black", "white", "red", "blue"]
    }
}
```

### Size Filters
```json
{
    "filters": {
        "sizes": ["XS", "S", "M", "L", "XL", "XXL"]
    }
}
```

### Material Filters
```json
{
    "filters": {
        "materials": ["cotton", "polyester", "wool", "silk", "linen"]
    }
}
```

### Pattern Filters
```json
{
    "filters": {
        "patterns": ["solid", "striped", "floral", "checkered", "dotted"]
    }
}
```

### Other Filters
```json
{
    "filters": {
        "sale": true,
        "sustainable": true,
        "garmentLengths": ["mini", "midi", "maxi"],
        "sleeveLengths": ["sleeveless", "short", "long"],
        "fits": ["slim", "regular", "oversized"],
        "contexts": ["casual", "formal", "party", "sport"]
    }
}
```

## Supported Countries

| Country | Code | Currency |
|---------|------|----------|
| USA | en_us | USD |
| UK | en_gb | GBP |
| Germany | de_de | EUR |
| France | fr_fr | EUR |
| Spain | es_es | EUR |
| Italy | it_it | EUR |
| Netherlands | nl_nl | EUR |
| Sweden | sv_se | SEK |
| Canada | en_ca | CAD |
| Australia | en_au | AUD |

## Output Format

### Standard Product Output
```json
{
    "company": "HM",
    "country": "USA",
    "productName": "Floral Midi Dress",
    "articleNo": "1234567001",
    "division": "Ladies",
    "category": "Dresses",
    "subCategory": "Midi Dresses",
    "listPrice": 49.99,
    "salePrice": 29.99,
    "currency": "USD",
    "description": "Midi dress in woven fabric...",
    "url": "https://www2.hm.com/en_us/productpage.1234567001.html",
    "imageUrl": "https://lp2.hm.com/...",
    "timestamp": "2024-01-15T10:30:00Z",
    "colors": [
        {"name": "Floral", "code": "#multicolor"}
    ],
    "sizes": [
        {"code": "001", "name": "XS"},
        {"code": "002", "name": "S"},
        {"code": "003", "name": "M"}
    ]
}
```

### Custom Output Fields
If you specify `outputFields`, only those fields will be included:
```json
{
    "outputFields": ["articleNo", "title", "price", "url", "sizes"]
}
```

## Performance Optimization

### Fast Scraping (No Product Details)
```json
{
    "extractProductDetails": false,
    "productsPerPage": 128,
    "maxConcurrency": 10
}
```

### Reliable Scraping (With Anti-Bot)
```json
{
    "enableAntiBot": true,
    "maxConcurrency": 3,
    "requestTimeout": 90,
    "retryAttempts": 5
}
```

### Large-Scale Scraping
```json
{
    "maxProducts": 10000,
    "enableProgressiveSaving": true,
    "productsPerPage": 128,
    "extractProductDetails": false
}
```

## Error Handling

The scraper includes robust error handling:
- **Automatic Retries**: Failed requests are retried with exponential backoff
- **Timeout Protection**: Requests timeout after configured duration
- **Progressive Saving**: Data is saved periodically to prevent loss
- **Smart Recovery**: Continues from last successful state on restart

## Best Practices

1. **Start Small**: Test with a small `maxProducts` value first
2. **Use Filters**: Apply filters to reduce the number of products
3. **Enable Proxies**: Use proxies for large-scale scraping
4. **Monitor Usage**: Check logs for rate limiting or blocking
5. **Respect Limits**: Don't set concurrency too high

## Troubleshooting

### No Products Found
- Check if the URL/category is correct
- Verify the country code matches the URL
- Try enabling debug mode for detailed logs

### Timeout Errors
- Increase `requestTimeout`
- Reduce `maxConcurrency`
- Enable proxies

### Rate Limiting
- Reduce `maxConcurrency` to 2-3
- Enable `enableAntiBot`
- Add delays between requests

## Updates and Maintenance

The scraper uses smart extraction that adapts to website changes:
- Multiple extraction methods with fallbacks
- Regex-based pattern matching for new structures
- Automatic detection of data format changes

## Support

For issues or questions:
1. Check the debug logs (`debug: true`)
2. Verify your input configuration
3. Try with a simple configuration first
4. Report issues with example URLs and configuration