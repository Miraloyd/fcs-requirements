const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    const page = await browser.newPage();

    const htmlPath = path.join(__dirname, 'filled-example-slides.html');
    await page.goto('file:///' + htmlPath.replace(/\\/g, '/'), { waitUntil: 'networkidle2' });

    await page.pdf({
        path: path.join(__dirname, 'FCS-WEBFORM-FILLED-EXAMPLE.pdf'),
        width: '13.333in',
        height: '7.5in',
        printBackground: true,
        preferCSSPageSize: true,
        margin: { top: 0, right: 0, bottom: 0, left: 0 }
    });

    await browser.close();

    const fs = require('fs');
    const stats = fs.statSync(path.join(__dirname, 'FCS-WEBFORM-FILLED-EXAMPLE.pdf'));
    console.log(`PDF: ${(stats.size/1024).toFixed(0)} KB`);
    console.log('Done.');
})();
