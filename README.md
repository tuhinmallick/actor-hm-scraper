## What does H&M Scraper do?
​
With this scraper tool, you can **get product data from H&M's website**. The scraper visits the H&M website of your choice (usually a specific country) and scrapes all available H&M product data from that branch. One dataset takes around 30 min to take shape and includes product name, price, sale price, currency, country, description, URL, item number, category, subcategory, time of listing, and image URL.
​
## What H&M product data can I extract with a scraper?
​
Each product will be listed in the dataset under a specific product category, subcategory, and division along with its price, description, URL, posting time, and other specifications. <br>
​
👩 👱‍♂️ 👧 👶 **Product division:** Women, Men, Baby, H&M HOME, Kids, Sport, Beauty. <br>
​
👔 👗 👚 🎁 **Product categories:** Trousers & Leggings, Sportswear, Nightwear & Loungewear, Basics, Plus Sizes, Shoes, Jeans, Jackets & Coats, Skirts, Maternity Wear, Swimwear & Beachwear, Bags, Makeup, Trousers, Shirts, Towels & Bathroom accessories, Partywear, Home Storage & Organizing, Vases & Decorations, Bedding, Rugs, Dinnerware & Tableware, Cookware & Bakeware, Lighting, Curtains, Blankets & Throws, Loungewear, etc. <br>
​
🧥 🩱 🩳 🧢 **Product subcategories:** High Waisted Trousers, Flip Flops, Cargo Trousers, Bomber Jackets, Jackets & Coats, Jackets, Jumpers, Wrap Dresses, Party Dresses, Short Dresses, Trench Coats, Off Shoulder Shirts & Blouses, Denim shirts, Sweatshirts & Hoodies, Vests, Parkas, Graphic Tees & Printed T-Shirts, Lingerie & Tights, Dungarees, Swimwear, Handbags, Necklace, Hair Accessories, Socks & Tights, Makeup Brushes, Slim Fit, Casual Shorts, Loose Fit, etc. <br>
​
**Branches:** United States, Mexico, France, Germany, Italy, Australia, Canada, Spain, United Kingdom, China. <br>
​
## Why scrape H&M?
​
🕵️ Conduct **retail analysis** by price, popularity, newness, etc. <br>
​
👚 **Identify new trends** across retail industry and fast fashion in particular <br>
​
👟 Keep an eye on **competitor landscape** <br>
​
💪 Conduct basic **market research** by countries and product categories <br>
​
## How do I use H&M Scraper?
​
H&M Scraper was designed to be easy to start with even if you've never extracted product data from e-commerce websites before. Here's how you can scrape H&M product data using this tool:
​
1. [Create](https://console.apify.com/sign-up) a free Apify account using your email.
2. Open [H&M Scraper](https://apify.com/misceres/hm-scraper).
3. Choose a H&M branch (country) to scrape.
4. Click "Start" and wait for the data to be extracted.
5. Download your data in JSON, JSONL, XML, CSV, Excel, or HTML.
​
## How much will it cost me to scrape product data from H&M shops?
​
[Apify Free plan](https://apify.com/pricing) provides you with **$5 free usage credits** per month. For those $5 you can get **more than 50,000 items** from this H&M Scraper. So it will be completely free for at least 50K results!
​
If you need to scrape data from H&M or other [e-commerce shops](https://apify.com/store/categories/ecommerce) on a more regular basis and larger scale, go for a $49/month [Personal plan](https://apify.com/pricing).
​
## Input
​
The input for H&M Scraper should be an H&M franchise in a particular country. You can pick one country per run; the scraper will extract data on every available H&M item offered on their website.
​
```javascript 
{ 
  "inputCountry": "USA"
}
​
```
​
## Output sample
​
The results will be wrapped into a dataset which you can always find in the **Storage** tab. Here's an excerpt from the data you'd get if you apply the input parameters above (USA):
​
![Apify - H&M Run - Output](https://i.imgur.com/YQFd0lJ.png)  
​
And here is the same data but in JSON. You can choose in which format to download your H&M data: JSON, JSONL, Excel spreadsheet, HTML table, CSV, or XML.
​
```javascript
[{
  "company": "HM",
  "country": "USA",
  "productName": "H&M+ Pleated Skirt",
  "articleNo": 1144202001,
  "division": "Women",
  "category": "Plus Sizes",
  "subCategory": "Plus Sizes",
  "listPrice": 24.99, 
  "salePrice": null,
  "currency": "USD",
  "description": "Short, pleated skirt in twill. Concealed zipper at one side with button. Unlined.",
  "url": "<https://www2.hm.com/en_us/productpage.1144202001.html>",
  "imageUrl": "<https://lp2.hm.com/hmgoepprod?set=quality%5B79%5D%2Csource%5B%2F63%2F92%2F63929b71eb1244aea69ced6096126375c0baf963.jpg%5D%2Corigin%5Bdam%5D%2Ccategory%5B%5D%2Ctype%5BDESCRIPTIVESTILLLIFE%5D%2Cres%5Bm%5D%2Chmver%5B2%5D&call=url[file:/product/main]>",
  "timestamp": "2023-03-03T14:11:12.397Z"
},
{
  "company": "HM",
  "country": "USA",
  "productName": "H&M+ Crop Denim Overshirt",
  "articleNo": 1033494001,
  "division": "Women",
  "category": "Plus Sizes",
  "subCategory": "Shirts & Blouses",
  "listPrice": 29.99,
  "salePrice": null,
  "currency": "USD",
  "description": "The Water Saving Collection is a collection of 90s and Y2K-inspired denim garments made from more sustainable materials in a water-saving manufacturing process. Crop overshirt is in thick denim made from recycled cotton. Collar, snap fasteners at front, yoke front and back, and open front pockets. Dropped shoulders and long sleeves with snap fastener at cuffs. Rounded, slightly longer hem at back.",
  "url": "<https://www2.hm.com/en_us/productpage.1033494001.html>",
  "imageUrl": "<https://lp2.hm.com/hmgoepprod?set=quality%5B79%5D%2Csource%5B%2F02%2F29%2F022966c3fcf96f9e183939a2f58d83237169bf8b.jpg%5D%2Corigin%5Bdam%5D%2Ccategory%5B%5D%2Ctype%5BDESCRIPTIVESTILLLIFE%5D%2Cres%5Bm%5D%2Chmver%5B2%5D&call=url[file:/product/main]>",
  "timestamp": "2023-03-03T14:11:12.511Z"
},
{
  "company": "HM",
  "country": "USA",
  "productName": "H&M+ Crop Denim Overshirt",
  "articleNo": 1033494002,
  "division": "Women",
  "category": "Plus Sizes",
  "subCategory": "Shirts & Blouses",
  "listPrice": 29.99,
  "salePrice": null,
  "currency": "USD",
  "description": "The Water Saving Collection is a collection of 90s and Y2K-inspired denim garments made from more sustainable materials in a water-saving manufacturing process. Crop overshirt is in thick denim made from recycled cotton. Collar, snap fasteners at front, yoke front and back, and open front pockets. Dropped shoulders and long sleeves with snap fastener at cuffs. Rounded, slightly longer hem at back.",
  "url": "<https://www2.hm.com/en_us/productpage.1033494002.html>",
  "imageUrl": "<https://lp2.hm.com/hmgoepprod?set=quality%5B79%5D%2Csource%5B%2F9d%2F6e%2F9d6e37598b723c908562aea456fcdb79ea11d623.jpg%5D%2Corigin%5Bdam%5D%2Ccategory%5Bladies_plus_shirtsblouses%5D%2Ctype%5BDESCRIPTIVESTILLLIFE%5D%2Cres%5Bm%5D%2Chmver%5B2%5D&call=url[file:/product/main]>",
  "timestamp": "2023-03-03T14:11:12.511Z"
},
{
  "company": "HM",
  "country": "USA",
  "productName": "H&M+ Oversized Blouse",
  "articleNo": 1070407001,
  "division": "Women",
  "category": "Plus Sizes",
  "subCategory": "Shirts & Blouses",
  "listPrice": 24.99,
  "salePrice": null,
  "currency": "USD",
  "description": "Oversized blouse in a woven, textured viscose blend. Collar, buttons at front, and double-layered yoke at back. Chest pockets with flap and button, heavily dropped shoulders, and long sleeves with buttons at cuffs. Rounded hem, slightly longer at back.",
  "url": "<https://www2.hm.com/en_us/productpage.1070407001.html>",
  "imageUrl": "<https://lp2.hm.com/hmgoepprod?set=quality%5B79%5D%2Csource%5B%2F73%2F98%2F73980388982c1c7d55d551727d66b7a5831a6460.jpg%5D%2Corigin%5Bdam%5D%2Ccategory%5B%5D%2Ctype%5BDESCRIPTIVESTILLLIFE%5D%2Cres%5Bm%5D%2Chmver%5B2%5D&call=url[file:/product/main]>",
  "timestamp": "2023-03-03T14:11:12.671Z"
}]
...
​
```
​
## Integrations and H&M Scraper
​
Last but not least, **H&M Scraper can be connected with almost any cloud service or web app** thanks to <a  href=" https://apify.com/integrations" target="_blank"> integrations on the Apify platform</a>. You can integrate with Make, Zapier, Slack, Airbyte, GitHub, Google Sheets, Google Drive, <a  href="https://docs.apify.com/integrations" target="_blank"> and more</a>. 
​
Or you can use  <a  href="https://docs.apify.com/integrations/webhooks"  target="_blank">webhooks</a> to carry out an action whenever an event occurs, e.g., get a notification whenever H&M Scraper successfully finishes a run.
​
## Using H&M Scraper with the Apify API
​
The Apify API gives you programmatic access to the Apify platform. The API is organized around RESTful HTTP endpoints that enable you to manage, schedule and run Apify actors. The API also lets you access any datasets, monitor actor performance, fetch results, create and update versions, and more.
​
To access the API using Node.js, use the `apify-client` NPM package. To access the API using Python, use the `apify-client` PyPI package.
​
## Is it legal to scrape H&M data?
​
Scraping H&M products is legal. Our [e-commerce scrapers](https://apify.com/store/categories/ecommerce) are ethical and **only extract publicly available data** such as product names and descriptions, prices, time of posting on the website, categories, etc. If you would like to learn more about the most recent legal practices of data scraping, see [this blogpost](https://blog.apify.com/is-web-scraping-legal/).
