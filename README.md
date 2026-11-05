# 🎨 CRAVE LAB // Illustrator Canvas Studio & Print Pipeline

> A production-grade, print-engineered multi-artboard canvas studio, 8-format universal export engine, automated zero-overflow visual verification loop, and dynamic vector PDF compiler.
>
> **Created & Built by [@psycbeat](https://github.com/psycbeat)**

[![CI Status](https://img.shields.io/badge/CI-Passing-brightgreen.svg)](#-github-actions-ci--testing)
[![Node.js Version](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![Playwright Tested](https://img.shields.io/badge/Verification-Playwright%20Chromium-blue.svg)](https://playwright.dev/)
[![Zero Overflow](https://img.shields.io/badge/Layout-Zero%20Overflow%20Verified-success.svg)](#-print-engineering--verification)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 🌟 Highlights

* **🎨 Illustrator-Style Visual Studio**: Multi-artboard canvas workbench, interactive selection bounding boxes with 4-corner handles, and live Properties Inspector.
* **💾 Universal 8-Format Export Studio (`Ctrl + E`)**: Fast downloads powered by a warm headless Chromium pool (~300 ms):
  * **Vector PDF**: Print-ready, crisp vector layout.
  * **Lossless PNG**: $1\times$ (96 DPI), $2\times$ (Retina 192 DPI), or $3\times$ (300 DPI Commercial Print).
  * **Compact JPEG**: Configurable compression for online menus & delivery apps.
  * **Modern WebP**: High-efficiency next-gen image format.
  * **Scalable SVG**: Standalone vector file with inlined vector assets.
  * **PostScript EPS**: `%!PS-Adobe-3.0 EPSF-3.0` compliant vector format for Adobe Illustrator and print shops.
  * **Single-File HTML**: Standalone webpage with all SVGs bundled as base64 data URIs.
  * **Menu Data JSON**: Structured JSON export and import for POS & CMS syncing.
* **🖨️ Commercial Pre-Press Mode**: 1-click toggle to inject 3mm ($24\text{ px}$) bleed margin and $0.5\text{ pt}$ hairline corner crop marks for commercial print shops.
* **🎭 1-Click Culinary Brand Themes**: Instant full-menu rebranding across 5 print-calibrated palettes:
  * **Botanical Forest** (Default — Modern Green & Crisp White)
  * **Midnight Gold** (Dark Luxury Fine Dining & Steakhouse)
  * **Bistro Crimson** (Smash Burger Joint & American Diner)
  * **Artisanal Terracotta** (Wood-Fired Pizzeria & Rustic Bakery)
  * **Minimal Monochrome** (Nordic Specialty Roaster & Japanese Minimal)
* **📐 Dynamic Artboard Engine (`Shift + O`)**: Real-time artboard editing similar to Adobe Illustrator:
  * 8-point drag-to-resize handles with live dimension pills.
  * Instant standard presets: **A4 Portrait**, **A4 Landscape**, **A5 Portrait**, **A3 Poster**, **US Letter**, **US Letter Landscape**, **Digital TV 16:9**, **Square 1080p**, and **Custom Dimensions**.
  * 1-click **Orientation Swap** (Portrait $\leftrightarrow$ Landscape).
  * Direct artboard management: `+ New Artboard`, `Duplicate`, and `Delete`.
* **📊 Adaptive Grid Columns (`1 Col | 2 Col | 3 Col`)**: Switch layouts on the fly to match artboard sizes (e.g. single-column for A5 flyers or 3-column for wide 16:9 screens).
* **📱 Offline Vector QR Code Generator**: Built-in zero-dependency ISO/IEC 18004 pure-JS QR encoder that outputs crisp, phone-scannable `<svg>` codes live for any website URL.
* **⚡ Zero-Refresh Live Sync**: Built on Server-Sent Events (SSE) and direct filesystem watching (`fs.watch`). Code edits stream live into your open browser canvas in $\approx 120\text{ ms}$ with zero manual refreshing.
* **👻 AI Ghost Cursor & Collaborative Focus**: Visual collaboration system featuring a floating `✨ Antigravity AI` cursor badge and pulsating aura that shows where an AI assistant or peer is editing in real time.
* **📱 Adaptive Split-Screen Responsiveness**: Custom "Stage Sizer" engine that eliminates CSS flexbox negative coordinate clipping, an off-canvas slide-out properties drawer on screens $\le 960\text{px}$, and an auto-converting floating bottom tool dock on screens $\le 768\text{px}$.

---

## 🚀 Quickstart

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [Playwright](https://playwright.dev/)

### Installation

```bash
# Clone the repository
git clone https://github.com/psycbeat/canvas-menu-pipeline.git
cd canvas-menu-pipeline

# Install dependencies
npm install

# Install Playwright browser binaries (if not already installed)
npx playwright install chromium
```

### Launch the Visual Canvas Studio

```bash
npm start
# or
npm run editor
```

Open your browser to **[http://localhost:3001](http://localhost:3001)** (or `http://localhost:3000`).

---

## ⌨️ Studio Keyboard Shortcuts

| Shortcut | Tool / Action | Description |
| :--- | :--- | :--- |
| `Ctrl + E` | **Export Studio** | Open the 8-Format Universal Export Modal with pre-press options |
| `V` | **Selection Tool** | Select cards, titles, descriptions, and price pills |
| `T` | **Type / Text Tool** | Double-click any text for inline `contenteditable` typing |
| `P` | **Price Tool** | Edit price pills, toggles, and strikethroughs |
| `B` | **Badge Stamper** | Stamp dietary chips (`BESTSELLER`, `HIGH HEAT 🌶️`, `CHEF PICK ⭐`, etc.) |
| `+` | **Add Card** | Insert a new menu item card into the active artboard |
| `O` or `Shift + O` | **Artboard Tool** | Enter Illustrator Artboard mode with 8 drag handles & presets |
| `G` | **Print Safe Guides** | Toggle print-safe margin boundary overlay |
| `H` | **Hand Tool** | Click and drag to pan across the canvas |
| `Z` | **Zoom Tool** | Click to zoom in / Ctrl+Wheel to zoom dynamically |
| `I` | **Toggle Inspector** | Open / collapse the Properties Panel or off-canvas drawer |
| `Ctrl + Z` | **Undo** | Step backward in the document history stack |
| `Ctrl + Y` | **Redo** | Step forward in the document history stack |
| `Ctrl + S` | **Save HTML** | Persist DOM changes back to `src/menu.html` |
| `Delete` / `Backspace` | **Delete Card** | Remove the currently selected card |
| `Escape` | **Deselect / Close** | Close modals, inspector drawer, and clear selection |

---

## 📦 Supported Export Formats

| Format | Output Type | Best Used For | Features |
| :--- | :--- | :--- | :--- |
| **PDF** | Vector | Commercial & Desktop Print | Preserves font vectors, selectable text, 3mm bleed + trim crop marks |
| **PNG** | Raster | Social, Portfolios, Print | $1\times$ (96 DPI), $2\times$ (192 DPI), $3\times$ (300 DPI Print), transparent background |
| **JPG** | Raster | Web, Delivery Apps | High-speed compression ($90\%+$ quality) |
| **WebP** | Raster | Modern Fast Websites | Next-gen web optimization ($\approx 40\%$ lighter than PNG) |
| **SVG** | Vector | Web & Graphic Designers | Scalable vector with inlined vector assets & SVG `<foreignObject>` |
| **EPS** | Vector | Commercial Pre-Press | `%!PS-Adobe-3.0 EPSF-3.0` compliant PostScript for Adobe Illustrator |
| **HTML** | Web Document | Self-Hosted Online Menus | $100\%$ self-contained single file with zero external asset dependencies |
| **JSON** | Data | POS & Online Ordering Sync | Structured menu schema (`boards`, `categories`, `items`, `prices`, `badges`) |

---

## 🖨️ Print Engineering & Verification

The project includes an automated headless verification engine built with Playwright:

```bash
# Run visual verification and compile production vector PDF
npm run build:pdf
```

### What the Verification Pipeline Does:
1. Loads [`src/menu.html`](src/menu.html) in headless Chromium with high-DPI ($2\times$ Retina) scale factor.
2. Dynamically extracts `--page-width` and `--page-height` from the document root.
3. Audits every artboard for overflow: checks `scrollHeight <= clientHeight` and `scrollWidth <= clientWidth`.
4. Saves pixel-perfect $2\times$ Retina preview images to `output/page-*.png`.
5. Compiles [`output/crave-lab-menu-a4-production.pdf`](output/crave-lab-menu-a4-production.pdf) with embedded vector typography, precise print margins, and zero clipping.

---

## 🧪 Testing & CI

Run the automated test suites:

```bash
# Run the entire test suite (Responsive + Artboard + 8 Export Formats)
npm test

# Or run individual suites:
npm run test:responsive
npm run test:artboard
npm run test:exports
```

### GitHub Actions CI
The repository includes a ready-to-run GitHub Actions workflow in [`.github/workflows/ci.yml`](.github/workflows/ci.yml) that:
1. Audits print compliance on Ubuntu with zero overflow.
2. Boots the local server and runs all responsive, artboard, and export tests.
3. Automatically uploads the production vector PDF as a downloadable workflow artifact.

---

## 📁 Repository Structure

```
canvas-menu-pipeline/
├── .github/                      # CI/CD Workflows
│   └── workflows/ci.yml          # Automated test & PDF build pipeline
├── assets/                       # Vector assets (brand logo, QR code, stamps)
│   ├── brand-logo.svg
│   ├── flame.svg
│   ├── lightning.svg
│   ├── qr-code.svg
│   └── star.svg
├── editor/                       # Canvas Design Studio frontend
│   ├── index.html                # Studio workbench & Export Studio modal
│   ├── editor.css                # Dark theme, modal styles, responsive rules
│   ├── editor.js                 # Interactive engine, presets, drag-resize, export
│   └── qr-svg.js                 # Zero-dependency ISO/IEC 18004 pure-JS QR generator
├── output/                       # Compiled production PDFs, images, and test artifacts
│   └── crave-lab-menu-a4-production.pdf
├── scripts/                      # Local servers and automated pipelines
│   ├── editor-server.mjs         # Node HTTP + SSE live sync & /api/export server
│   ├── export-engine.mjs         # Warm Chromium pool & 8-format export serializers
│   ├── agent-act.mjs             # CLI tool to dispatch AI ghost cursor moves
│   ├── verify-and-build.mjs      # Playwright zero-overflow QA & PDF builder
│   ├── test-responsive.mjs       # Multi-viewport responsive test suite
│   ├── test-artboard-tool.mjs    # Artboard tool & resize automation tests
│   └── test-exports.mjs          # 8-format export & UI test suite
├── src/                          # Master print template
│   └── menu.html                 # 5-page modular menu with 5 brand themes
├── LICENSE                       # MIT License
├── package.json                  # Package scripts & dependencies (v2.0.0)
└── README.md                     # Project documentation
```

---

## 👤 Author & Credits

**psycbeat**
* GitHub: [@psycbeat](https://github.com/psycbeat)
* Repository: [canvas-menu-pipeline](https://github.com/psycbeat/canvas-menu-pipeline)

---

## 📄 License

This project is open-source under the [MIT License](LICENSE).
