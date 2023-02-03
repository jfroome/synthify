# synthesizer searcher


This app crawls local music stores and kijiji and collects listings of synthesizers and other music gear that I am interested in. It makes use of Crawlee, Playwright and kijiji-scraper to crawl and scrape the data. It stores all of the data in a local storage which is then processed by a Queuemanager and subsequently submitted to a restful API which is connected to my MongoDB backend. 

Planned future functionality:

Add facebook marketplace / reverb.com / ebay integration.
