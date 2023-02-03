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

await crawler.addRequests(await QueueManager.getExistingLinks());
await crawler.addRequests(
    [   
        {
            label: 'CICADA_NEXT',
            url: 'https://cicadasound.ca/collections/used'
        },
        {
            label: 'SM_NEXT',
            url: 'https://www.spacemanmusic.com/shop/keyboards/'
        },
        {
            label: 'MOOG_NEXT',
            url: 'https://moogaudio.com/collections/sales?q=synth'
        }, 
        {
            label: 'KIJIJI',
            url: 'https://www.kijiji.ca/'
        }
    ]);
await crawler.run();
await QueueManager.flush();  