# E-commerce Product URL Crawler

A web application built with Node.js that crawls e-commerce websites to discover and collect product URLs. This crawler can handle multiple domains simultaneously and provides a clean interface to view and manage the discovered URLs.

## Features

- Crawls multiple e-commerce websites simultaneously
- Intelligent product URL detection
- Handles JavaScript-rendered content
- MongoDB integration for persistent storage
- Clean, responsive user interface
- No client-side JavaScript required
- Server-side rendering with EJS templates

## Technology Stack

- Backend: Node.js with Express
- Database: MongoDB
- Template Engine: EJS
- Web Scraping: Puppeteer, Cheerio
- Styling: Pure CSS

## Prerequisites

Before running this project, make sure you have the following installed:
- Node.js (v14 or higher)
- MongoDB Community Edition
- Git

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ecommerce-crawler.git
cd ecommerce-crawler
```

2. Install dependencies:
```bash
npm install
```

3. Make sure MongoDB is running:
```bash
# In a separate terminal/command prompt
mongod
```

4. Start the application:
```bash
node server.js
```

5. Open your browser and navigate to:
```
http://localhost:3000
```

## Project Structure

```
ecommerce-crawler/
├── server.js           # Main application file
├── public/
│   └── styles.css     # Stylesheet
├── views/
│   ├── index.ejs      # Main page template
│   └── results.ejs    # Results page template
├── package.json
└── README.md
```

## Usage

1. Start the application and navigate to http://localhost:3000
2. Enter e-commerce domain names in the textarea (one per line)
   Example domains:
   ```
   amazon.in
   flipkart.com
   myntra.com
   ```
3. Click "Start Crawling" to begin the crawling process
4. View results on the same page or navigate to "View All Results" to see historical data

## Features in Detail

### Product URL Detection
- Intelligent pattern matching for common product URL formats
- Configurable patterns for different e-commerce platforms
- Automatic URL deduplication

### Scalability
- Handles multiple domains concurrently
- Efficient memory usage
- Persistent storage of results

### Error Handling
- Graceful handling of network errors
- Timeout management
- Invalid URL detection

## Configuration

The crawler can be configured by modifying the following parameters in `server.js`:

- `maxConcurrentRequests`: Maximum number of concurrent requests
- `requestDelay`: Delay between requests
- `maxDepth`: Maximum crawling depth
- `timeout`: Request timeout in milliseconds

## Common Issues and Solutions

1. MongoDB Connection Issues
   - Ensure MongoDB is running (`mongod` command)
   - Check if the MongoDB port (27017) is available

2. Puppeteer Issues
   - If you encounter Puppeteer errors, try running with different arguments:
     ```javascript
     puppeteer.launch({
       headless: true,
       args: ['--no-sandbox', '--disable-setuid-sandbox']
     })
     ```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details

## Acknowledgments

- Built with Node.js and Express
- Uses Puppeteer for JavaScript rendering
- MongoDB for data persistence
- EJS for templating

## Contact

Your Name - [rakeshchowdaryyelledi@gmail.com]
Project Link: [https://github.com/Rakeshyelledi/Shoppin_Assignment]
