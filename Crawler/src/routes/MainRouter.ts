import { createPlaywrightRouter, Dataset, sleep } from 'crawlee';
import { Listing } from "../models/listing.js";
import { createTokens } from "../util/createTokens.js";
import { createUID } from "../util/createUID.js";
import { parsePriceString } from '../util/parsePriceString.js';
import { search } from 'kijiji-scraper';
import { QueueManager } from "../queueManager.js";
import { Locator } from 'playwright';

export const router = createPlaywrightRouter();

router.addHandler('KIJIJI', async ({ log }) => {
    log.info('Sending request to kijiji api.... this will take a few minutes.');
    var results = await search(
        //params
        {
            locationId: 1700184,
            categoryId: 17,
            priceType: "SPECIFIED_AMOUNT",
            q: "synthesizer synth"
            //keywords: "synth synthesizer"
        },

        //options
        {
            pageDelayMs: 250,
            minResults: 100,
            resultDetailsDelayMs: 250
        }
    )
    log.info('Received response from kijiji api.');
    let listings = results.map(jsonData => {
        return <Listing>{
            uid: createUID(jsonData.id),
            title: jsonData.title,
            description: jsonData.description,
            price: jsonData.attributes.price,
            shipping: null,
            currency: "CAD",
            site: "https://kijiji.ca/",
            url: jsonData.url,
            posted: jsonData.date,
            tags: createTokens(jsonData.title),
            inStock: true // if its listed its in stock at this store
        }
    });
    await Dataset.pushData(listings);
});

router.addHandler('KIJIJI_STOCK_CHECK', async ({ request, page }) => {
    if ((await page.title()).includes('Page Not Found') || 
         page.getByText('Hmm... Apparently this page no longer exists.').textContent() !== null ||
         page.getByText("Oops... Too late! This listing was so awesome that it\'s already gone. Check out other similar ads in your area").textContent() !== null ||
         page.getByText("No Longer Available -").textContent() !== null
         ) {
        // call queuemanager to flag item as sold
        await QueueManager.markAsSold(request.url);
        return;
    }
});

// Cicada
router.addHandler('CICADA_NEXT', async ({ request, page, enqueueLinks, log }) => {

    log.info("Crawling " + request.url);
    await page.waitForSelector('ul.pagination.flex.items-center > li > a');
    if (!request.url.includes('?page')) {
        await enqueueLinks({
            selector: 'ul.pagination.flex.items-center > li > a',
            label: 'CICADA_NEXT',
        })
    }
    await enqueueLinks({
        selector: 'a.increase-target[href*="products"]',
        label: 'CICADA_DETAILS',
        limit: 12
    })
});

router.addHandler('CICADA_DETAILS', async ({ request, page, log }) => {
    if ((await page.title()).includes('404')) {
        // call queuemanager to flag item as sold
        await QueueManager.markAsSold(request.url);
        return;
    }

    log.debug(`Extracting data: ${request.url}`);
    log.info("Scraping " + request.url);

    //title
    const title = await page.locator('h1.product-title-block').textContent();

    //description
    const description = await page.locator('div.product-block-area > div.js-enabled.accordian.mt-8 > div.rte.mb-8').allInnerTexts();

    //price
    const priceString = await page.locator('span[data-product-price]').textContent();

    //uid hash
    const dataProductJsonString = await page.locator('script[data-product-json]').textContent();
    let dataProductJson = "";
    let id;
    let postedString: any;
    if (dataProductJsonString != null) {
        dataProductJson = JSON.parse(dataProductJsonString);
        id = dataProductJson['id' as keyof string];
        postedString = dataProductJson['created_at' as keyof string];
    }

    let posted_date = new Date(Date.parse(postedString));
    let seed = request.url + id;

    const listing: Listing = {
        uid: createUID(seed),
        title: title,
        description: description.join('\n'),
        price: parsePriceString(priceString),
        shipping: null,
        currency: "CAD",
        site: "https://cicadasound.ca/",
        url: request.url,
        posted: posted_date,
        tags: createTokens(title),
        inStock: true // if its listed its in stock at this store
    }
    log.debug(`Saving data: ${request.url}`)
    await Dataset.pushData(listing);
});

// moog
router.addHandler('MOOG_NEXT', async ({ request, page, enqueueLinks, log }) => {
    log.info("Crawling " + request.url);
    page.locator('div.product-item > a:visible.product-item__title.text--strong.link');

    if (!request.url.includes('?page')) {
        let pages = await page.locator('div.pagination__nav > a:not(.is-active).pagination__nav-item.link');
        let maxPage = parseInt(await pages.last().textContent() ?? "0");
        const urls: string[] = [];
        for (let i = 2; i <= maxPage; i++) {
            urls.push(`https://moogaudio.com/collections/sales?page=${i}&q=synth`);
        }

        await enqueueLinks({
            urls: urls,
            label: 'MOOG_NEXT',
        })
    }

    await enqueueLinks({
        selector: 'a.product-item__title.text--strong.link',
        label: 'MOOG_DETAILS'
    });
});

router.addHandler('MOOG_DETAILS', async ({ request, page, log }) => {
    log.info("Scraping " + request.url);
    try{
        if ((await page.title()).includes('404')) {
            // call queuemanager to flag item as sold
            await QueueManager.markAsSold(request.url);
            return;
        }

        //title
        const title = await page.locator('h1.product-meta__title.heading').textContent();

        //description
        const description = await page.locator('div.rte.text--pull').allInnerTexts();

        //price
        const priceString = await page.locator('div.price-list > span.price.price--highlight').first().textContent();

        //uid hash
        const seed = await page.locator('div.product-meta > #ssw-avg-rate-profile-html').getAttribute('data-product-id');

        //in stock
        const inStock = await page.locator('span.product-form__info-title.text--strong.with-status-colour').first().textContent();

        const listing: Listing = {
            uid: createUID(seed),
            title: title,
            description: description.join('\n'),
            price: parsePriceString(priceString),
            shipping: null,
            currency: "CAD",
            site: "https://moogaudio.com/",
            url: request.url,
            posted: null,
            tags: createTokens(title),
            inStock: inStock === "In Stock"
        }
        log.info(`Saving data: ${request.url}`)
        await Dataset.pushData(listing);                                        
    } 
    catch(exception){
        // @ts-ignore
        const listing: Listing = {
            url: request.url,
            inStock: false
        }
        log.info(`Saving data: ${request.url}`)
        await Dataset.pushData(listing); 
    }
});

// spaceman
router.addHandler('SM_NEXT', async ({ request, page, enqueueLinks, log }) => {
    log.info("Crawling " + request.url);
    if (!request.url.includes('page')) {
        await page.waitForSelector('ul.page-numbers');
        let pages = await page.locator('li > a:not(.next).page-numbers');
        let maxPage = parseInt(await (await pages.last().allInnerTexts()).join()) ?? 0;
        let urls: string[] = [];
        for (let i = 2; i <= maxPage; i++) {
            urls.push('https://www.spacemanmusic.com/shop/keyboards/page/' + i + '/');
        }
        await enqueueLinks({
            urls: urls,
            label: 'SM_NEXT'
        })
    }
    await enqueueLinks({
        selector: 'div.info.style-grid1 > div.text-center > a[href*="product"]',
        label: 'SM_DETAILS',
        //limit: 12
    })
});

router.addHandler('SM_DETAILS', async ({ request, page, log }) => {
    if ((await page.title()).includes('Page not found')) {
        // call queuemanager to flag item as sold
        await QueueManager.markAsSold(request.url);
        return;
    }
    log.debug(`Extracting data: ${request.url}`);
    log.info("Scraping " + request.url);

    //await page.locator('div[itemscope]').getAttribute('class').then((value) => { return !value?.includes('outOfStock')});
    let isInStock = await page.locator('.outofstock').count() == 0;

    //title
    const title = await page.locator('h1.entry-title').textContent();

    //description
    const description = await page.locator('#tab-description').allInnerTexts();

    //price
    const priceString = await page.locator('p.price').allInnerTexts();
    const priceNoDollarSign = priceString?.join().split("$")[1] ?? "";
    //console.log(priceNoDollarSign);
    const price: number = parsePriceString(priceNoDollarSign);

    //uid hash
    const id = await page.locator('div[itemscope][id*="product"]').getAttribute('id');
    let seed = request.url + id;
    const uid = createUID(seed);


    const listing: Listing = {
        uid: uid,
        title: title,
        description: description.join('\n'),
        price: price,
        shipping: null,
        currency: "CAD",
        site: "https://spacemanmusic.com/",
        url: request.url,
        posted: null,
        tags: createTokens(title),
        inStock: isInStock // if its listed its in stock at this store
    }
    log.debug(`Saving data: ${request.url}`)
    await Dataset.pushData(listing);
});

function expect(arg0: Locator) {
    throw new Error('Function not implemented.');
}
