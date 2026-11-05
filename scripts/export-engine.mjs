/**
 * CRAVE LAB // Multi-Format Export & Pre-Press Engine
 * 8 Universal Formats: PDF, PNG, JPG, WebP, SVG, EPS, HTML, JSON
 * Powered by Warm Chromium Pool & Native Vector Serializers
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const ASSETS_DIR = path.join(projectRoot, 'assets');

// Warm Singleton Headless Browser Pool
let warmBrowser = null;
let warmBrowserClosing = false;

export async function getWarmBrowser() {
  if (warmBrowser && warmBrowser.isConnected()) {
    return warmBrowser;
  }
  if (!warmBrowserClosing) {
    warmBrowser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
  }
  return warmBrowser;
}

export async function closeWarmBrowser() {
  if (warmBrowser) {
    warmBrowserClosing = true;
    try {
      await warmBrowser.close();
    } catch (_) {}
    warmBrowser = null;
    warmBrowserClosing = false;
  }
}

process.on('exit', () => {
  if (warmBrowser) {
    try { warmBrowser.close(); } catch (_) {}
  }
});

// Helper: Convert all ../assets/*.svg to inline base64 data URIs
export function inlineAssetSvgs(html) {
  return html.replace(/src=["'](\.\.\/assets\/([^"']+))["']/g, (match, relPath, filename) => {
    const fullPath = path.join(ASSETS_DIR, filename);
    if (fs.existsSync(fullPath)) {
      const svgContent = fs.readFileSync(fullPath, 'utf8');
      const b64 = Buffer.from(svgContent).toString('base64');
      return `src="data:image/svg+xml;base64,${b64}"`;
    }
    return match;
  });
}

// Helper: Parse dimensions from HTML CSS variables
export function extractDimensions(html) {
  const wMatch = html.match(/--page-width:\s*(\d+)px/);
  const hMatch = html.match(/--page-height:\s*(\d+)px/);
  return {
    width: wMatch ? parseInt(wMatch[1], 10) : 794,
    height: hMatch ? parseInt(hMatch[1], 10) : 1123
  };
}

// Helper: Extract structured JSON data from menu HTML
export function extractStructuredJson(html) {
  const dims = extractDimensions(html);
  const themeMatch = html.match(/data-theme=["']([^"']+)["']/);
  const theme = themeMatch ? themeMatch[1] : 'botanical-forest';

  const boards = [];
  const pageRegex = /<section[^>]*class=["'][^"']*page[^"']*["'][^>]*id=["']([^"']+)["'][^>]*>([\s\S]*?)<\/section>/gi;
  let pageMatch;
  let pageIndex = 1;

  while ((pageMatch = pageRegex.exec(html)) !== null) {
    const pageId = pageMatch[1];
    const pageContent = pageMatch[2];

    const catTitleMatch = pageContent.match(/<h1[^>]*class=["'][^"']*outlined-title[^"']*["'][^>]*>([\s\S]*?)<\/h1>/i);
    let catTitle = `Page 0${pageIndex}`;
    if (catTitleMatch) {
      catTitle = catTitleMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    }

    const catSubMatch = pageContent.match(/<p[^>]*class=["'][^"']*category-subtitle[^"']*["'][^>]*>([\s\S]*?)<\/p>/i);
    const catSubtitle = catSubMatch ? catSubMatch[1].replace(/<[^>]+>/g, '').replace(/&bull;/g, '•').trim() : '';

    const badgeMatch = pageContent.match(/<div[^>]*class=["'][^"']*category-badge-chip[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
    const categoryBadge = badgeMatch ? badgeMatch[1].trim() : '';

    const colsMatch = pageContent.match(/class=["'][^"']*items-grid[^"']*cols-(\d+)[^"']*["']/i);
    const columns = colsMatch ? parseInt(colsMatch[1], 10) : 2;

    const items = [];
    const itemRegex = /<article[^>]*class=["'][^"']*menu-card([^"']*)["'][^>]*>([\s\S]*?)<\/article>/gi;
    let itemMatch;

    while ((itemMatch = itemRegex.exec(pageContent)) !== null) {
      const cardClasses = itemMatch[1] || '';
      const cardContent = itemMatch[2];
      const isHero = cardClasses.includes('hero-item');

      const titleMatch = cardContent.match(/<h3[^>]*class=["'][^"']*item-title[^"']*["'][^>]*>([\s\S]*?)<\/h3>/i);
      const title = titleMatch ? titleMatch[1].trim() : 'Menu Item';

      const descMatch = cardContent.match(/<p[^>]*class=["'][^"']*item-desc[^"']*["'][^>]*>([\s\S]*?)<\/p>/i);
      const desc = descMatch ? descMatch[1].trim() : '';

      const priceMatch = cardContent.match(/<div[^>]*class=["'][^"']*price-pill[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
      const price = priceMatch ? priceMatch[1].trim() : '';

      const oldPriceMatch = cardContent.match(/<span[^>]*class=["'][^"']*old-price[^"']*["'][^>]*>([\s\S]*?)<\/span>/i);
      const oldPrice = oldPriceMatch ? oldPriceMatch[1].trim() : '';

      const itemBadgeMatch = cardContent.match(/<(?:div|span)[^>]*class=["'][^"']*(?:hero-badge|tag-chip)[^"']*["'][^>]*>([\s\S]*?)<\/(?:div|span)>/i);
      const badge = itemBadgeMatch ? itemBadgeMatch[1].replace(/<[^>]+>/g, '').trim() : '';

      items.push({
        title,
        desc,
        price,
        oldPrice,
        isHero,
        badge
      });
    }

    boards.push({
      id: pageId,
      index: pageIndex,
      categoryTitle: catTitle,
      categorySubtitle: catSubtitle,
      categoryBadge,
      columns,
      itemCount: items.length,
      items
    });

    pageIndex++;
  }

  return {
    generator: 'CRAVE LAB // Illustrator Canvas Studio',
    version: '2.0.0',
    exportedAt: new Date().toISOString(),
    theme,
    dimensions: dims,
    artboardCount: boards.length,
    boards
  };
}

// Helper: Generate PostScript EPSF-3.0 Vector document
export function generateEpsDocument(html, boardId = 'page-1', cropMarks = false) {
  const json = extractStructuredJson(html);
  const board = json.boards.find(b => b.id === boardId) || json.boards[0] || {
    id: 'page-1',
    categoryTitle: 'MENU',
    categorySubtitle: 'FRESH SPECIALS',
    items: []
  };

  const W = json.dimensions.width;
  const H = json.dimensions.height;
  const bleed = cropMarks ? 24 : 0;
  const totalW = W + bleed * 2;
  const totalH = H + bleed * 2;

  // EPS Theme RGB colors
  const isDark = json.theme === 'midnight-gold';
  const bgR = isDark ? 0.07 : 0.98;
  const bgG = isDark ? 0.07 : 0.99;
  const bgB = isDark ? 0.08 : 0.98;

  const cardR = isDark ? 0.10 : 1.0;
  const cardG = isDark ? 0.10 : 1.0;
  const cardB = isDark ? 0.12 : 1.0;

  const textR = isDark ? 0.98 : 0.08;
  const textG = isDark ? 0.98 : 0.08;
  const textB = isDark ? 0.98 : 0.08;

  let accentR = 0.08, accentG = 0.50, accentB = 0.24; // Forest
  if (json.theme === 'midnight-gold') { accentR = 0.92; accentG = 0.70; accentB = 0.03; }
  else if (json.theme === 'bistro-crimson') { accentR = 0.86; accentG = 0.15; accentB = 0.15; }
  else if (json.theme === 'artisanal-terracotta') { accentR = 0.76; accentG = 0.25; accentB = 0.05; }
  else if (json.theme === 'minimal-monochrome') { accentR = 0.10; accentG = 0.10; accentB = 0.11; }

  let eps = `%!PS-Adobe-3.0 EPSF-3.0
%%Creator: CRAVE LAB Illustrator Canvas Studio V2.0
%%Title: CRAVE LAB Menu - ${board.categoryTitle}
%%BoundingBox: 0 0 ${totalW} ${totalH}
%%HiResBoundingBox: 0.0 0.0 ${totalW}.0 ${totalH}.0
%%Pages: 1
%%LanguageLevel: 2
%%EndComments

/rect {
  /h exch def
  /w exch def
  /y exch def
  /x exch def
  newpath
  x y moveto
  w 0 rlineto
  0 h rlineto
  w neg 0 rlineto
  closepath
} bind def

/fillrect { rect fill } bind def
/strokerect { rect stroke } bind def

gsave
${bleed} ${bleed} translate

% Background page
${bgR} ${bgG} ${bgB} setrgbcolor
0 0 ${W} ${H} fillrect

% Page border
0.88 0.90 0.88 setrgbcolor
1 setlinewidth
0 0 ${W} ${H} strokerect

% Header Accent Bar
${accentR} ${accentG} ${accentB} setrgbcolor
36 ${H - 64} 160 4 fillrect

% Title
/Helvetica-Bold findfont 28 scalefont setfont
${textR} ${textG} ${textB} setrgbcolor
36 ${H - 110} moveto
(${board.categoryTitle.replace(/[()]/g, '')}) show

% Subtitle
/Helvetica findfont 10 scalefont setfont
0.45 0.45 0.45 setrgbcolor
36 ${H - 130} moveto
(${board.categorySubtitle.replace(/[()]/g, '')}) show

% Grid Cards
`;

  // Draw items
  const cols = board.columns || 2;
  const colW = (W - 72 - (cols - 1) * 16) / cols;
  const rowH = 135;
  const startY = H - 160;

  board.items.slice(0, 6).forEach((item, idx) => {
    const colIdx = idx % cols;
    const rowIdx = Math.floor(idx / cols);
    const cardX = 36 + colIdx * (colW + 16);
    const cardY = startY - (rowIdx + 1) * (rowH + 14);

    eps += `
% Item Card ${idx + 1}
${cardR} ${cardG} ${cardB} setrgbcolor
${cardX} ${cardY} ${colW} ${rowH} fillrect
0.88 0.91 0.88 setrgbcolor
1 setlinewidth
${cardX} ${cardY} ${colW} ${rowH} strokerect

% Item Title
/Helvetica-Bold findfont 13 scalefont setfont
${textR} ${textG} ${textB} setrgbcolor
${cardX + 12} ${cardY + rowH - 24} moveto
(${item.title.slice(0, 26).replace(/[()]/g, '')}) show

% Item Desc
/Helvetica findfont 8 scalefont setfont
0.4 0.4 0.4 setrgbcolor
${cardX + 12} ${cardY + rowH - 42} moveto
(${item.desc.slice(0, 48).replace(/[()]/g, '')}) show

% Price Pill
${accentR} ${accentG} ${accentB} setrgbcolor
${cardX + colW - 68} ${cardY + 12} 56 22 fillrect
/Helvetica-Bold findfont 10 scalefont setfont
1.0 1.0 1.0 setrgbcolor
${cardX + colW - 56} ${cardY + 18} moveto
(${item.price.replace(/[()]/g, '')}) show
`;

    if (item.oldPrice) {
      eps += `
% Old Price Strike
/Helvetica findfont 9 scalefont setfont
0.6 0.6 0.6 setrgbcolor
${cardX + 12} ${cardY + 18} moveto
(${item.oldPrice.replace(/[()]/g, '')}) show
0.85 0.20 0.20 setrgbcolor
1.2 setlinewidth
newpath
${cardX + 10} ${cardY + 22} moveto
${cardX + 42} ${cardY + 22} lineto
stroke
`;
    }
  });

  if (cropMarks) {
    eps += `
% Commercial Pre-Press Crop Marks (3mm Bleed)
0.0 0.0 0.0 setrgbcolor
0.5 setlinewidth
% Bottom-Left
newpath -18 0 moveto -4 0 lineto stroke
newpath 0 -18 moveto 0 -4 lineto stroke
% Bottom-Right
newpath ${W + 4} 0 moveto ${W + 18} 0 lineto stroke
newpath ${W} -18 moveto ${W} -4 lineto stroke
% Top-Left
newpath -18 ${H} moveto -4 ${H} lineto stroke
newpath 0 ${H + 4} moveto 0 ${H + 18} lineto stroke
% Top-Right
newpath ${W + 4} ${H} moveto ${W + 18} ${H} lineto stroke
newpath ${W} ${H + 4} moveto ${W} ${H + 18} lineto stroke
`;
  }

  eps += `
grestore
showpage
%%EOF
`;

  return eps;
}

// Master Export Function
export async function exportDocument(options = {}) {
  const {
    html = '',
    format = 'pdf',
    scope = 'current',
    boardId = 'page-1',
    scale = 2,
    quality = 92,
    cropMarks = false,
    transparent = false
  } = options;

  if (!html || typeof html !== 'string') {
    throw new Error('Missing HTML content for export');
  }

  const inlinedHtml = inlineAssetSvgs(html);
  const dims = extractDimensions(inlinedHtml);
  const W = dims.width;
  const H = dims.height;

  // 1. JSON Export
  if (format === 'json') {
    const data = extractStructuredJson(inlinedHtml);
    return {
      buffer: Buffer.from(JSON.stringify(data, null, 2), 'utf8'),
      contentType: 'application/json; charset=utf-8',
      filename: `crave-lab-menu-${boardId}.json`
    };
  }

  // 2. EPS Export
  if (format === 'eps') {
    const epsText = generateEpsDocument(inlinedHtml, boardId, cropMarks);
    return {
      buffer: Buffer.from(epsText, 'utf8'),
      contentType: 'application/postscript',
      filename: `crave-lab-menu-${boardId}${cropMarks ? '-press' : ''}.eps`
    };
  }

  // 3. Standalone SVG Export
  if (format === 'svg') {
    const bleed = cropMarks ? 24 : 0;
    const totalW = W + bleed * 2;
    const totalH = H + bleed * 2;

    const isolatedCss = `
      body { margin: 0; padding: ${bleed}px; background: ${transparent ? 'transparent' : 'transparent'}; }
      ${scope === 'current' ? `.page:not(#${boardId}) { display: none !important; }` : ''}
      .page { box-shadow: none !important; margin: 0 auto; }
    `;

    const cropMarksSvg = cropMarks ? `
      <g stroke="#000000" stroke-width="0.75" shape-rendering="crispEdges">
        <line x1="4" y1="${bleed}" x2="${bleed - 4}" y2="${bleed}"/>
        <line x1="${bleed}" y1="4" x2="${bleed}" y2="${bleed - 4}"/>
        <line x1="${totalW - bleed + 4}" y1="${bleed}" x2="${totalW - 4}" y2="${bleed}"/>
        <line x1="${totalW - bleed}" y1="4" x2="${totalW - bleed}" y2="${bleed - 4}"/>
        <line x1="4" y1="${totalH - bleed}" x2="${bleed - 4}" y2="${totalH - bleed}"/>
        <line x1="${bleed}" y1="${totalH - bleed + 4}" x2="${bleed}" y2="${totalH - 4}"/>
        <line x1="${totalW - bleed + 4}" y1="${totalH - bleed}" x2="${totalW - 4}" y2="${totalH - bleed}"/>
        <line x1="${totalW - bleed}" y1="${totalH - bleed + 4}" x2="${totalW - bleed}" y2="${totalH - 4}"/>
      </g>
    ` : '';

    const svgWrap = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${totalW}" height="${totalH}" viewBox="0 0 ${totalW} ${totalH}">
  <style>
    ${isolatedCss}
  </style>
  ${cropMarksSvg}
  <foreignObject x="${bleed}" y="${bleed}" width="${W}" height="${H}">
    <div xmlns="http://www.w3.org/1999/xhtml">
      ${inlinedHtml}
    </div>
  </foreignObject>
</svg>`;

    return {
      buffer: Buffer.from(svgWrap, 'utf8'),
      contentType: 'image/svg+xml',
      filename: `crave-lab-menu-${boardId}.svg`
    };
  }

  // 4. Standalone HTML Export
  if (format === 'html') {
    let exportHtml = inlinedHtml;
    if (scope === 'current') {
      exportHtml = exportHtml.replace('</head>', `
  <style>
    .page:not(#${boardId}) { display: none !important; }
    body { padding: 0; background: transparent; }
  </style>
</head>`);
    }
    return {
      buffer: Buffer.from(exportHtml, 'utf8'),
      contentType: 'text/html; charset=utf-8',
      filename: `crave-lab-menu-${scope === 'current' ? boardId : 'all'}.html`
    };
  }

  // Headless Chromium formats: PDF, PNG, JPG, WebP
  const browser = await getWarmBrowser();
  const context = await browser.newContext({
    deviceScaleFactor: parseInt(scale, 10) || 2,
    viewport: { width: Math.max(W + 100, 1200), height: Math.max(H + 100, 1400) }
  });
  const page = await context.newPage();

  try {
    // Inject custom print styles or bleed crop marks
    let docHtml = inlinedHtml;
    const bleed = cropMarks ? 24 : 0;
    const totalW = W + bleed * 2;
    const totalH = H + bleed * 2;

    const extraStyles = `
      <style>
        ${transparent ? 'body, .page { background: transparent !important; }' : ''}
        ${scope === 'current' ? `.page:not(#${boardId}) { display: none !important; }` : ''}
        body { margin: 0; padding: ${bleed}px 0; background: ${transparent ? 'transparent' : '#EFEFEA'}; display: flex; flex-direction: column; align-items: center; }
        .page { box-shadow: none !important; margin: 0; }
        ${cropMarks ? `
          .page { position: relative; }
          .crop-mark-overlay {
            position: absolute;
            top: -${bleed}px;
            left: -${bleed}px;
            width: ${totalW}px;
            height: ${totalH}px;
            pointer-events: none;
            z-index: 9999;
          }
        ` : ''}
      </style>
    `;

    docHtml = docHtml.replace('</head>', `${extraStyles}</head>`);
    await page.setContent(docHtml, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);

    // 5. PDF Export
    if (format === 'pdf') {
      let pdfWidth = W;
      let pdfHeight = H;

      if (cropMarks) {
        pdfWidth = totalW;
        pdfHeight = totalH;
        await page.evaluate(({ bleed, totalW, totalH, W, H }) => {
          const overlay = document.createElement('div');
          overlay.className = 'crop-mark-overlay';
          overlay.innerHTML = `
            <svg width="${totalW}" height="${totalH}" style="position: absolute; top: 0; left: 0;">
              <g stroke="#000000" stroke-width="0.75" shape-rendering="crispEdges">
                <line x1="4" y1="${bleed}" x2="${bleed - 4}" y2="${bleed}"/>
                <line x1="${bleed}" y1="4" x2="${bleed}" y2="${bleed - 4}"/>
                <line x1="${totalW - bleed + 4}" y1="${bleed}" x2="${totalW - 4}" y2="${bleed}"/>
                <line x1="${totalW - bleed}" y1="4" x2="${totalW - bleed}" y2="${bleed - 4}"/>
                <line x1="4" y1="${totalH - bleed}" x2="${bleed - 4}" y2="${totalH - bleed}"/>
                <line x1="${bleed}" y1="${totalH - bleed + 4}" x2="${bleed}" y2="${totalH - 4}"/>
                <line x1="${totalW - bleed + 4}" y1="${totalH - bleed}" x2="${totalW - 4}" y2="${totalH - bleed}"/>
                <line x1="${totalW - bleed}" y1="${totalH - bleed + 4}" x2="${totalW - bleed}" y2="${totalH - 4}"/>
              </g>
            </svg>
          `;
          const targetBoard = document.querySelector('.page');
          if (targetBoard) targetBoard.appendChild(overlay);
        }, { bleed, totalW, totalH, W, H });
      }

      const pdfBuffer = await page.pdf({
        width: `${pdfWidth}px`,
        height: `${pdfHeight}px`,
        printBackground: true,
        margin: { top: 0, right: 0, bottom: 0, left: 0 }
      });

      return {
        buffer: pdfBuffer,
        contentType: 'application/pdf',
        filename: `crave-lab-menu-${scope === 'current' ? boardId : 'all'}${cropMarks ? '-press' : ''}.pdf`
      };
    }

    // Raster Formats: Locate artboard
    const targetSelector = scope === 'current' ? `#${boardId}` : '.page';
    const targetElement = page.locator(targetSelector).first();

    // 6. PNG Export
    if (format === 'png') {
      const pngBuffer = await targetElement.screenshot({
        type: 'png',
        omitBackground: transparent
      });
      return {
        buffer: pngBuffer,
        contentType: 'image/png',
        filename: `crave-lab-menu-${boardId}-${scale}x.png`
      };
    }

    // 7. JPG Export
    if (format === 'jpg' || format === 'jpeg') {
      const jpgBuffer = await targetElement.screenshot({
        type: 'jpeg',
        quality: Math.min(100, Math.max(10, parseInt(quality, 10) || 92))
      });
      return {
        buffer: jpgBuffer,
        contentType: 'image/jpeg',
        filename: `crave-lab-menu-${boardId}.jpg`
      };
    }

    // 8. WebP Export (via In-Page Canvas encoding from PNG buffer)
    if (format === 'webp') {
      const pngBuffer = await targetElement.screenshot({
        type: 'png',
        omitBackground: transparent
      });

      const webpB64 = await page.evaluate(async ({ pngBase64, qualityVal }) => {
        const img = new Image();
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = 'data:image/png;base64,' + pngBase64;
        });
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL('image/webp', qualityVal / 100);
        return dataUrl.split(',')[1];
      }, { pngBase64: pngBuffer.toString('base64'), qualityVal: parseInt(quality, 10) || 92 });

      return {
        buffer: Buffer.from(webpB64, 'base64'),
        contentType: 'image/webp',
        filename: `crave-lab-menu-${boardId}.webp`
      };
    }

    throw new Error(`Unsupported export format: ${format}`);
  } finally {
    await context.close();
  }
}
