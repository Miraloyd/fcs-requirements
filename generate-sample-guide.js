/**
 * FCS Webform — Sample Guide PDF Generator
 * Generates a branded PDF showing each form page filled with realistic sample data.
 * Client uses this as a reference when completing their own form.
 *
 * Session: CC-rOS-20260131-002
 * Instance: Shikamaru
 * Timestamp: 2026-02-02
 */

const puppeteer = require('puppeteer');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const FORM_URL = 'https://miraloyd.github.io/fcs-requirements/';
const OUTPUT_DIR = path.join(__dirname, 'sample-guide-screenshots');
const PDF_PATH = path.join(__dirname, 'FCS-WEBFORM-SAMPLE-GUIDE.pdf');

// Realistic sample data for a fictional school
const SAMPLE_DATA = {
    // Page 1 — School Identity
    school_name: 'Harmony Academy International',
    school_motto: 'Knowledge, Faith, Excellence',
    year_established: '2005',
    school_usp: 'A leading co-educational school offering a blended Nigerian and British curriculum, with a strong emphasis on character development, STEM education, and extracurricular enrichment. Our students consistently achieve top results in WAEC, NECO, and Cambridge IGCSE examinations.',
    accreditations: 'Approved by FCT Education Board. WAEC/NECO Centre. Cambridge International School. Member, Association of Private Educators in Nigeria (APEN).',

    // Page 2 — Branding
    school_colours: 'Royal Blue (#003366), Gold (#D4AF37), White (#FFFFFF)',

    // Page 4 — Admissions
    admission_process: 'Parents can apply online or visit the school. Admission process includes: (1) Completion of application form, (2) Entrance assessment in English and Mathematics, (3) Interview with the Head of School, (4) Payment of acceptance fee upon offer. Applications open from September to January each year.',

    // Page 6 — Social & Contact
    school_address: '25 Unity Close, Maitama District, Abuja, FCT, Nigeria',
    school_phone: '+234 809 123 4567\n+234 703 987 6543',
    school_email: 'info@harmonyacademy.ng',
    facebook_url: 'https://facebook.com/harmonyacademyng',
    instagram_url: 'https://instagram.com/harmonyacademy_ng',

    // Page 7 — Technical
    domain_name: 'harmonyacademy.ng',

    // Page 8 — Timeline
    primary_contact: 'Mrs. Ngozi Obi, Proprietress',
    additional_notes: 'We would like the website to reflect our school values and provide an easy way for parents to access information. Mobile-friendly design is very important as most of our parents use smartphones.'
};

async function run() {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        defaultViewport: { width: 1280, height: 900, deviceScaleFactor: 2 }
    });

    const page = await browser.newPage();

    // Create output directory
    if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

    console.log('Navigating to form...');
    await page.goto(FORM_URL, { waitUntil: 'networkidle2', timeout: 30000 });

    // Clear localStorage
    await page.evaluate(() => localStorage.clear());
    await page.goto(FORM_URL, { waitUntil: 'networkidle2', timeout: 30000 });

    console.log('Filling all fields...');
    await page.evaluate((data) => {
        function fill(n,v){const e=document.querySelector(`[name="${n}"]`);if(e){e.value=v;e.dispatchEvent(new Event('input',{bubbles:1}));e.dispatchEvent(new Event('change',{bubbles:1}));}}
        function fillTa(n,v){const e=document.querySelector(`textarea[name="${n}"]`);if(e){e.value=v;e.dispatchEvent(new Event('input',{bubbles:1}));}}
        function radioIdx(n,i){const e=document.querySelectorAll(`[name="${n}"]`);if(e[i]){e[i].checked=1;e[i].dispatchEvent(new Event('change',{bubbles:1}));}}
        function chkId(id){const e=document.getElementById(id);if(e){e.checked=1;e.dispatchEvent(new Event('change',{bubbles:1}));}}

        // P1 — School Identity
        fill('school_name', data.school_name);
        chkId('lv0'); // Creche
        chkId('lv1'); // Pre-Nursery
        chkId('lv2'); // Primary
        chkId('lv3'); // JSS
        chkId('lv4'); // SSS
        fill('school_motto', data.school_motto);
        fill('year_established', data.year_established);
        fillTa('school_usp', data.school_usp);
        // Curriculum
        const currBoxes = document.querySelectorAll('[name="curriculum"]');
        if(currBoxes[0]) { currBoxes[0].checked = true; } // NERDC
        if(currBoxes[2]) { currBoxes[2].checked = true; } // WAEC/NECO
        if(currBoxes[3]) { currBoxes[3].checked = true; } // Cambridge
        fillTa('accreditations', data.accreditations);

        // P2 — Branding
        fill('school_colours', data.school_colours);
        radioIdx('website_feel', 0); // Professional & Academic

        // P3 — Pages & Features
        ['pg0','pg1','pg2','pg3','pg4','pg5','pg6','pg7','pg10','pg11','pg12','pg13'].forEach(id => chkId(id));
        ['ft0','ft1','ft2','ft3','ft4','ft5','ft6'].forEach(id => chkId(id));

        // P4 — Admissions
        fillTa('admission_process', data.admission_process);
        radioIdx('fee_display', 2); // No — parents should contact
        // Facilities
        const facs = document.querySelectorAll('[name="facilities"]');
        [0,1,2,3,4].forEach(i => { if(facs[i]) facs[i].checked = true; });

        // P5 — Content
        radioIdx('promo_video', 1); // No
        radioIdx('content_source', 1); // Kindly draft it

        // P6 — Contact
        fillTa('school_address', data.school_address);
        fillTa('school_phone', data.school_phone);
        fill('school_email', data.school_email);
        // Social media — IDs are sm1=Facebook, sm2=Instagram (NOT sm0/sm1)
        // Must check + call toggleSocialURL to reveal URL fields
        const smFb = document.getElementById('sm1');
        const smIg = document.getElementById('sm2');
        if(smFb) { smFb.checked = true; if(typeof toggleSocialURL==='function') toggleSocialURL('sm1','fbUrl'); }
        if(smIg) { smIg.checked = true; if(typeof toggleSocialURL==='function') toggleSocialURL('sm2','igUrl'); }
        // Fill URLs after conditional fields are revealed
        fill('facebook_url', data.facebook_url);
        fill('instagram_url', data.instagram_url);

        // P7 — Technical
        radioIdx('domain_status', 0); // Yes — I own it
        fill('domain_name', data.domain_name);
        radioIdx('hosting_status', 1); // No
        radioIdx('email_setup', 2); // Using Gmail/Yahoo
        radioIdx('credentials_method', 0); // WhatsApp/call

        // P8 — Timeline
        radioIdx('timeline', 1); // Within 2 weeks
        fill('primary_contact', data.primary_contact);
        radioIdx('website_updater', 1); // We need MGCL to help
        fillTa('additional_notes', data.additional_notes);
    }, SAMPLE_DATA);

    // Wait for setTimeout-delayed fills (Instagram URL, etc.)
    await new Promise(r => setTimeout(r, 500));

    // Re-verify social media checkboxes and URL fields
    await page.evaluate((data) => {
        function fill(n,v){const e=document.querySelector(`[name="${n}"]`);if(e){e.value=v;e.dispatchEvent(new Event('input',{bubbles:1}));}}
        // Facebook = sm1, Instagram = sm2
        const smFb = document.getElementById('sm1');
        const smIg = document.getElementById('sm2');
        if (smFb && !smFb.checked) { smFb.checked = true; if(typeof toggleSocialURL==='function') toggleSocialURL('sm1','fbUrl'); }
        if (smIg && !smIg.checked) { smIg.checked = true; if(typeof toggleSocialURL==='function') toggleSocialURL('sm2','igUrl'); }
        fill('facebook_url', data.facebook_url);
        fill('instagram_url', data.instagram_url);
    }, SAMPLE_DATA);

    // Navigate and screenshot each page
    const pageNames = [
        '01 — School Identity',
        '02 — Branding & Visual Identity',
        '03 — Website Pages & Features',
        '04 — Admissions & Academics',
        '05 — Content, Images & Brand Assets',
        '06 — Social Media & Contact Info',
        '07 — Technical & Backend Access',
        '08 — Timeline & Final Details'
    ];

    for (let i = 0; i < 8; i++) {
        console.log(`Capturing Page ${i + 1}: ${pageNames[i]}`);

        // Screenshot full page
        const screenshotPath = path.join(OUTPUT_DIR, `page-${String(i + 1).padStart(2, '0')}.png`);
        await page.screenshot({ path: screenshotPath, fullPage: true });

        if (i < 7) {
            // Try to click Continue
            const advanced = await page.evaluate(() => {
                const btns = document.querySelectorAll('button');
                const cont = Array.from(btns).find(b => b.textContent.trim() === 'Continue' && b.offsetParent !== null);
                if (cont) { cont.click(); return true; }
                return false;
            });

            if (!advanced) {
                console.log(`  Navigation blocked on page ${i + 1}, fixing required fields...`);
                // Fill any missing required fields on the active page
                await page.evaluate(() => {
                    const active = document.querySelector('.page.active');
                    if (!active) return;
                    active.querySelectorAll('[required]').forEach(el => {
                        if (el.type === 'radio') {
                            const name = el.name;
                            const checked = document.querySelector(`[name="${name}"]:checked`);
                            if (!checked) {
                                const first = document.querySelector(`[name="${name}"]`);
                                if (first) { first.checked = true; first.dispatchEvent(new Event('change', {bubbles:true})); }
                            }
                        } else if (!el.value) {
                            el.value = 'Sample response';
                            el.dispatchEvent(new Event('input', {bubbles:true}));
                        }
                    });
                    // Retry Continue
                    const btns = document.querySelectorAll('button');
                    const cont = Array.from(btns).find(b => b.textContent.trim() === 'Continue' && b.offsetParent !== null);
                    if (cont) cont.click();
                });
            }
            await new Promise(r => setTimeout(r, 500));
        }
    }

    await browser.close();
    console.log('Screenshots captured. Generating PDF...');

    // Generate PDF
    const doc = new PDFDocument({ layout: 'landscape', size: 'A4', margin: 0 });
    const stream = fs.createWriteStream(PDF_PATH);
    doc.pipe(stream);

    const pageWidth = doc.page.width;   // 841.89
    const pageHeight = doc.page.height; // 595.28

    // Title page
    doc.rect(0, 0, pageWidth, pageHeight).fill('#1a3a5c');
    doc.fontSize(28).fillColor('#ffffff').text('FCS Website Requirements', 0, 180, { align: 'center' });
    doc.fontSize(28).fillColor('#c8a84e').text('Questionnaire', 0, 220, { align: 'center' });
    doc.moveDown(2);
    doc.fontSize(16).fillColor('#ffffff').text('Sample Guide', { align: 'center' });
    doc.moveDown(1);
    doc.fontSize(11).fillColor('#aabbcc').text('This document shows a filled example of the questionnaire.', { align: 'center' });
    doc.text('Use it as a guide when completing your own form.', { align: 'center' });
    doc.moveDown(3);
    doc.fontSize(10).fillColor('#667788').text('Miraloyd Global Consult Ltd', { align: 'center' });
    doc.text('www.miraloyd.com', { align: 'center' });

    // Content pages
    for (let i = 0; i < 8; i++) {
        doc.addPage({ layout: 'landscape', size: 'A4', margin: 0 });

        // Header bar
        doc.rect(0, 0, pageWidth, 45).fill('#1a3a5c');
        doc.fontSize(12).fillColor('#ffffff').text(
            `Sample Guide — ${pageNames[i]}`,
            20, 14
        );
        doc.fontSize(9).fillColor('#c8a84e').text(
            `Page ${i + 1} of 8`,
            pageWidth - 100, 16
        );

        // Screenshot
        const imgPath = path.join(OUTPUT_DIR, `page-${String(i + 1).padStart(2, '0')}.png`);
        if (fs.existsSync(imgPath)) {
            const imgWidth = pageWidth - 60;
            const imgHeight = pageHeight - 75;
            doc.image(imgPath, 30, 52, {
                fit: [imgWidth, imgHeight],
                align: 'center',
                valign: 'center'
            });
        }

        // Footer
        doc.fontSize(7).fillColor('#999999').text(
            'Sample Guide — Miraloyd Global Consult Ltd | www.miraloyd.com',
            0, pageHeight - 15,
            { align: 'center' }
        );
    }

    doc.end();

    await new Promise(resolve => stream.on('finish', resolve));

    const stats = fs.statSync(PDF_PATH);
    console.log(`\nPDF generated: ${PDF_PATH}`);
    console.log(`Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
    console.log('Done.');
}

run().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
