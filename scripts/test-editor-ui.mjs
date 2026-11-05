import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

async function testEditorUI() {
  console.log('Testing Illustrator Canvas Studio UI with Headless Chromium...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  // Load editor from server
  await page.goto('http://localhost:3001', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Check if artboard loaded
  const artboardsCount = await page.$$eval('.page-artboard-wrapper', els => els.length);
  console.log(`Loaded ${artboardsCount} artboards in the Studio.`);

  // Click on the first menu card
  const firstCard = await page.$('.menu-card');
  if (firstCard) {
    await firstCard.click();
    console.log('Selected first menu card.');
    await page.waitForTimeout(500);

    // Verify inspector updated
    const titleVal = await page.$eval('#inpItemTitle', el => el.value);
    const priceVal = await page.$eval('#inpPrice', el => el.value);
    console.log(`Inspector synced -> Title: "${titleVal}", Price: "${priceVal}"`);
  }

  // Capture screenshot of the full Studio workbench
  const screenshotPath = path.join(projectRoot, 'output', 'editor-studio-ui.png');
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`Saved Studio screenshot to: ${screenshotPath}`);

  await browser.close();
}

testEditorUI().catch(console.error);
