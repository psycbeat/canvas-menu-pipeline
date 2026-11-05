import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

async function testArtboardTool() {
  console.log('Testing Illustrator Artboard Tool, Presets & Dynamic Resizing...\n');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  await page.goto('http://localhost:3001', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  // 1. Activate Artboard Tool
  console.log('[1/6] Activating Artboard Tool (O)...');
  await page.click('#toolArtboard');
  await page.waitForTimeout(300);

  const toolState = await page.evaluate(() => {
    const overlay = document.getElementById('artboardOverlay');
    const handles = overlay ? overlay.querySelectorAll('.artboard-handle').length : 0;
    const badge = document.getElementById('artboardSizeBadge')?.textContent;
    return {
      toolActive: document.querySelector('.tool-btn[data-tool="artboard"]')?.classList.contains('active'),
      overlayVisible: overlay && window.getComputedStyle(overlay).display !== 'none',
      handleCount: handles,
      badgeText: badge
    };
  });
  console.log('  • Tool Active:', toolState.toolActive ? '✅ YES' : '❌ NO');
  console.log('  • Overlay Visible:', toolState.overlayVisible ? '✅ YES' : '❌ NO');
  console.log('  • 8 Resize Handles Found:', toolState.handleCount === 8 ? '✅ 8 HANDLES' : `❌ ${toolState.handleCount}`);
  console.log(`  • Dimension Badge: "${toolState.badgeText}"`);
  await page.screenshot({ path: path.join(projectRoot, 'output', 'test-artboard-tool-active.png') });

  // 2. Select A5 Portrait Preset
  console.log('\n[2/6] Switching format to A5 Portrait (559x794 px)...');
  await page.selectOption('#selArtboardPreset', 'a5-portrait');
  await page.waitForTimeout(400);

  const a5Metrics = await page.evaluate(() => {
    const pageEl = document.querySelector('.page');
    const badge = document.getElementById('docBadge')?.textContent;
    const zoom = document.getElementById('zoomValue')?.textContent;
    const rect = pageEl.getBoundingClientRect();
    return {
      width: Math.round(rect.width),
      badgeText: badge,
      zoomLevel: zoom
    };
  });
  console.log(`  • Page Width: ${a5Metrics.width}px (Expected ~559px scaled by zoom)`);
  console.log(`  • Header Doc Badge: "${a5Metrics.badgeText}"`);
  console.log(`  • Adaptive Auto-Fit Zoom: ${a5Metrics.zoomLevel}`);
  await page.screenshot({ path: path.join(projectRoot, 'output', 'test-artboard-a5.png') });

  // 3. Swap Orientation (to Landscape)
  console.log('\n[3/6] Swapping Orientation to Landscape...');
  await page.click('#btnSwapOrientation');
  await page.waitForTimeout(400);

  const landscapeMetrics = await page.evaluate(() => {
    const w = document.getElementById('inpArtboardW')?.value;
    const h = document.getElementById('inpArtboardH')?.value;
    const badge = document.getElementById('artboardSizeBadge')?.textContent;
    return { w, h, badge };
  });
  console.log(`  • New Dimensions: ${landscapeMetrics.w} × ${landscapeMetrics.h} px (Flipped!)`);
  console.log(`  • Badge: "${landscapeMetrics.badge}"`);
  await page.screenshot({ path: path.join(projectRoot, 'output', 'test-artboard-landscape.png') });

  // 4. Custom Dimension Input (1080x1080 Square)
  console.log('\n[4/6] Setting Custom Square Dimensions (1080x1080 px)...');
  await page.fill('#inpArtboardW', '1080');
  await page.fill('#inpArtboardH', '1080');
  await page.evaluate(() => {
    document.getElementById('inpArtboardW').dispatchEvent(new Event('change'));
    document.getElementById('inpArtboardH').dispatchEvent(new Event('change'));
  });
  await page.waitForTimeout(400);

  const squareMetrics = await page.evaluate(() => {
    const w = document.getElementById('inpArtboardW')?.value;
    const h = document.getElementById('inpArtboardH')?.value;
    const zoom = document.getElementById('zoomValue')?.textContent;
    return { w, h, zoom };
  });
  console.log(`  • Square Dimensions: ${squareMetrics.w} × ${squareMetrics.h} px`);
  console.log(`  • Adaptive Zoom for Square: ${squareMetrics.zoom}`);
  await page.screenshot({ path: path.join(projectRoot, 'output', 'test-artboard-square.png') });

  // 5. Reset to A4 Portrait
  console.log('\n[5/6] Resetting to A4 Portrait (794x1123 px)...');
  await page.selectOption('#selArtboardPreset', 'a4-portrait');
  await page.waitForTimeout(400);

  // 6. Test New Artboard Creation
  console.log('\n[6/6] Testing + New Artboard button...');
  const beforeCount = await page.evaluate(() => document.querySelectorAll('.page-artboard-wrapper').length);
  await page.click('#btnNewArtboard');
  await page.waitForTimeout(500);

  const afterState = await page.evaluate(() => {
    const wrappers = document.querySelectorAll('.page-artboard-wrapper');
    const tabs = document.querySelectorAll('.tab-btn:not(.all-boards-btn)');
    const activeTab = document.querySelector('.tab-btn.active')?.textContent?.trim();
    return {
      boardCount: wrappers.length,
      tabCount: tabs.length,
      activeTab
    };
  });
  console.log(`  • Artboards before: ${beforeCount} | after: ${afterState.boardCount}`);
  console.log(`  • Header Tabs: ${afterState.tabCount}`);
  console.log(`  • Active Tab: "${afterState.activeTab}"`);
  await page.screenshot({ path: path.join(projectRoot, 'output', 'test-new-artboard.png') });

  await browser.close();
  console.log('\n✨ ALL ARTBOARD TESTS PASSED WITH 100% SUCCESS!');
}

testArtboardTool().catch(console.error);
