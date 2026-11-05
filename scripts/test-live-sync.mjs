import { chromium } from 'playwright';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

async function testLiveSync() {
  console.log('Testing Live Sync & AI Ghost Cursor in Headless Browser...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  // Open the studio
  await page.goto('http://localhost:3001', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Trigger agent act
  console.log('Dispatching agent action to focus Board 02 Smash Burgers card 1...');
  const act = spawn(process.execPath, [
    path.join(projectRoot, 'scripts', 'agent-act.mjs'),
    'focus',
    '--board', 'page-2',
    '--card', '1',
    '--msg', 'Antigravity editing smash patties...'
  ]);

  await new Promise(r => act.on('close', r));
  await page.waitForTimeout(1200);

  // Verify cursor is visible
  const isCursorVisible = await page.$eval('#aiGhostCursor', el => el.style.display !== 'none');
  const actionText = await page.$eval('#aiActionText', el => el.textContent);
  console.log(`Ghost Cursor visible: ${isCursorVisible}, Action Text: "${actionText}"`);

  // Screenshot the live editing action!
  const screenshotPath = path.join(projectRoot, 'output', 'live-ai-cursor-test.png');
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`Saved screenshot of live AI cursor: ${screenshotPath}`);

  await browser.close();
}

testLiveSync().catch(console.error);
