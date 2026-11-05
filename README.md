# 🎨 CRAVE LAB // Illustrator Canvas Studio & Print Pipeline

> A production-grade, print-engineered multi-artboard canvas studio, automated zero-overflow visual verification engine, and dynamic vector PDF compiler.

[![Node.js Version](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![Playwright Tested](https://img.shields.io/badge/Verification-Playwright%20Chromium-blue.svg)](https://playwright.dev/)
[![Zero Overflow](https://img.shields.io/badge/Layout-Zero%20Overflow%20Verified-success.svg)](#print-engineering--verification)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 🌟 Highlights

* **🎨 Illustrator-Style Visual Studio**: Multi-artboard canvas workbench, interactive selection bounding boxes with 4-corner handles, and live Properties Inspector.
* **📐 Dynamic Artboard Engine (`Shift + O`)**: Real-time artboard editing similar to Adobe Illustrator:
  * 8-point drag-to-resize handles with live dimension pills.
  * Instant standard presets: **A4 Portrait**, **A4 Landscape**, **A5 Portrait**, **A3 Poster**, **US Letter**, **US Letter Landscape**, **Digital TV 16:9**, **Square 1080p**, and **Custom Dimensions**.
  * 1-click **Orientation Swap** (Portrait $\leftrightarrow$ Landscape).
  * Direct artboard management: `+ New Artboard`, `Duplicate`, and `Delete`.
* **⚡ Zero-Refresh Live Sync**: Built on Server-Sent Events (SSE) and direct filesystem watching (`fs.watch`). Code edits stream live into your open browser canvas in $\approx 120\text{ ms}$ with zero manual refreshing.
* **👻 AI Ghost Cursor & Collaborative Focus**: Visual collaboration system featuring a floating `✨ Antigravity AI` cursor badge and pulsating aura that shows where an AI assistant or peer is editing in real time.
* **📱 Adaptive Split-Screen Responsiveness**: Custom "Stage Sizer" engine that eliminates CSS flexbox negative coordinate clipping, an off-canvas slide-out properties drawer on screens $\le 960\text{px}$, and an auto-converting floating bottom tool dock on screens $\le 768\text{px}$.
* **🖨️ Headless Print Verification & Vector PDF Compiler**: Automated Playwright pipeline that audits every page for 0px vertical/horizontal overflow, captures $2\times$ retina screenshots, and compiles vector-preserving production PDFs.

---

## 🚀 Quickstart

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [Playwright](https://playwright.dev/)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/canvas-menu-pipeline.git
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
| `V` | **Selection Tool** | Select cards, titles, descriptions, and price pills |
| `T` | **Type / Text Tool** | Double-click any text for inline `contenteditable` typing |
| `P` | **Price Tool** | Edit price pills, toggles, and strikethroughs |
| `B` | **Badge Stamper** | Stamp dietary chips (`BESTSELLER`, `HIGH HEAT 🌶️`, `CHEF PICK ⭐`, etc.) |
| `+` | **Add Card** | Insert a new menu item card into the active artboard |
| `O` or `Shift + O` | **Artboard Tool** | Enter Illustrator Artboard mode with 8 drag handles & presets |
| `G` | **Print Safe Guides** | Toggle 32px / 36px print-safe margin boundary overlay |
| `H` | **Hand Tool** | Click and drag to pan across the canvas |
| `Z` | **Zoom Tool** | Click to zoom in / Ctrl+Wheel to zoom dynamically |
| `I` | **Toggle Inspector** | Open / collapse the Properties Panel or off-canvas drawer |
| `Ctrl + Z` | **Undo** | Step backward in the document history stack |
| `Ctrl + Y` | **Redo** | Step forward in the document history stack |
| `Ctrl + S` | **Save HTML** | Persist DOM changes back to `src/menu.html` |
| `Delete` / `Backspace` | **Delete Card** | Remove the currently selected card |
| `Escape` | **Deselect / Close** | Deselect active item and close off-canvas drawer |

---

## 📐 Supported Artboard Presets

| Preset | Dimensions (px @ 96 DPI) | Physical Dimensions | Best For |
| :--- | :--- | :--- | :--- |
| **A4 Portrait** | $794 \times 1123\text{ px}$ | $210 \times 297\text{ mm}$ | Standard vertical dining menu |
| **A4 Landscape** | $1123 \times 794\text{ px}$ | $297 \times 210\text{ mm}$ | Horizontal tri-fold brochure |
| **A5 Portrait** | $559 \times 794\text{ px}$ | $148 \times 210\text{ mm}$ | Compact table tent card / drinks flyer |
| **A3 Poster** | $1123 \times 1587\text{ px}$ | $297 \times 420\text{ mm}$ | Wall poster / window display |
| **US Letter** | $816 \times 1056\text{ px}$ | $8.5 \times 11.0\text{ in}$ | North American standard print |
| **US Letter Landscape** | $1056 \times 816\text{ px}$ | $11.0 \times 8.5\text{ in}$ | North American horizontal menu |
| **Digital TV 16:9** | $1920 \times 1080\text{ px}$ | 1080p Full HD | Digital drive-thru & counter TV screens |
| **Square Display** | $1080 \times 1080\text{ px}$ | 1:1 Aspect | Social media & QR landing pages |
| **Custom Dimensions** | User-defined $W \times H$ | Any size | Specialty packaging & custom print runs |

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

## 🧪 Testing

Run the automated multi-viewport responsive test suite:

```bash
npm run test:responsive
```

Verifies flawless zero-overflow rendering across 5 distinct viewports:
- Mobile Portrait ($390 \times 844\text{ px}$)
- Narrow Split-Screen ($550 \times 850\text{ px}$)
- Tablet Portrait ($768 \times 1024\text{ px}$)
- Compact Laptop ($1024 \times 768\text{ px}$)
- Widescreen Desktop ($1440 \times 900\text{ px}$)

Run the Artboard Tool interactive test suite:

```bash
npm run test:artboard
```

---

## 📁 Repository Structure

```
canvas-menu-pipeline/
├── assets/                       # Vector assets (brand logo, QR code, stamps)
│   ├── brand-logo.svg
│   ├── flame.svg
│   ├── lightning.svg
│   ├── qr-code.svg
│   └── star.svg
├── editor/                       # Canvas Design Studio frontend
│   ├── index.html                # Studio markup & workbench
│   ├── editor.css                # Dark theme, handles, and responsive styles
│   └── editor.js                 # Interactive engine, presets, drag-resize
├── output/                       # Compiled production PDFs and visual audits
│   └── crave-lab-menu-a4-production.pdf
├── scripts/                      # Local servers and automated pipelines
│   ├── editor-server.mjs         # Zero-dependency SSE server & live reload
│   ├── agent-act.mjs             # CLI tool to dispatch AI ghost cursor moves
│   ├── verify-and-build.mjs      # Playwright zero-overflow QA & PDF builder
│   ├── test-responsive.mjs       # Multi-viewport responsive test suite
│   └── test-artboard-tool.mjs    # Artboard tool & resize automation tests
├── src/                          # Master print template
│   └── menu.html                 # 5-page modular botanical minimal menu
├── LICENSE                       # MIT License
├── package.json                  # Package scripts & dependencies
└── README.md                     # Project documentation
```

---

## 🛠️ Customization Guide

### Changing Brand Colors
Open [`src/menu.html`](src/menu.html) and modify the CSS color tokens in `:root`:
```css
:root {
  --color-accent-primary: #15803D; /* Botanical Forest Green */
  --color-accent-dark:    #14532D;
  --color-accent-warm:    #16A34A;
  --color-strike-red:     #D94638;
}
```

### Adding New Font Pairings
The studio uses Google Fonts loaded in the `<head>`:
- Display: `Plus Jakarta Sans`
- Accents & Category Headings: `Playfair Display`
- Body & Ingredients: `Inter`

To change font tokens, update `--font-display`, `--font-serif`, or `--font-body` in [`src/menu.html`](src/menu.html).

---

## 📄 License

This project is open-source under the [MIT License](LICENSE).
