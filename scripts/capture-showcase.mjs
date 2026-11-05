import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

async function capture() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  // 1. Screenshot with Welcome Modal open
  await page.goto('http://localhost:3001');
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(projectRoot, 'output', 'psycbeat-welcome-modal.png') });
  console.log('Saved psycbeat-welcome-modal.png');

  // 2. Click Start Designing on Blank Canvas
  await page.click('#btnWelcomeStart');
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(projectRoot, 'output', 'psycbeat-studio-blank.png') });
  console.log('Saved psycbeat-studio-blank.png');

  // 3. Add Vector Shapes
  await page.click('.tool-btn[data-tool="rect"]');
  await page.waitForTimeout(200);
  await page.click('.tool-btn[data-tool="circle"]');
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(projectRoot, 'output', 'psycbeat-studio-vectors.png') });
  console.log('Saved psycbeat-studio-vectors.png');

  await browser.close();
}

capture().catch(err => {
  console.error(err);
  process.exit(1);
});
