import { Actor } from 'apify';
import { CheerioCrawler, log, LogLevel } from 'crawlee';
import { router } from './routes.js';
import { getStartUrls } from './tools.js';
import actorStatistics from './actor_statistics.js';
import { CONCURRENCY } from './constants.js';

await Actor.init();

interface InputSchema {
    debug?: boolean,
    useMockRequests?: boolean,
    inputCountry?: string,
    maxItems?: number,
    maxRunSeconds?: number,
}
const { inputCountry, maxItems, maxRunSeconds, debug: inputDebug, useMockRequests } = (await Actor.getInput<InputSchema>())
?? {
    inputCountry: 'UNITED KINGDOM',
};

const debug = Boolean(inputDebug);

const startUrls = getStartUrls(useMockRequests, inputCountry);

if (debug) {
    log.setLevel(LogLevel.DEBUG);
}

let proxyConfiguration;
try {
    proxyConfiguration = await Actor.createProxyConfiguration();
} catch (error) {
    log.warning('Proxy not configured or unavailable; continuing without a proxy.');
}

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

actorStatistics.setLimit(maxItems);

if (typeof maxRunSeconds === 'number' && maxRunSeconds > 0) {
    setTimeout(async () => {
        log.info(`Max run time reached (${maxRunSeconds}s). Aborting crawl.`);
        try {
            await crawler.autoscaledPool?.abort();
        } finally {
            await Actor.exit();
        }
    }, maxRunSeconds * 1000);
}

await crawler.run(startUrls);

actorStatistics.logStatistics();
await Actor.exit();
