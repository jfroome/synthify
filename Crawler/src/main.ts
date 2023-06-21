import { PlaywrightCrawler, log } from 'crawlee';
import { router } from "./routes/MainRouter.js";
import { QueueManager } from "./queueManager.js";
log.setLevel(log.LEVELS.INFO);
log.debug('Setting up crawler.');
const crawler = new PlaywrightCrawler({
    maxRequestRetries: 0,
    navigationTimeoutSecs: 5,
    requestHandlerTimeoutSecs: 5,
    requestHandler: router,
    headless: true,
});

log.debug('Adding requests to the queue.');

const links = await QueueManager.getExistingLinks()

console.log(links)

await crawler.addRequests(links);
await crawler.run();
await QueueManager.flush();  