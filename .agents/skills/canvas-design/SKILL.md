---
name: canvas-design
description: Print-engineering and high-fidelity canvas design skill for multi-page A4 print layouts, brand typography, strict color mapping, and local visual verification.
---

# Canvas Design System & Print Engineering Guide

This skill governs the creation of production-grade print layouts, digital menus, poster boards, and multi-page documents rendered via HTML/CSS and verified through Chromium (Playwright/Puppeteer).

---

## 1. Dimensional Standards & Canvas Box Model

### A4 Exact Print Specifications
- **Pixel Resolution**: 794px × 1123px (standard A4 at 96 DPI for web-to-print parity).
- **Aspect Ratio**: 1 : 1.414 (ISO 216 standard).
- **Bleed & Margin Safety**:
  - Safe inner zone: `padding: 32px 36px;`
  - Max content width: `722px`
  - Max content height: `1059px`
- **Page Container CSS**:
  ```css
  .page {
    width: 794px;
    height: 1123px;
    max-width: 794px;
    max-height: 1123px;
    position: relative;
    overflow: hidden;
    page-break-after: always;
    break-after: page;
    box-sizing: border-box;
    background-color: var(--color-bg-primary);
    color: var(--color-text-primary);
  }

  @page {
    size: 794px 1123px;
    margin: 0;
  }

  @media print {
    body {
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .page {
      page-break-inside: avoid;
      page-break-after: always;
    }
  }
  ```

---

## 2. Color Palette & Brand Token Mapping

Strict token definitions must be declared in root CSS:

```css
:root {
  /* Canvas Backgrounds */
  --color-bg-primary: #0A0A0A;        /* Deep Obsidian Black */
  --color-bg-secondary: #141414;      /* Card & Panel Surface */
  --color-bg-card: #1A1A1A;           /* Elevated Item Container */
  --color-bg-card-hover: #222222;

  /* Brand Accents */
  --color-brand-yellow: #FFE600;      /* Electric High-Voltage Yellow */
  --color-brand-yellow-glow: rgba(255, 230, 0, 0.25);
  --color-brand-yellow-dark: #CCA700;

  /* Price & Strikethrough Tokens */
  --color-strike-red: #FF334B;        /* Crimson Red Strike-Through */
  --color-pill-bg: #FFE600;           /* Solid Yellow Price Tag */
  --color-pill-text: #0A0A0A;         /* High Contrast Black on Yellow */
  --color-pill-subtle: rgba(255, 230, 0, 0.12);

  /* Typography Colors */
  --color-text-primary: #FFFFFF;      /* Clean White */
  --color-text-secondary: #CCCCCC;    /* Crisp Off-White */
  --color-text-muted: #888888;        /* Subtle Grey */
  --color-text-dim: #555555;          /* Micro Details / Disclaimers */

  /* Borders & Accents */
  --border-yellow-outline: 2px solid #FFE600;
  --border-subtle: 1px solid rgba(255, 255, 255, 0.1);
  --border-dashed: 1px dashed rgba(255, 230, 0, 0.35);
}
```

---

## 3. Typography & Display Heading Effects

### Heading Tokens & Font Loading
- **Display Heading Font**: `Momo Trust` (with fallbacks to `'Bebas Neue'`, `'Impact'`, `'Montserrat Black'`, sans-serif).
- **Body & Secondary Font**: `'Inter'`, `'Plus Jakarta Sans'`, system-ui, -apple-system, sans-serif.

### Heading Treatments
1. **Yellow Outlined Headings**:
   ```css
   .heading-outlined {
     font-family: 'Momo Trust', 'Bebas Neue', 'Impact', sans-serif;
     text-transform: uppercase;
     letter-spacing: 0.05em;
     color: transparent;
     -webkit-text-stroke: 2px var(--color-brand-yellow);
   }

   .heading-glow {
     font-family: 'Momo Trust', 'Bebas Neue', 'Impact', sans-serif;
     text-transform: uppercase;
     color: var(--color-brand-yellow);
     text-shadow: 0 0 15px var(--color-brand-yellow-glow);
   }

   .heading-duo {
     font-family: 'Momo Trust', 'Bebas Neue', 'Impact', sans-serif;
     text-transform: uppercase;
   }
   .heading-duo span.outline {
     color: transparent;
     -webkit-text-stroke: 1.5px var(--color-brand-yellow);
   }
   .heading-duo span.solid {
     color: var(--color-brand-yellow);
   }
   ```

2. **Price Pill Treatment**:
   ```css
   .price-pill {
     display: inline-flex;
     align-items: center;
     gap: 6px;
     background: var(--color-brand-yellow);
     color: var(--color-pill-text);
     padding: 4px 10px;
     border-radius: 9999px;
     font-family: 'Momo Trust', 'Bebas Neue', sans-serif;
     font-size: 1.15rem;
     font-weight: 800;
     letter-spacing: 0.02em;
     box-shadow: 0 2px 8px rgba(255, 230, 0, 0.3);
   }
   ```

3. **Red Strike-Through Price**:
   ```css
   .price-strikethrough {
     position: relative;
     color: var(--color-text-muted);
     font-size: 0.95rem;
     font-weight: 600;
     text-decoration: none;
   }
   .price-strikethrough::after {
     content: '';
     position: absolute;
     left: -2px;
     right: -2px;
     top: 50%;
     height: 2px;
     background: var(--color-strike-red);
     transform: rotate(-10deg);
   }
   ```

---

## 4. Multi-Page Menu Layout Architecture

Standard restaurant 5-page structure:
1. **Page 1: Rolls** (Signature gourmet & loaded rolls, wraps, naan rolls)
2. **Page 2: Smash Burgers** (Double, Oklahoma, Truffle, Bacon crunch smash patties)
3. **Page 3: Burgers** (Buttermilk crispy chicken, monster beef stacks, plant-based)
4. **Page 4: Boxes** (Loaded meal combos, tender boxes, loaded fries, dips)
5. **Page 5: Deals** (Lunch rush, midnight munchies, squad party packs, student saver)

### Layout Rules
- **Header**: Category banner with outlined headline, page badge, and punchy tagline.
- **Grid Structure**: 2-column or 3-column structured grid per page.
- **Strict Height Control**: Content must never exceed 1123px height. Check with bounding boxes to avoid spillover or page-break overflow.
- **Card Hierarchy**:
  - Item Title (Uppercase, bold)
  - Dietary / Popularity badge (Spicy 🌶️, Chef's Choice ⭐, Bestseller 🔥)
  - Detailed ingredients/description (Muted grey, 2-3 lines max)
  - Price Container: Strike-through old price + Yellow Price Pill
- **Footer**: Brand mark, allergens disclaimer, order URL / QR code placeholder.

---

## 5. Verification & PDF Export Loop

1. **Local Render**: Load HTML via Playwright headless Chromium at viewport `794 × 1123` with device scale factor `2` (crisp high-DPI inspection).
2. **Visual Inspection**:
   - Save screenshots of each individual `.page` element.
   - Scan for container clipping, overlapping text nodes, line wraps in titles, and scrollbar triggers.
3. **Production PDF Compilation**:
   - Render PDF via `page.pdf({ format: 'A4', printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } })`.
   - Verify selectable text and intact vector styling.
