import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const HTML_FILE = path.join(projectRoot, 'src', 'menu.html');
const OUTPUT_DIR = path.join(projectRoot, 'output');
const PDF_OUTPUT = path.join(OUTPUT_DIR, 'crave-lab-menu-a4-production.pdf');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const PAGE_NAMES = [
  'page-1-rolls',
  'page-2-smash-burgers',
  'page-3-burgers',
  'page-4-boxes',
  'page-5-deals'
];

async function runVerificationPipeline() {
  console.log('====================================================');
  console.log('🚀 CANVAS DESIGN PRINT VERIFICATION & PDF PIPELINE');
  console.log('====================================================');
  console.log(`Document: ${HTML_FILE}`);
  console.log(`Target Dimensions: 794 x 1123 px (A4 at 96 DPI)\n`);

  const browser = await chromium.launch({
    headless: true
  });

  const context = await browser.newContext({
    viewport: { width: 794, height: 1123 },
    deviceScaleFactor: 2 // High-DPI 2x Retina rendering for print inspection
  });

  const page = await context.newPage();

  // Navigate to HTML file
  const fileUrl = `file://${path.resolve(HTML_FILE).replace(/\\/g, '/')}`;
  console.log(`[1/4] Loading document via Headless Chromium: ${fileUrl}...`);
  await page.goto(fileUrl, { waitUntil: 'networkidle' });

  // Evaluate fonts loaded & extract dynamic artboard dimensions
  const pageDims = await page.evaluate(async () => {
    await document.fonts.ready;
    const root = document.querySelector(':root');
    const computed = window.getComputedStyle(root);
    const w = parseFloat(computed.getPropertyValue('--page-width')) || 794;
    const h = parseFloat(computed.getPropertyValue('--page-height')) || 1123;
    return { width: Math.round(w), height: Math.round(h) };
  });

  console.log(`Dynamic Artboard Dimensions: ${pageDims.width} × ${pageDims.height} px`);
  await page.setViewportSize({ width: pageDims.width, height: pageDims.height });

  console.log('[2/4] Inspecting visual metrics & overflow detection...');
  const pagesData = await page.evaluate(() => {
    const pageElements = Array.from(document.querySelectorAll('.page'));
    return pageElements.map((el, index) => {
      const rect = el.getBoundingClientRect();
      const scrollHeight = el.scrollHeight;
      const clientHeight = el.clientHeight;
      const scrollWidth = el.scrollWidth;
      const clientWidth = el.clientWidth;
      const hasVerticalOverflow = scrollHeight > clientHeight + 1;
      const hasHorizontalOverflow = scrollWidth > clientWidth + 1;

      return {
        index: index + 1,
        id: el.id,
        width: rect.width,
        height: rect.height,
        scrollHeight,
        clientHeight,
        scrollWidth,
        clientWidth,
        hasVerticalOverflow,
        hasHorizontalOverflow
      };
    });
  });

  let allPassed = true;
  for (const pageInfo of pagesData) {
    const status = (!pageInfo.hasVerticalOverflow && !pageInfo.hasHorizontalOverflow) ? '✅ PASS' : '❌ FAIL (OVERFLOW)';
    console.log(`  • Board ${pageInfo.index} [${pageInfo.id}]: ${pageInfo.width}x${pageInfo.height}px | Scroll: ${pageInfo.scrollHeight}px | Status: ${status}`);
    if (pageInfo.hasVerticalOverflow || pageInfo.hasHorizontalOverflow) {
      allPassed = false;
      console.warn(`    ⚠️ Warning: Page ${pageInfo.index} content exceeds boundary box!`);
    }
  }

  console.log('\n[3/4] Capturing pixel-perfect visual verification screenshots (2x Retina)...');
  const pageElements = await page.$$('.page');
  for (let i = 0; i < pageElements.length; i++) {
    const pageElement = pageElements[i];
    const fileName = `${PAGE_NAMES[i] || `page-${i + 1}`}.png`;
    const screenshotPath = path.join(OUTPUT_DIR, fileName);
    await pageElement.screenshot({
      path: screenshotPath,
      type: 'png'
    });
    const stats = fs.statSync(screenshotPath);
    console.log(`  📸 Saved screenshot: ${fileName} (${Math.round(stats.size / 1024)} KB)`);
  }

  console.log(`\n[4/4] Compiling high-fidelity vector-preserving PDF (${pageDims.width}x${pageDims.height} px)...`);
  await page.pdf({
    path: PDF_OUTPUT,
    width: `${pageDims.width}px`,
    height: `${pageDims.height}px`,
    printBackground: true,
    preferCSSPageSize: true,
    margin: {
      top: '0px',
      right: '0px',
      bottom: '0px',
      left: '0px'
    }
  });

  const pdfStats = fs.statSync(PDF_OUTPUT);
  console.log(`  📄 Production PDF generated: ${path.basename(PDF_OUTPUT)} (${Math.round(pdfStats.size / 1024)} KB)`);

  await browser.close();

  console.log('\n====================================================');
  if (allPassed) {
    console.log('✨ PIPELINE COMPLETE: ALL 5 A4 PAGES PASSED ZERO-OVERFLOW VERIFICATION!');
  } else {
    console.log('⚠️ PIPELINE FINISHED WITH LAYOUT WARNINGS. PLEASE REVIEW SCREENSHOTS.');
  }
  console.log('====================================================\n');
}

runVerificationPipeline().catch((err) => {
  console.error('Fatal Pipeline Error:', err);
  process.exit(1);
});
