import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

async function testAutoRefresh() {
  console.log('Testing whether browser DOM updates without refresh...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));

  await page.goto('http://localhost:3001', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const initialTitle = await page.$eval('.page-artboard-wrapper[data-board-id="page-1"] .item-title', el => el.textContent.trim());
  console.log('Initial Card Title in browser:', initialTitle);

  // Now modify src/menu.html directly on disk with a distinct test string
  const menuPath = path.join(projectRoot, 'src', 'menu.html');
  let html = fs.readFileSync(menuPath, 'utf8');
  const testMarker = `TEST LIVE RELOAD ${Date.now()}`;
  html = html.replace('Nashville Hot Chicken Roll', testMarker);
  
  console.log('Writing change to disk to trigger live-sync...');
  fs.writeFileSync(menuPath, html, 'utf8');

  // Wait 2.5 seconds to see if DOM auto-updates
  await page.waitForTimeout(2500);

  const updatedTitle = await page.$eval('.page-artboard-wrapper[data-board-id="page-1"] .item-title', el => el.textContent.trim());
  console.log('Updated Card Title in browser:', updatedTitle);

  const success = updatedTitle === testMarker;
  console.log('Did browser update WITHOUT refresh?', success ? '✅ YES' : '❌ NO');

  // Revert change
  html = html.replace(testMarker, 'Nashville Hot Chicken Roll');
  fs.writeFileSync(menuPath, html, 'utf8');

  await browser.close();
}

testAutoRefresh().catch(console.error);
