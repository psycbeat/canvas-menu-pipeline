import { chromium } from 'playwright';

async function runTest() {
  console.log('====================================================');
  console.log('🧪 TESTING ZOOM SELECTION LOCK & AUTO-ORGANIZE DRAG');
  console.log('====================================================\n');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  await page.addInitScript(() => localStorage.setItem('psycbeat_canvas_welcomed', 'true'));
  await page.goto('http://localhost:3001?template=demo', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  // ----------------------------------------------------
  // TEST 1: ZOOM SELECTION LOCK (ZERO DRIFT)
  // ----------------------------------------------------
  console.log('--- TEST 1: ZOOM SELECTION LOCK ---');
  const pricePill = await page.$('.menu-card .price-pill');
  if (!pricePill) throw new Error('Price pill not found');
  await pricePill.click();
  await page.waitForTimeout(200);

  // Zoom In x 3 times
  for (let i = 1; i <= 3; i++) {
    await page.click('#btnZoomIn');
    await page.waitForTimeout(100);

    const check = await page.evaluate(() => {
      const overlay = document.getElementById('transformOverlay');
      const pill = document.querySelector('.menu-card .price-pill');
      const oRect = overlay.getBoundingClientRect();
      const pRect = pill.getBoundingClientRect();
      return {
        zoom: document.getElementById('zoomValue')?.textContent,
        deltaX: Math.abs(oRect.left - pRect.left),
        deltaY: Math.abs(oRect.top - pRect.top),
        oRect,
        pRect
      };
    });

    console.log(`  [Step ${i}] Zoom: ${check.zoom} | Delta X: ${check.deltaX.toFixed(3)}px | Delta Y: ${check.deltaY.toFixed(3)}px`);
    if (check.deltaX > 1.5 || check.deltaY > 1.5) {
      throw new Error(`Zoom drift detected! DeltaX=${check.deltaX}, DeltaY=${check.deltaY}`);
    }
  }

  // Zoom Out x 2 times
  for (let i = 1; i <= 2; i++) {
    await page.click('#btnZoomOut');
    await page.waitForTimeout(100);

    const check = await page.evaluate(() => {
      const overlay = document.getElementById('transformOverlay');
      const pill = document.querySelector('.menu-card .price-pill');
      const oRect = overlay.getBoundingClientRect();
      const pRect = pill.getBoundingClientRect();
      return {
        zoom: document.getElementById('zoomValue')?.textContent,
        deltaX: Math.abs(oRect.left - pRect.left),
        deltaY: Math.abs(oRect.top - pRect.top)
      };
    });

    console.log(`  [Zoom Out ${i}] Zoom: ${check.zoom} | Delta X: ${check.deltaX.toFixed(3)}px | Delta Y: ${check.deltaY.toFixed(3)}px`);
    if (check.deltaX > 1.5 || check.deltaY > 1.5) {
      throw new Error(`Zoom drift on zoom out! DeltaX=${check.deltaX}, DeltaY=${check.deltaY}`);
    }
  }
  console.log('✅ TEST 1 PASSED: Selection overlay stays 100% locked on element across all zoom changes!\n');

  // ----------------------------------------------------
  // TEST 2: AUTO-ORGANIZE ELEMENT DRAGGING
  // ----------------------------------------------------
  console.log('--- TEST 2: AUTO-ORGANIZE DRAGGING ---');
  const cards = await page.$$('.page#page-1 .menu-card');
  console.log(`  Found ${cards.length} cards on Artboard 1`);

  const initialTitles = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.page#page-1 .menu-card .item-title')).map(t => t.textContent.trim());
  });
  console.log('  Initial Card 1:', initialTitles[0]);
  console.log('  Initial Card 2:', initialTitles[1]);
  console.log('  Initial Card 3:', initialTitles[2]);

  // Drag Card 1 down and over Card 3
  const card1Rect = await cards[0].boundingBox();
  const card3Rect = await cards[2].boundingBox();

  console.log('  Dragging Card 1 over Card 3...');
  await page.mouse.move(card1Rect.x + card1Rect.width / 2, card1Rect.y + 20);
  await page.mouse.down();
  await page.waitForTimeout(100);

  // Move in steps to simulate real drag
  await page.mouse.move(card3Rect.x + card3Rect.width / 2, card3Rect.y + card3Rect.height / 2, { steps: 10 });
  await page.waitForTimeout(150);

  // Check drop indicator visible
  const hasIndicator = await page.evaluate(() => {
    return document.querySelectorAll('.drop-before-indicator, .drop-after-indicator').length > 0;
  });
  console.log('  Drop guide indicator visible during drag:', hasIndicator ? '✅ YES' : '❌ NO');

  // Release mouse
  await page.mouse.up();
  await page.waitForTimeout(300);

  const reorderedState = await page.evaluate(() => {
    const titles = Array.from(document.querySelectorAll('.page#page-1 .menu-card .item-title')).map(t => t.textContent.trim());
    const cards = Array.from(document.querySelectorAll('.page#page-1 .menu-card'));
    const anyHasInlineTransform = cards.some(c => c.style.transform && c.style.transform !== '');
    return {
      titles,
      anyHasInlineTransform
    };
  });

  console.log('  Reordered Card List in Grid:');
  reorderedState.titles.forEach((t, i) => console.log(`    ${i + 1}. ${t}`));
  console.log('  All inline transforms reset (clean grid reflow):', !reorderedState.anyHasInlineTransform ? '✅ YES' : '❌ NO');

  if (reorderedState.anyHasInlineTransform) {
    throw new Error('Card retained an offset inline transform instead of auto-organizing cleanly into grid!');
  }

  if (reorderedState.titles[0] === initialTitles[0]) {
    throw new Error('Card was not reordered!');
  }

  console.log('✅ TEST 2 PASSED: Element dragged and auto-organized flawlessly into the grid!\n');

  console.log('====================================================');
  console.log('🎉 ALL BUG FIX VERIFICATION TESTS PASSED (100%)');
  console.log('====================================================');

  await browser.close();
}

runTest().catch(err => {
  console.error('❌ TEST FAILED:', err);
  process.exit(1);
});
