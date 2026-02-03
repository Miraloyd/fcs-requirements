const puppeteer = require('puppeteer');
const path = require('path');
const http = require('http');
const fs = require('fs');

(async () => {
    // Serve HTML via local HTTP so Google Fonts can load
    const htmlDir = __dirname;
    const server = http.createServer((req, res) => {
        let filePath = path.join(htmlDir, req.url === '/' ? 'filled-example-slides.html' : req.url);
        let ext = path.extname(filePath);
        let contentType = ext === '.html' ? 'text/html' : ext === '.css' ? 'text/css' : 'application/octet-stream';
        fs.readFile(filePath, (err, data) => {
            if (err) { res.writeHead(404); res.end(); return; }
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        });
    });

    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const port = server.address().port;

    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    const page = await browser.newPage();

    await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'networkidle0', timeout: 30000 });

    // Wait for fonts to fully load
    await page.evaluateHandle('document.fonts.ready');

    await page.pdf({
        path: path.join(__dirname, 'FCS-WEBFORM-FILLED-EXAMPLE.pdf'),
        width: '13.333in',
        height: '7.5in',
        printBackground: true,
        preferCSSPageSize: true,
        margin: { top: 0, right: 0, bottom: 0, left: 0 }
    });

    await browser.close();
    server.close();

    const stats = fs.statSync(path.join(__dirname, 'FCS-WEBFORM-FILLED-EXAMPLE.pdf'));
    console.log(`PDF: ${(stats.size/1024).toFixed(0)} KB`);
    console.log('Done.');
})();
