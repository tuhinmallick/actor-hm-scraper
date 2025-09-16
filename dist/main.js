import { Actor } from 'apify';
import { CheerioCrawler, log, LogLevel } from 'crawlee';
import { router } from './routes.js';
import { getStartUrls } from './tools.js';
import actorStatistics from './actor_statistics.js';
import { CONCURRENCY } from './constants.js';
await Actor.init();
const { inputCountry } = (await Actor.getInput())
    ?? {
        inputCountry: 'UNITED KINGDOM',
    };
// debugging tools
const debug = false;
const useMockRequests = false;
//
const startUrls = getStartUrls(useMockRequests, inputCountry);
if (debug) {
    log.setLevel(LogLevel.DEBUG);
}
const proxyConfiguration = await Actor.createProxyConfiguration();
const crawler = new CheerioCrawler({
    proxyConfiguration,
    maxConcurrency: CONCURRENCY,
    requestHandler: router,
    errorHandler: (context, error) => {
        actorStatistics.saveError(context.request.url, error.toString());
    },
    failedRequestHandler: (context, error) => {
        actorStatistics.saveError(context.request.url, error.toString());
    },
});
await crawler.run(startUrls);
actorStatistics.logStatistics();
await Actor.exit();
//# sourceMappingURL=main.js.map