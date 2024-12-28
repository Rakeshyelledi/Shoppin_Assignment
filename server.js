require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');
const puppeteer = require('puppeteer');
const mongoose = require('mongoose');

const app = express();

// MongoDB Connection
const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ecommerce_crawler';
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));

// Product URL Schema
const ProductURLSchema = new mongoose.Schema({
    domain: String,
    url: String,
    discoveredAt: { type: Date, default: Date.now },
});

const ProductURL = mongoose.model('ProductURL', ProductURLSchema);

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

// Crawler Class
class EcommerceCrawler {
    constructor() {
        this.productPatterns = [
            /\/product\//i,
            /\/item\//i,
            /\/p\//i,
            /\/products\//i,
            /pdp\//i,
            /\/catalog\//i,
            /-p-\d+/i,
            /\/dp\//i,
        ];
        this.visitedUrls = new Set();
        this.productUrls = new Set();
        this.maxResults = 20; // Set the desired result limit (10-20)
        this.browser = null;
    }

    async init() {
        this.browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
        }
    }

    isProductUrl(url) {
        return this.productPatterns.some(pattern => pattern.test(url));
    }

    async getPageContent(url) {
        try {
            const page = await this.browser.newPage();
            await page.goto(url, { 
                waitUntil: 'domcontentloaded', 
                timeout: 60000 // Increased timeout for slow loading pages
            });
            const content = await page.content();
            await page.close();
            return content;
        } catch (error) {
            console.error(`Error fetching ${url}: ${error.message}`);
            return null;
        }
    }

    extractUrls(html, baseUrl) {
        const $ = cheerio.load(html);
        const urls = new Set();

        $('a').each((_, element) => {
            const href = $(element).attr('href');
            if (href) {
                try {
                    const absoluteUrl = new URL(href, baseUrl).href;
                    if (absoluteUrl.startsWith(baseUrl)) {
                        urls.add(absoluteUrl);
                    }
                } catch (error) {
                    console.error(`Invalid URL: ${href}`);
                }
            }
        });

        return urls;
    }

    async crawlUrl(url, domain, depth = 0) {
        if (depth > 5 || this.visitedUrls.has(url)) {
            return;
        }

        // Stop crawling if we've reached the maximum number of results
        if (this.productUrls.size >= this.maxResults) {
            return;
        }

        this.visitedUrls.add(url);

        const html = await this.getPageContent(url);
        if (!html) return;

        if (this.isProductUrl(url)) {
            this.productUrls.add(url);
            await ProductURL.findOneAndUpdate(
                { domain, url },
                { domain, url },
                { upsert: true }
            );
            console.log(`Found product URL: ${url}`);
        }

        const newUrls = this.extractUrls(html, domain);
        const promises = Array.from(newUrls)
            .filter(newUrl => !this.visitedUrls.has(newUrl))
            .map(newUrl => this.crawlUrl(newUrl, domain, depth + 1));

        await Promise.all(promises);
    }

    async crawlDomain(domain) {
        if (!domain.startsWith('http')) {
            domain = `https://${domain}`;
        }

        this.visitedUrls.clear();
        this.productUrls.clear();

        try {
            await this.crawlUrl(domain, domain);
            return Array.from(this.productUrls);
        } catch (error) {
            console.error(`Error crawling ${domain}: ${error.message}`);
            return [];
        }
    }
}

// Routes
app.get('/', (req, res) => {
    res.render('index', { results: null, error: null });
});

app.post('/crawl', async (req, res) => {
    const domains = req.body.domains
        .split('\n')
        .map(domain => domain.trim())
        .filter(domain => domain);

    if (domains.length === 0) {
        return res.render('index', {
            results: null,
            error: 'Please enter at least one domain',
        });
    }

    const crawler = new EcommerceCrawler();
    await crawler.init();

    try {
        const results = {};
        for (const domain of domains) {
            results[domain] = await crawler.crawlDomain(domain);
        }

        res.render('index', { results, error: null });
    } catch (error) {
        res.render('index', {
            results: null,
            error: error.message,
        });
    } finally {
        await crawler.close();
    }
});

app.get('/results', async (req, res) => {
    try {
        const results = await ProductURL.find({});
        console.log(`Retrieved ${results.length} results from the database`);
        res.render('results', { results });
    } catch (error) {
        console.error('Error fetching results from MongoDB:', error);
        res.render('results', {
            results: [],
            error: error.message,
        });
    }
});

// Server Setup
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
