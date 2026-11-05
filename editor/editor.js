/**
 * CRAVE LAB — Illustrator Canvas Studio
 * Client-Side Interactive Engine & Direct DOM Manipulation
 */

(function () {
  // Application State
  const state = {
    currentTool: 'select', // 'select', 'text', 'price', 'badge', 'hand', 'zoom'
    currentBoard: 'page-1', // 'page-1', 'page-2', ... or 'all'
    zoom: 0.85,
    panX: 0,
    panY: 0,
    isPanning: false,
    panStartX: 0,
    panStartY: 0,
    selectedElement: null,
    selectedCard: null,
    history: [],
    historyIndex: -1,
    maxHistory: 50,
    rawTemplateHtml: '',
    showGuides: false,
    artboardWidth: 794,
    artboardHeight: 1123,
    artboardPreset: 'a4-portrait',
    isResizingArtboard: false,
    artboardResizeHandle: null,
    artboardResizeStart: { mouseX: 0, mouseY: 0, w: 794, h: 1123 },
    theme: 'botanical-forest',
    exportFormat: 'pdf',
    exportScope: 'current',
    exportScale: 2,
    exportQuality: 92,
    exportCropMarks: false,
    exportTransparent: false,
    footerQrUrl: 'https://cravelab.menu'
  };

  const ARTBOARD_PRESETS = {
    'a4-portrait': { name: 'A4 Portrait', width: 794, height: 1123 },
    'a4-landscape': { name: 'A4 Landscape', width: 1123, height: 794 },
    'a5-portrait': { name: 'A5 Portrait', width: 559, height: 794 },
    'a3-portrait': { name: 'A3 Poster', width: 1123, height: 1587 },
    'us-letter': { name: 'US Letter', width: 816, height: 1056 },
    'us-letter-landscape': { name: 'US Letter Landscape', width: 1056, height: 816 },
    'digital-tv': { name: 'Digital TV 16:9', width: 1920, height: 1080 },
    'square-post': { name: 'Square Menu', width: 1080, height: 1080 }
  };

  // DOM References
  const dom = {
    viewport: document.getElementById('canvasViewport'),
    stageSizer: document.getElementById('stageSizer'),
    stage: document.getElementById('canvasStage'),
    artboardsContainer: document.getElementById('artboardsContainer'),
    transformOverlay: document.getElementById('transformOverlay'),
    transformLabel: document.getElementById('transformLabel'),
    printGuides: document.getElementById('printGuides'),
    aiGhostCursor: document.getElementById('aiGhostCursor'),
    aiActionText: document.getElementById('aiActionText'),
    liveSyncBadge: document.getElementById('liveSyncBadge'),
    statusPill: document.getElementById('statusPill'),
    zoomValue: document.getElementById('zoomValue'),
    btnZoomIn: document.getElementById('btnZoomIn'),
    btnZoomOut: document.getElementById('btnZoomOut'),
    btnZoomFit: document.getElementById('btnZoomFit'),
    btnUndo: document.getElementById('btnUndo'),
    btnRedo: document.getElementById('btnRedo'),
    btnSaveHtml: document.getElementById('btnSaveHtml'),
    btnCompilePdf: document.getElementById('btnCompilePdf'),
    btnQuickAudit: document.getElementById('btnQuickAudit'),
    artboardTabs: document.getElementById('artboardTabs'),
    toolPalette: document.getElementById('toolPalette'),
    toggleGuidesBtn: document.getElementById('toggleGuidesBtn'),
    toastContainer: document.getElementById('toastContainer'),
    selectionTypeBadge: document.getElementById('selectionTypeBadge'),
    inspectorPanel: document.getElementById('inspectorPanel'),
    btnToggleInspector: document.getElementById('btnToggleInspector'),
    btnCloseInspector: document.getElementById('btnCloseInspector'),
    drawerBackdrop: document.getElementById('drawerBackdrop'),
    docBadge: document.getElementById('docBadge'),
    toolArtboard: document.getElementById('toolArtboard'),
    artboardOverlay: document.getElementById('artboardOverlay'),
    artboardSizeBadge: document.getElementById('artboardSizeBadge'),
    secArtboardOptions: document.getElementById('secArtboardOptions'),
    selArtboardPreset: document.getElementById('selArtboardPreset'),
    inpArtboardW: document.getElementById('inpArtboardW'),
    inpArtboardH: document.getElementById('inpArtboardH'),
    btnSwapOrientation: document.getElementById('btnSwapOrientation'),
    btnNewArtboard: document.getElementById('btnNewArtboard'),
    btnDuplicateArtboard: document.getElementById('btnDuplicateArtboard'),
    btnDeleteArtboard: document.getElementById('btnDeleteArtboard'),
    activeBoardTag: document.getElementById('activeBoardTag'),
    
    // Inspector Inputs
    inpItemTitle: document.getElementById('inpItemTitle'),
    inpItemDesc: document.getElementById('inpItemDesc'),
    selItemBadge: document.getElementById('selItemBadge'),
    chkHeroCard: document.getElementById('chkHeroCard'),
    inpPrice: document.getElementById('inpPrice'),
    inpOldPrice: document.getElementById('inpOldPrice'),
    chkStrikeThrough: document.getElementById('chkStrikeThrough'),
    inpPillBg: document.getElementById('inpPillBg'),
    pillBgHex: document.getElementById('pillBgHex'),
    selFontFamily: document.getElementById('selFontFamily'),
    rngFontSize: document.getElementById('rngFontSize'),
    fontSizeVal: document.getElementById('fontSizeVal'),
    rngStrokeWidth: document.getElementById('rngStrokeWidth'),
    strokeVal: document.getElementById('strokeVal'),
    inpStrokeColor: document.getElementById('inpStrokeColor'),
    strokeColorHex: document.getElementById('strokeColorHex'),
    inpTextColor: document.getElementById('inpTextColor'),
    textColorHex: document.getElementById('textColorHex'),
    btnMoveUp: document.getElementById('btnMoveUp'),
    btnMoveDown: document.getElementById('btnMoveDown'),
    btnDuplicateCard: document.getElementById('btnDuplicateCard'),
    btnDeleteCard: document.getElementById('btnDeleteCard'),
    auditBadge: document.getElementById('auditBadge'),
    pdfLink: document.getElementById('pdfLink'),

    // Export Studio Modal References
    btnOpenExportModal: document.getElementById('btnOpenExportModal'),
    exportModalBackdrop: document.getElementById('exportModalBackdrop'),
    exportModal: document.getElementById('exportModal'),
    btnCloseExportModal: document.getElementById('btnCloseExportModal'),
    btnCancelExport: document.getElementById('btnCancelExport'),
    btnExecuteExport: document.getElementById('btnExecuteExport'),
    btnExecuteExportText: document.getElementById('btnExecuteExportText'),
    exportSpinner: document.getElementById('exportSpinner'),
    formatCards: document.getElementById('formatCards'),
    segExportScope: document.getElementById('segExportScope'),
    segExportScale: document.getElementById('segExportScale'),
    optDpiScale: document.getElementById('optDpiScale'),
    chkCropMarks: document.getElementById('chkCropMarks'),
    chkCropMarksRow: document.getElementById('chkCropMarksRow'),
    chkTransparent: document.getElementById('chkTransparent'),
    chkTransparentRow: document.getElementById('chkTransparentRow'),
    exportActiveBoardNum: document.getElementById('exportActiveBoardNum'),
    inpImportJson: document.getElementById('inpImportJson'),
    btnTriggerImportJson: document.getElementById('btnTriggerImportJson'),

    // Grid Columns & Brand Themes & Vector QR
    segGridCols: document.getElementById('segGridCols'),
    themeSwatches: document.getElementById('themeSwatches'),
    inpFooterQrUrl: document.getElementById('inpFooterQrUrl'),
    btnUpdateQr: document.getElementById('btnUpdateQr')
  };

  // ============================================================
  // INITIALIZATION & TEMPLATE LOADING
  // ============================================================
  async function init() {
    setupToolPalette();
    setupArtboardTabs();
    setupZoomAndPan();
    setupInspectorEvents();
    setupArtboardTool();
    setupBrandThemeEngine();
    setupGridColumnSwitcher();
    setupQrCodeGenerator();
    setupExportModal();
    setupShortcuts();
    setupLiveSync();

    await loadMenuTemplate();
    fitZoomToScreen();
    showToast('Illustrator Canvas Studio Ready', 'success');
  }

  // ============================================================
  // REAL-TIME LIVE SYNC & AI GHOST CURSOR
  // ============================================================
  function setupLiveSync() {
    try {
      const evtSource = new EventSource('/api/events');

      evtSource.onopen = () => {
        console.log('[SSE] Live Sync connected to server');
        if (dom.liveSyncBadge) {
          dom.liveSyncBadge.style.display = 'flex';
        }
      };

      // Handle full HTML live reload (whenever files are modified on disk)
      evtSource.addEventListener('menu-reload', (e) => {
        try {
          const payload = JSON.parse(e.data);
          console.log('[SSE] Received menu-reload from Antigravity');
          state.rawTemplateHtml = payload.html;

          // Preserve active board & selection
          const prevBoard = state.currentBoard;
          renderArtboardsFromHtml(payload.html);
          switchBoard(prevBoard);

          // Flash live updated elements
          const activeWrapper = dom.artboardsContainer.querySelector(`.page-artboard-wrapper[data-board-id="${prevBoard}"]`);
          if (activeWrapper) {
            activeWrapper.classList.add('live-updated-flash');
            setTimeout(() => activeWrapper.classList.remove('live-updated-flash'), 1200);
          }

          showToast('✨ Live Canvas Synced from Antigravity', 'info');
        } catch (err) {
          console.warn('[SSE] Error processing menu-reload:', err);
        }
      });

      // Handle granular AI Ghost Cursor actions
      evtSource.addEventListener('ai-action', (e) => {
        try {
          const action = JSON.parse(e.data);
          handleAiAction(action);
        } catch (err) {
          console.warn('[SSE] Error processing ai-action:', err);
        }
      });

      evtSource.onerror = (err) => {
        console.warn('[SSE] Connection issue, retrying...', err);
        // If hosted on GitHub Pages or static preview without SSE server, close gracefully
        if (location.protocol === 'https:' && location.hostname.includes('github.io')) {
          evtSource.close();
          if (dom.liveSyncBadge) dom.liveSyncBadge.style.display = 'none';
        }
      };
    } catch (e) {
      console.warn('[SSE] EventSource initialization failed:', e);
    }
  }

  function handleAiAction(action) {
    console.log('[AI ACTION]', action);

    // Auto-switch board if specified
    if (action.boardId && action.boardId !== state.currentBoard) {
      switchBoard(action.boardId);
    }

    if (action.type === 'focus_card') {
      const card = document.querySelector(action.selector || `.page-artboard-wrapper[data-board-id="${state.currentBoard}"] .menu-card:nth-child(${action.cardIndex || 1})`);
      if (card && dom.aiGhostCursor) {
        // Clear previous pulses
        document.querySelectorAll('.ai-editing-pulse').forEach(el => el.classList.remove('ai-editing-pulse'));
        card.classList.add('ai-editing-pulse');

        const stageRect = dom.stage.getBoundingClientRect();
        const cardRect = card.getBoundingClientRect();
        const zoom = state.zoom;

        const left = (cardRect.left - stageRect.left) / zoom + 30;
        const top = (cardRect.top - stageRect.top) / zoom - 20;

        dom.aiGhostCursor.style.display = 'flex';
        dom.aiGhostCursor.style.left = `${left}px`;
        dom.aiGhostCursor.style.top = `${top}px`;
        if (dom.aiActionText) dom.aiActionText.textContent = action.message || 'Designing...';

        selectElement(card, card);
      }
    } else if (action.type === 'type_field') {
      const target = document.querySelector(action.selector);
      if (target) {
        target.textContent = action.text;
        updateTransformOverlay();
      }
    } else if (action.type === 'finish') {
      document.querySelectorAll('.ai-editing-pulse').forEach(el => el.classList.remove('ai-editing-pulse'));
      if (dom.aiGhostCursor) {
        dom.aiGhostCursor.style.opacity = '0';
        dom.aiGhostCursor.style.transition = 'opacity 0.5s ease';
        setTimeout(() => {
          dom.aiGhostCursor.style.display = 'none';
          dom.aiGhostCursor.style.opacity = '1';
        }, 500);
      }
    }
  }

  async function loadMenuTemplate() {
    try {
      setStatus('LOADING...', 'busy');
      const res = await fetch('/api/menu');
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      state.rawTemplateHtml = data.html;

      renderArtboardsFromHtml(data.html);
      pushHistory('Initial Load');
      setStatus('READY', 'ready');
    } catch (err) {
      console.warn('API error, falling back to direct static menu fetch:', err);
      try {
        let res = await fetch('../src/menu.html').catch(() => null);
        if (!res || !res.ok) res = await fetch('./src/menu.html').catch(() => null);
        if (!res || !res.ok) res = await fetch('/src/menu.html').catch(() => null);
        if (!res || !res.ok) throw new Error('Could not locate src/menu.html template');
        const html = await res.text();
        state.rawTemplateHtml = html;
        renderArtboardsFromHtml(html);
        pushHistory('Initial Load');
        setStatus('READY (PREVIEW)', 'ready');
      } catch (e) {
        showToast('Failed to load menu template: ' + e.message, 'error');
        setStatus('ERROR', 'busy');
      }
    }
  }

  function renderArtboardsFromHtml(fullHtml) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(fullHtml, 'text/html');

    // Extract styles
    const styles = Array.from(doc.querySelectorAll('style')).map(s => s.outerHTML).join('\n');
    
    // Extract pages
    const pages = Array.from(doc.querySelectorAll('.page'));

    dom.artboardsContainer.innerHTML = '';

    // Inject styles
    const styleContainer = document.createElement('div');
    styleContainer.id = 'injectedStyles';
    styleContainer.innerHTML = styles;
    dom.artboardsContainer.appendChild(styleContainer);

    pages.forEach((pageEl, idx) => {
      const pageId = pageEl.id || `page-${idx + 1}`;
      const wrapper = document.createElement('div');
      wrapper.className = 'page-artboard-wrapper';
      wrapper.dataset.boardId = pageId;

      const label = document.createElement('div');
      label.className = 'artboard-label-tag';
      const boardTitle = pageEl.querySelector('.category-title-group h1')?.textContent?.trim() || `BOARD 0${idx + 1}`;
      label.textContent = `ARTBOARD 0${idx + 1} // ${boardTitle}`;
      wrapper.appendChild(label);

      // Clone page element into artboard
      const clonedPage = pageEl.cloneNode(true);
      wrapper.appendChild(clonedPage);
      dom.artboardsContainer.appendChild(wrapper);

      // Attach interaction listeners to the page
      setupArtboardInteractions(clonedPage);
    });

    switchBoard(state.currentBoard);
  }

  // ============================================================
  // ARTBOARD & ELEMENT INTERACTIONS
  // ============================================================
  function setupArtboardInteractions(pageEl) {
    // Click selection
    pageEl.addEventListener('click', (e) => {
      if (state.currentTool === 'hand') return;

      const card = e.target.closest('.menu-card');
      const target = e.target;

      if (target.classList.contains('item-title') || 
          target.classList.contains('item-desc') || 
          target.classList.contains('price-pill') || 
          target.classList.contains('old-price') || 
          target.classList.contains('tag-chip') ||
          target.classList.contains('outlined-title')) {
        selectElement(target, card);
      } else if (card) {
        selectElement(card, card);
      } else {
        clearSelection();
      }
      e.stopPropagation();
    });

    // Double-click inline text editing
    pageEl.addEventListener('dblclick', (e) => {
      const target = e.target;
      if (target.classList.contains('item-title') || 
          target.classList.contains('item-desc') || 
          target.classList.contains('old-price') || 
          target.classList.contains('price-pill')) {
        enableInlineEdit(target);
      }
    });

    // Hover effect
    pageEl.addEventListener('mouseover', (e) => {
      if (state.currentTool === 'hand') return;
      const card = e.target.closest('.menu-card');
      if (card && card !== state.selectedCard) {
        card.classList.add('hover-target');
      }
    });

    pageEl.addEventListener('mouseout', (e) => {
      const card = e.target.closest('.menu-card');
      if (card) {
        card.classList.remove('hover-target');
      }
    });
  }

  function selectElement(el, parentCard) {
    clearSelection(false);

    state.selectedElement = el;
    state.selectedCard = parentCard || el.closest('.menu-card');

    el.classList.add('active-selection');
    if (state.selectedCard && state.selectedCard !== el) {
      state.selectedCard.classList.add('active-selection');
    }

    updateTransformOverlay();
    syncInspectorWithSelection();
    updateReorderButtons();
  }

  function clearSelection(hideOverlay = true) {
    if (state.selectedElement) {
      state.selectedElement.classList.remove('active-selection');
    }
    if (state.selectedCard) {
      state.selectedCard.classList.remove('active-selection');
    }
    state.selectedElement = null;
    state.selectedCard = null;

    if (hideOverlay) {
      dom.transformOverlay.style.display = 'none';
      dom.selectionTypeBadge.textContent = 'No Selection';
      disableInspectorFields();
    }
  }

  function updateTransformOverlay() {
    if (!state.selectedElement) {
      dom.transformOverlay.style.display = 'none';
      return;
    }

    const stageRect = dom.stage.getBoundingClientRect();
    const elRect = state.selectedElement.getBoundingClientRect();

    // Calculate relative coordinates inside the zoomable stage
    const zoom = state.zoom;
    const left = (elRect.left - stageRect.left) / zoom;
    const top = (elRect.top - stageRect.top) / zoom;
    const width = elRect.width / zoom;
    const height = elRect.height / zoom;

    dom.transformOverlay.style.display = 'block';
    dom.transformOverlay.style.left = `${left}px`;
    dom.transformOverlay.style.top = `${top}px`;
    dom.transformOverlay.style.width = `${width}px`;
    dom.transformOverlay.style.height = `${height}px`;

    // Overlay tag label
    let label = 'Element';
    if (state.selectedElement.classList.contains('menu-card')) label = 'Card Container';
    else if (state.selectedElement.classList.contains('item-title')) label = 'Item Title';
    else if (state.selectedElement.classList.contains('item-desc')) label = 'Description';
    else if (state.selectedElement.classList.contains('price-pill')) label = 'Price Pill';
    else if (state.selectedElement.classList.contains('old-price')) label = 'Strikethrough Price';
    else if (state.selectedElement.classList.contains('tag-chip')) label = 'Dietary Badge';
    else if (state.selectedElement.classList.contains('outlined-title')) label = 'Category Heading';

    dom.transformLabel.textContent = label;
    dom.selectionTypeBadge.textContent = label;
  }

  function enableInlineEdit(el) {
    el.contentEditable = 'true';
    el.focus();
    selectElement(el, el.closest('.menu-card'));

    const onBlur = () => {
      el.contentEditable = 'false';
      el.removeEventListener('blur', onBlur);
      syncInspectorWithSelection();
      pushHistory('Inline text edit');
    };

    el.addEventListener('blur', onBlur);
  }

  // ============================================================
  // INSPECTOR CONTROLS SYNC
  // ============================================================
  function syncInspectorWithSelection() {
    const card = state.selectedCard;
    if (!card) return;

    enableInspectorFields();

    // Title
    const titleEl = card.querySelector('.item-title');
    dom.inpItemTitle.value = titleEl ? titleEl.textContent.trim() : '';

    // Description
    const descEl = card.querySelector('.item-desc');
    dom.inpItemDesc.value = descEl ? descEl.textContent.trim() : '';

    // Price
    const pricePill = card.querySelector('.price-pill');
    dom.inpPrice.value = pricePill ? pricePill.textContent.trim() : '';

    // Old Price
    const oldPriceEl = card.querySelector('.old-price');
    dom.inpOldPrice.value = oldPriceEl ? oldPriceEl.textContent.trim() : '';
    dom.chkStrikeThrough.checked = !!oldPriceEl;

    // Hero Badge
    dom.chkHeroCard.checked = card.classList.contains('hero-item');

    // Badge / Stamp
    const badgeEl = card.querySelector('.tag-chip');
    if (badgeEl) {
      const text = badgeEl.textContent.toLowerCase();
      if (text.includes('bestseller')) dom.selItemBadge.value = 'bestseller';
      else if (text.includes('spicy') || text.includes('heat')) dom.selItemBadge.value = 'high-heat';
      else if (text.includes('chef')) dom.selItemBadge.value = 'chef-pick';
      else if (text.includes('crowd') || text.includes('fav')) dom.selItemBadge.value = 'crowd-fav';
      else if (text.includes('veg')) dom.selItemBadge.value = 'veg-delight';
      else if (text.includes('heavy')) dom.selItemBadge.value = 'heavyweight';
      else if (text.includes('all-in-one')) dom.selItemBadge.value = 'all-in-one';
      else if (text.includes('fast')) dom.selItemBadge.value = 'fast-combo';
      else dom.selItemBadge.value = 'none';
    } else {
      dom.selItemBadge.value = 'none';
    }

    // Typography & Stroke
    const activeEl = state.selectedElement || titleEl || card;
    const computed = window.getComputedStyle(activeEl);
    
    const size = parseInt(computed.fontSize, 10);
    dom.rngFontSize.value = isNaN(size) ? 22 : size;
    dom.fontSizeVal.textContent = `${dom.rngFontSize.value}px`;

    const strokeWidth = parseFloat(computed.webkitTextStrokeWidth) || 0;
    dom.rngStrokeWidth.value = strokeWidth;
    dom.strokeVal.textContent = `${strokeWidth}px`;
  }

  function enableInspectorFields() {
    dom.inpItemTitle.disabled = false;
    dom.inpItemDesc.disabled = false;
    dom.selItemBadge.disabled = false;
    dom.chkHeroCard.disabled = false;
    dom.inpPrice.disabled = false;
    dom.inpOldPrice.disabled = false;
    dom.chkStrikeThrough.disabled = false;
  }

  function disableInspectorFields() {
    dom.inpItemTitle.disabled = true;
    dom.inpItemDesc.disabled = true;
    dom.selItemBadge.disabled = true;
    dom.chkHeroCard.disabled = true;
    dom.inpPrice.disabled = true;
    dom.inpOldPrice.disabled = true;
    dom.chkStrikeThrough.disabled = true;
    dom.btnMoveUp.disabled = true;
    dom.btnMoveDown.disabled = true;
    dom.btnDuplicateCard.disabled = true;
    dom.btnDeleteCard.disabled = true;
  }

  function setupInspectorEvents() {
    // Title update
    dom.inpItemTitle.addEventListener('input', () => {
      if (!state.selectedCard) return;
      let titleEl = state.selectedCard.querySelector('.item-title');
      if (titleEl) {
        titleEl.textContent = dom.inpItemTitle.value;
        updateTransformOverlay();
      }
    });
    dom.inpItemTitle.addEventListener('change', () => pushHistory('Edit Title'));

    // Desc update
    dom.inpItemDesc.addEventListener('input', () => {
      if (!state.selectedCard) return;
      let descEl = state.selectedCard.querySelector('.item-desc');
      if (descEl) {
        descEl.textContent = dom.inpItemDesc.value;
        updateTransformOverlay();
      }
    });
    dom.inpItemDesc.addEventListener('change', () => pushHistory('Edit Description'));

    // Price Pill update
    dom.inpPrice.addEventListener('input', () => {
      if (!state.selectedCard) return;
      let priceEl = state.selectedCard.querySelector('.price-pill');
      if (priceEl) {
        priceEl.textContent = dom.inpPrice.value;
        updateTransformOverlay();
      }
    });
    dom.inpPrice.addEventListener('change', () => pushHistory('Edit Price'));

    // Old Price update
    dom.inpOldPrice.addEventListener('input', () => {
      if (!state.selectedCard) return;
      let oldPriceEl = state.selectedCard.querySelector('.old-price');
      if (!oldPriceEl && dom.inpOldPrice.value) {
        // create strike box if needed
        const strikeBox = state.selectedCard.querySelector('.price-strike-box');
        if (strikeBox) {
          oldPriceEl = document.createElement('span');
          oldPriceEl.className = 'old-price';
          strikeBox.appendChild(oldPriceEl);
        }
      }
      if (oldPriceEl) {
        oldPriceEl.textContent = dom.inpOldPrice.value;
        updateTransformOverlay();
      }
    });
    dom.inpOldPrice.addEventListener('change', () => pushHistory('Edit Old Price'));

    // Red Strike toggle
    dom.chkStrikeThrough.addEventListener('change', () => {
      if (!state.selectedCard) return;
      const oldPriceEl = state.selectedCard.querySelector('.old-price');
      if (oldPriceEl) {
        oldPriceEl.style.display = dom.chkStrikeThrough.checked ? 'inline-block' : 'none';
        updateTransformOverlay();
        pushHistory('Toggle Strikethrough');
      }
    });

    // Pill color
    dom.inpPillBg.addEventListener('input', () => {
      dom.pillBgHex.textContent = dom.inpPillBg.value.toUpperCase();
      if (!state.selectedCard) return;
      const pill = state.selectedCard.querySelector('.price-pill');
      if (pill) pill.style.backgroundColor = dom.inpPillBg.value;
    });
    dom.inpPillBg.addEventListener('change', () => pushHistory('Change Pill Color'));

    // Hero toggle
    dom.chkHeroCard.addEventListener('change', () => {
      if (!state.selectedCard) return;
      state.selectedCard.classList.toggle('hero-item', dom.chkHeroCard.checked);
      let badge = state.selectedCard.querySelector('.hero-badge');
      if (dom.chkHeroCard.checked && !badge) {
        badge = document.createElement('div');
        badge.className = 'hero-badge';
        badge.textContent = 'BESTSELLER';
        state.selectedCard.prepend(badge);
      } else if (!dom.chkHeroCard.checked && badge) {
        badge.remove();
      }
      updateTransformOverlay();
      pushHistory('Toggle Hero Card');
    });

    // Badge selector
    dom.selItemBadge.addEventListener('change', () => {
      if (!state.selectedCard) return;
      const tagRow = state.selectedCard.querySelector('.item-tag-row');
      if (!tagRow) return;

      const badgeType = dom.selItemBadge.value;
      if (badgeType === 'none') {
        tagRow.innerHTML = '';
      } else {
        tagRow.innerHTML = createBadgeHtml(badgeType);
      }
      updateTransformOverlay();
      pushHistory('Change Badge');
    });

    // Typography Font Size
    dom.rngFontSize.addEventListener('input', () => {
      const val = `${dom.rngFontSize.value}px`;
      dom.fontSizeVal.textContent = val;
      const target = state.selectedElement || state.selectedCard?.querySelector('.item-title');
      if (target) {
        target.style.fontSize = val;
        updateTransformOverlay();
      }
    });
    dom.rngFontSize.addEventListener('change', () => pushHistory('Change Font Size'));

    // Typography Stroke Width
    dom.rngStrokeWidth.addEventListener('input', () => {
      const val = `${dom.rngStrokeWidth.value}px`;
      dom.strokeVal.textContent = val;
      const target = state.selectedElement || state.selectedCard?.querySelector('.item-title');
      if (target) {
        target.style.webkitTextStrokeWidth = val;
        target.style.webkitTextStrokeColor = dom.inpStrokeColor.value;
        updateTransformOverlay();
      }
    });
    dom.rngStrokeWidth.addEventListener('change', () => pushHistory('Change Stroke Width'));

    // Typography Stroke Color
    dom.inpStrokeColor.addEventListener('input', () => {
      dom.strokeColorHex.textContent = dom.inpStrokeColor.value.toUpperCase();
      const target = state.selectedElement || state.selectedCard?.querySelector('.item-title');
      if (target) {
        target.style.webkitTextStrokeColor = dom.inpStrokeColor.value;
      }
    });

    // Card Reordering
    dom.btnMoveUp.addEventListener('click', () => moveSelectedCard(-1));
    dom.btnMoveDown.addEventListener('click', () => moveSelectedCard(1));
    dom.btnDuplicateCard.addEventListener('click', duplicateSelectedCard);
    dom.btnDeleteCard.addEventListener('click', deleteSelectedCard);

    // Save & Compile buttons
    dom.btnSaveHtml.addEventListener('click', saveHtmlDocument);
    dom.btnCompilePdf.addEventListener('click', compileProductionPdf);
    dom.btnQuickAudit.addEventListener('click', compileProductionPdf);

    // Toggle Guides
    dom.toggleGuidesBtn.addEventListener('click', () => {
      state.showGuides = !state.showGuides;
      dom.toggleGuidesBtn.classList.toggle('active', state.showGuides);
      dom.printGuides.classList.toggle('visible', state.showGuides);
      showToast(`Print Safe Guides: ${state.showGuides ? 'ON' : 'OFF'}`, 'info');
    });
  }

  function createBadgeHtml(badgeType) {
    switch (badgeType) {
      case 'bestseller':
        return `<span class="tag-chip tag-popular"><img src="../assets/star.svg" alt="star"> BESTSELLER</span>`;
      case 'high-heat':
        return `<span class="tag-chip tag-spicy"><img src="../assets/flame.svg" alt="flame"> HIGH HEAT</span>`;
      case 'chef-pick':
        return `<span class="tag-chip tag-popular"><img src="../assets/star.svg" alt="star"> CHEF PICK</span>`;
      case 'crowd-fav':
        return `<span class="tag-chip tag-popular"><img src="../assets/star.svg" alt="star"> CROWD FAV</span>`;
      case 'veg-delight':
        return `<span class="tag-chip tag-popular">VEG DELIGHT</span>`;
      case 'heavyweight':
        return `<span class="tag-chip tag-signature">HEAVYWEIGHT</span>`;
      case 'all-in-one':
        return `<span class="tag-chip tag-popular"><img src="../assets/star.svg" alt="star"> ALL-IN-ONE</span>`;
      case 'fast-combo':
        return `<span class="tag-chip tag-popular"><img src="../assets/lightning.svg" alt="lightning"> FAST COMBO</span>`;
      default:
        return '';
    }
  }

  // ============================================================
  // CARD REORDERING & MANAGEMENT
  // ============================================================
  function updateReorderButtons() {
    if (!state.selectedCard) {
      dom.btnMoveUp.disabled = true;
      dom.btnMoveDown.disabled = true;
      dom.btnDuplicateCard.disabled = true;
      dom.btnDeleteCard.disabled = true;
      return;
    }

    const prev = state.selectedCard.previousElementSibling;
    const next = state.selectedCard.nextElementSibling;

    dom.btnMoveUp.disabled = !prev || !prev.classList.contains('menu-card');
    dom.btnMoveDown.disabled = !next || !next.classList.contains('menu-card');
    dom.btnDuplicateCard.disabled = false;
    dom.btnDeleteCard.disabled = false;
  }

  function moveSelectedCard(delta) {
    const card = state.selectedCard;
    if (!card) return;

    const parent = card.parentElement;
    if (delta === -1 && card.previousElementSibling) {
      parent.insertBefore(card, card.previousElementSibling);
    } else if (delta === 1 && card.nextElementSibling) {
      parent.insertBefore(card.nextElementSibling, card);
    }

    updateTransformOverlay();
    updateReorderButtons();
    pushHistory('Reorder Card');
  }

  function duplicateSelectedCard() {
    const card = state.selectedCard;
    if (!card) return;

    const clone = card.cloneNode(true);
    clone.classList.remove('active-selection', 'hover-target');
    card.after(clone);

    selectElement(clone, clone);
    pushHistory('Duplicate Card');
    showToast('Card Duplicated', 'success');
  }

  function deleteSelectedCard() {
    const card = state.selectedCard;
    if (!card) return;

    if (confirm('Delete selected menu card?')) {
      card.remove();
      clearSelection();
      pushHistory('Delete Card');
      showToast('Card Deleted', 'warn');
    }
  }

  // ============================================================
  // ARTBOARD NAVIGATION & TABS
  // ============================================================
  function setupArtboardTabs() {
    dom.artboardTabs.addEventListener('click', (e) => {
      const btn = e.target.closest('.tab-btn');
      if (!btn) return;

      const boardId = btn.dataset.board;
      switchBoard(boardId);
    });
  }

  function switchBoard(boardId) {
    state.currentBoard = boardId;

    // Update tab active class
    dom.artboardTabs.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.board === boardId);
    });

    const wrappers = dom.artboardsContainer.querySelectorAll('.page-artboard-wrapper');
    if (boardId === 'all') {
      dom.artboardsContainer.classList.add('grid-view');
      wrappers.forEach(w => w.style.display = 'block');
    } else {
      dom.artboardsContainer.classList.remove('grid-view');
      wrappers.forEach(w => {
        w.style.display = w.dataset.boardId === boardId ? 'block' : 'none';
      });
    }

    clearSelection();
    fitZoomToScreen();
    updatePrintGuidesPosition();
    updateArtboardOverlayPosition();

    if (dom.activeBoardTag) {
      dom.activeBoardTag.textContent = boardId === 'all' ? 'ALL BOARDS' : boardId.toUpperCase().replace('-', ' ');
    }
  }

  function updatePrintGuidesPosition() {
    const activeWrapper = dom.artboardsContainer.querySelector('.page-artboard-wrapper[style*="block"]') ||
                          dom.artboardsContainer.querySelector('.page-artboard-wrapper');
    if (!activeWrapper) return;

    const page = activeWrapper.querySelector('.page');
    if (!page) return;

    const stageRect = dom.stage.getBoundingClientRect();
    const pageRect = page.getBoundingClientRect();

    const zoom = state.zoom;
    const left = (pageRect.left - stageRect.left) / zoom + 36;
    const top = (pageRect.top - stageRect.top) / zoom + 32;
    const width = Math.max(100, state.artboardWidth - 72);
    const height = Math.max(100, state.artboardHeight - 64);

    dom.printGuides.style.left = `${left}px`;
    dom.printGuides.style.top = `${top}px`;
    dom.printGuides.style.width = `${width}px`;
    dom.printGuides.style.height = `${height}px`;
  }

  // ============================================================
  // ZOOM & PAN ENGINE (ADAPTIVE RESPONSIVE)
  // ============================================================
  function setupZoomAndPan() {
    dom.btnZoomIn.addEventListener('click', () => setZoom(state.zoom + 0.1));
    dom.btnZoomOut.addEventListener('click', () => setZoom(state.zoom - 0.1));
    dom.btnZoomFit.addEventListener('click', fitZoomToScreen);

    // Inspector toggle & drawer handlers
    if (dom.btnToggleInspector) {
      dom.btnToggleInspector.addEventListener('click', toggleInspector);
    }
    if (dom.btnCloseInspector) {
      dom.btnCloseInspector.addEventListener('click', closeInspectorDrawer);
    }
    if (dom.drawerBackdrop) {
      dom.drawerBackdrop.addEventListener('click', closeInspectorDrawer);
    }

    // Viewport ResizeObserver for instantaneous auto-fit responsiveness
    if (window.ResizeObserver && dom.viewport) {
      let roTimer = null;
      const ro = new ResizeObserver(() => {
        clearTimeout(roTimer);
        roTimer = setTimeout(() => {
          fitZoomToScreen();
        }, 50);
      });
      ro.observe(dom.viewport);
    }

    // Window resize adaptive listener
    let resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        fitZoomToScreen();
      }, 50);
    });

    // Pan via Spacebar or Hand Tool
    dom.viewport.addEventListener('mousedown', (e) => {
      if (state.currentTool === 'hand' || e.code === 'Space' || e.button === 1) {
        state.isPanning = true;
        state.panStartX = e.clientX - state.panX;
        state.panStartY = e.clientY - state.panY;
        dom.viewport.style.cursor = 'grabbing';
        e.preventDefault();
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (state.isPanning) {
        state.panX = e.clientX - state.panStartX;
        state.panY = e.clientY - state.panStartY;
        applyTransform();
      }
    });

    window.addEventListener('mouseup', () => {
      if (state.isPanning) {
        state.isPanning = false;
        dom.viewport.style.cursor = state.currentTool === 'hand' ? 'grab' : 'default';
      }
    });

    // Wheel zoom
    dom.viewport.addEventListener('wheel', (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.05 : 0.05;
        setZoom(state.zoom + delta);
      }
    }, { passive: false });
  }

  function toggleInspector() {
    if (!dom.inspectorPanel) return;
    const isNarrow = window.innerWidth <= 960;
    if (isNarrow) {
      const isOpen = dom.inspectorPanel.classList.toggle('open');
      if (dom.drawerBackdrop) dom.drawerBackdrop.classList.toggle('active', isOpen);
      if (dom.btnToggleInspector) dom.btnToggleInspector.classList.toggle('active', isOpen);
      showToast(isOpen ? 'Properties Panel Opened' : 'Properties Panel Closed', 'info');
    } else {
      const isCollapsed = dom.inspectorPanel.classList.toggle('collapsed');
      if (dom.btnToggleInspector) dom.btnToggleInspector.classList.toggle('active', !isCollapsed);
      showToast(isCollapsed ? 'Inspector Collapsed (Press I to reopen)' : 'Inspector Opened', 'info');
      setTimeout(fitZoomToScreen, 220);
    }
  }

  function openInspectorDrawer() {
    if (!dom.inspectorPanel) return;
    const isNarrow = window.innerWidth <= 960;
    if (isNarrow) {
      dom.inspectorPanel.classList.add('open');
      if (dom.drawerBackdrop) dom.drawerBackdrop.classList.add('active');
      if (dom.btnToggleInspector) dom.btnToggleInspector.classList.add('active');
    } else {
      dom.inspectorPanel.classList.remove('collapsed');
      if (dom.btnToggleInspector) dom.btnToggleInspector.classList.add('active');
      setTimeout(fitZoomToScreen, 220);
    }
  }

  function closeInspectorDrawer() {
    if (!dom.inspectorPanel) return;
    const isNarrow = window.innerWidth <= 960;
    if (isNarrow) {
      dom.inspectorPanel.classList.remove('open');
      if (dom.drawerBackdrop) dom.drawerBackdrop.classList.remove('active');
      if (dom.btnToggleInspector) dom.btnToggleInspector.classList.remove('active');
    } else {
      dom.inspectorPanel.classList.add('collapsed');
      if (dom.btnToggleInspector) dom.btnToggleInspector.classList.remove('active');
      setTimeout(fitZoomToScreen, 220);
    }
  }

  function setZoom(val) {
    state.zoom = Math.max(0.20, Math.min(2.5, Math.round(val * 100) / 100));
    updateZoomDisplay();
    applyTransform();
    updateTransformOverlay();
    updatePrintGuidesPosition();
    updateArtboardOverlayPosition();
  }

  function updateZoomDisplay() {
    dom.zoomValue.textContent = `${Math.round(state.zoom * 100)}%`;
  }

  function fitZoomToScreen() {
    const isMobile = window.innerWidth <= 768;
    const padX = isMobile ? 24 : 48;
    const padY = isMobile ? 80 : 48; // room for bottom floating dock
    const availWidth = Math.max(220, dom.viewport.clientWidth - padX);
    const availHeight = Math.max(220, dom.viewport.clientHeight - padY);

    const isAll = state.currentBoard === 'all';
    const targetWidth = isAll ? (state.artboardWidth * 2 + 80) : state.artboardWidth;
    const targetHeight = isAll ? (state.artboardHeight * 3 + 120) : state.artboardHeight;

    const fitScaleX = availWidth / targetWidth;
    const fitScaleY = availHeight / targetHeight;
    const optimalFit = Math.min(fitScaleX, fitScaleY);

    state.panX = 0;
    state.panY = 0;
    setZoom(Math.max(0.20, Math.min(1.0, optimalFit)));
  }

  function applyTransform() {
    const isAll = state.currentBoard === 'all';
    const baseWidth = isAll ? (state.artboardWidth * 2 + 80) : state.artboardWidth;
    const baseHeight = isAll ? (state.artboardHeight * 3 + 120) : state.artboardHeight;

    const scaledWidth = Math.round(baseWidth * state.zoom);
    const scaledHeight = Math.round(baseHeight * state.zoom);

    if (dom.stageSizer) {
      dom.stageSizer.style.width = `${scaledWidth}px`;
      dom.stageSizer.style.height = `${scaledHeight}px`;
    }

    dom.stage.style.transform = `translate(${state.panX}px, ${state.panY}px) scale(${state.zoom})`;
  }

  // ============================================================
  // TOOL PALETTE SELECTION
  // ============================================================
  function setupToolPalette() {
    dom.toolPalette.addEventListener('click', (e) => {
      const btn = e.target.closest('.tool-btn');
      if (!btn) return;

      const tool = btn.dataset.tool;
      if (tool === 'add-card') {
        addNewCardToCurrentBoard();
        return;
      }
      if (tool === 'guides') return; // Handled separately

      setTool(tool);
    });
  }

  function setTool(toolName) {
    state.currentTool = toolName;
    dom.toolPalette.querySelectorAll('.tool-btn').forEach(btn => {
      if (btn.dataset.tool !== 'guides') {
        btn.classList.toggle('active', btn.dataset.tool === toolName);
      }
    });

    if (toolName === 'hand') {
      dom.viewport.style.cursor = 'grab';
    } else if (toolName === 'artboard') {
      dom.viewport.style.cursor = 'crosshair';
    } else {
      dom.viewport.style.cursor = 'default';
    }

    if (toolName === 'artboard') {
      updateArtboardOverlayPosition();
      openInspectorDrawer();
      showToast('Artboard Tool: Drag handles or select preset', 'info');
    } else {
      if (dom.artboardOverlay) dom.artboardOverlay.style.display = 'none';
    }
  }

  function addNewCardToCurrentBoard() {
    const activeWrapper = dom.artboardsContainer.querySelector(`.page-artboard-wrapper[data-board-id="${state.currentBoard}"]`);
    if (!activeWrapper) return;

    const grid = activeWrapper.querySelector('.items-grid');
    if (!grid) return;

    const newCard = document.createElement('article');
    newCard.className = 'menu-card';
    newCard.innerHTML = `
      <div class="card-top">
        <div class="card-title-wrap">
          <h2 class="item-title">New Gourmet Item</h2>
          <div class="item-tag-row">
            <span class="tag-chip tag-popular"><img src="../assets/star.svg" alt="star"> NEW DROP</span>
          </div>
        </div>
      </div>
      <p class="item-desc">Freshly crafted culinary masterpiece seasoned with chef secret spices and artisanal sauces.</p>
      <div class="card-price-row">
        <div class="price-strike-box">
          <span class="old-price">$15.00</span>
        </div>
        <span class="price-pill">$12.50</span>
      </div>
    `;

    grid.appendChild(newCard);
    selectElement(newCard, newCard);
    pushHistory('Add New Card');
    showToast('New Menu Item Added', 'success');
  }

  // ============================================================
  // ILLUSTRATOR ARTBOARD ENGINE (RESIZE, PRESETS, ORIENTATION)
  // ============================================================
  function setupArtboardTool() {
    // Preset dropdown change
    if (dom.selArtboardPreset) {
      dom.selArtboardPreset.addEventListener('change', () => {
        const val = dom.selArtboardPreset.value;
        if (ARTBOARD_PRESETS[val]) {
          const p = ARTBOARD_PRESETS[val];
          setArtboardDimensions(p.width, p.height, p.name, true);
        }
      });
    }

    // Direct width/height inputs
    if (dom.inpArtboardW) {
      dom.inpArtboardW.addEventListener('change', () => {
        const w = parseInt(dom.inpArtboardW.value, 10);
        const h = parseInt(dom.inpArtboardH ? dom.inpArtboardH.value : state.artboardHeight, 10);
        if (!isNaN(w) && w >= 300) {
          setArtboardDimensions(w, isNaN(h) ? state.artboardHeight : h, 'Custom', true);
        }
      });
    }

    if (dom.inpArtboardH) {
      dom.inpArtboardH.addEventListener('change', () => {
        const h = parseInt(dom.inpArtboardH.value, 10);
        const w = parseInt(dom.inpArtboardW ? dom.inpArtboardW.value : state.artboardWidth, 10);
        if (!isNaN(h) && h >= 300) {
          setArtboardDimensions(isNaN(w) ? state.artboardWidth : w, h, 'Custom', true);
        }
      });
    }

    // Swap orientation
    if (dom.btnSwapOrientation) {
      dom.btnSwapOrientation.addEventListener('click', swapArtboardOrientation);
    }

    // Artboard management buttons
    if (dom.btnNewArtboard) {
      dom.btnNewArtboard.addEventListener('click', createNewArtboard);
    }
    if (dom.btnDuplicateArtboard) {
      dom.btnDuplicateArtboard.addEventListener('click', duplicateActiveArtboard);
    }
    if (dom.btnDeleteArtboard) {
      dom.btnDeleteArtboard.addEventListener('click', deleteActiveArtboard);
    }

    // Interactive Drag-to-Resize on 8 Handles
    if (dom.artboardOverlay) {
      dom.artboardOverlay.addEventListener('mousedown', (e) => {
        const handle = e.target.closest('.artboard-handle');
        if (!handle) return;

        e.preventDefault();
        e.stopPropagation();

        state.isResizingArtboard = true;
        state.artboardResizeHandle = handle.dataset.handle;
        state.artboardResizeStart = {
          mouseX: e.clientX,
          mouseY: e.clientY,
          w: state.artboardWidth,
          h: state.artboardHeight
        };

        const onMouseMove = (ev) => {
          if (!state.isResizingArtboard) return;
          const dx = (ev.clientX - state.artboardResizeStart.mouseX) / state.zoom;
          const dy = (ev.clientY - state.artboardResizeStart.mouseY) / state.zoom;

          let newW = state.artboardResizeStart.w;
          let newH = state.artboardResizeStart.h;

          const hType = state.artboardResizeHandle;
          if (hType.includes('e')) newW = Math.max(320, Math.min(3840, Math.round(state.artboardResizeStart.w + dx)));
          if (hType.includes('w')) newW = Math.max(320, Math.min(3840, Math.round(state.artboardResizeStart.w - dx)));
          if (hType.includes('s')) newH = Math.max(320, Math.min(3840, Math.round(state.artboardResizeStart.h + dy)));
          if (hType.includes('n')) newH = Math.max(320, Math.min(3840, Math.round(state.artboardResizeStart.h - dy)));

          setArtboardDimensions(newW, newH, 'Custom', false);
        };

        const onMouseUp = () => {
          if (state.isResizingArtboard) {
            state.isResizingArtboard = false;
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
            pushHistory(`Resize Artboard to ${state.artboardWidth}x${state.artboardHeight}`);
            showToast(`Artboard Size: ${state.artboardWidth} × ${state.artboardHeight} px`, 'success');
          }
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
      });
    }
  }

  function setArtboardDimensions(width, height, presetName = 'Custom', recordHistory = true) {
    state.artboardWidth = Math.max(300, Math.min(3840, Math.round(width)));
    state.artboardHeight = Math.max(300, Math.min(3840, Math.round(height)));

    // Update CSS variables on root and injected styles
    document.documentElement.style.setProperty('--page-width', `${state.artboardWidth}px`);
    document.documentElement.style.setProperty('--page-height', `${state.artboardHeight}px`);

    const injected = document.getElementById('injectedStyles');
    if (injected) {
      let css = injected.innerHTML;
      css = css.replace(/--page-width:\s*[^;]+;/, `--page-width: ${state.artboardWidth}px;`);
      css = css.replace(/--page-height:\s*[^;]+;/, `--page-height: ${state.artboardHeight}px;`);
      injected.innerHTML = css;
    }

    // Update live page wrappers
    const pages = dom.artboardsContainer.querySelectorAll('.page');
    pages.forEach(p => {
      p.style.width = `${state.artboardWidth}px`;
      p.style.height = `${state.artboardHeight}px`;
      p.style.maxWidth = `${state.artboardWidth}px`;
      p.style.maxHeight = `${state.artboardHeight}px`;
    });

    // Update inputs & badge
    if (dom.inpArtboardW) dom.inpArtboardW.value = state.artboardWidth;
    if (dom.inpArtboardH) dom.inpArtboardH.value = state.artboardHeight;
    if (dom.docBadge) dom.docBadge.textContent = `${presetName} • ${state.artboardWidth} × ${state.artboardHeight} px`;
    if (dom.artboardSizeBadge) dom.artboardSizeBadge.textContent = `${state.artboardWidth} × ${state.artboardHeight} px`;

    // Match preset dropdown if exact match
    if (dom.selArtboardPreset) {
      let matched = false;
      for (const [key, preset] of Object.entries(ARTBOARD_PRESETS)) {
        if (preset.width === state.artboardWidth && preset.height === state.artboardHeight) {
          dom.selArtboardPreset.value = key;
          matched = true;
          break;
        }
      }
      if (!matched) dom.selArtboardPreset.value = 'custom';
    }

    applyTransform();
    fitZoomToScreen();
    updateArtboardOverlayPosition();
    updatePrintGuidesPosition();

    if (recordHistory) {
      pushHistory(`Change Artboard Format (${state.artboardWidth}x${state.artboardHeight})`);
    }
  }

  function swapArtboardOrientation() {
    const temp = state.artboardWidth;
    setArtboardDimensions(state.artboardHeight, temp, 'Custom', true);
    showToast(`Swapped Orientation to ${state.artboardWidth > state.artboardHeight ? 'Landscape' : 'Portrait'}`, 'info');
  }

  function updateArtboardOverlayPosition() {
    if (!dom.artboardOverlay) return;

    if (state.currentTool !== 'artboard') {
      dom.artboardOverlay.style.display = 'none';
      return;
    }

    const activeWrapper = dom.artboardsContainer.querySelector(`.page-artboard-wrapper[data-board-id="${state.currentBoard}"]`) ||
                          dom.artboardsContainer.querySelector('.page-artboard-wrapper');
    if (!activeWrapper) {
      dom.artboardOverlay.style.display = 'none';
      return;
    }

    const page = activeWrapper.querySelector('.page');
    if (!page) return;

    const stageRect = dom.stage.getBoundingClientRect();
    const pageRect = page.getBoundingClientRect();
    const zoom = state.zoom;

    const left = (pageRect.left - stageRect.left) / zoom;
    const top = (pageRect.top - stageRect.top) / zoom;

    dom.artboardOverlay.style.display = 'block';
    dom.artboardOverlay.style.left = `${left}px`;
    dom.artboardOverlay.style.top = `${top}px`;
    dom.artboardOverlay.style.width = `${state.artboardWidth}px`;
    dom.artboardOverlay.style.height = `${state.artboardHeight}px`;

    if (dom.artboardSizeBadge) {
      dom.artboardSizeBadge.textContent = `${state.artboardWidth} × ${state.artboardHeight} px`;
    }
  }

  function createNewArtboard() {
    const totalBoards = dom.artboardsContainer.querySelectorAll('.page-artboard-wrapper').length;
    const newIdx = totalBoards + 1;
    const newId = `page-${newIdx}`;

    // Create wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'page-artboard-wrapper';
    wrapper.dataset.boardId = newId;

    const label = document.createElement('div');
    label.className = 'artboard-label-tag';
    label.textContent = `ARTBOARD 0${newIdx} // NEW BOARD`;
    wrapper.appendChild(label);

    // Create new page matching exact src/menu.html structure
    const newPage = document.createElement('section');
    newPage.className = 'page';
    newPage.id = newId;
    if (state.theme) newPage.dataset.theme = state.theme;
    newPage.style.width = `${state.artboardWidth}px`;
    newPage.style.height = `${state.artboardHeight}px`;
    newPage.innerHTML = `
      <header class="header-bar">
        <div class="brand-group">
          <img src="../assets/brand-logo.svg" alt="CRAVE LAB" class="brand-logo-img">
        </div>
        <div class="page-index-pill">0${newIdx} // 0${newIdx}</div>
      </header>

      <div class="category-banner">
        <div class="category-title-group">
          <h1 class="outlined-title">CHEF <span class="solid-accent">Specials</span></h1>
          <p class="category-subtitle">SEASONAL FLAVORS &bull; FRESH CRAFT</p>
        </div>
        <div class="category-badge-chip">LIMITED EDITION</div>
      </div>

      <div class="items-grid items-grid-3x2"></div>

      <footer class="menu-footer">
        <div class="footer-left">
          <span class="order-url">CRAVELAB.MENU // ORDER DIRECT</span>
          <span class="allergen-text">Crafted fresh daily &bull; Please inform us of any allergies</span>
        </div>
        <div class="footer-right">
          <div class="qr-badge">
            <img src="../assets/qr-code.svg" alt="QR">
            <div class="qr-label">SCAN TO<span>ORDER</span></div>
          </div>
        </div>
      </footer>
    `;

    wrapper.appendChild(newPage);
    dom.artboardsContainer.appendChild(wrapper);
    setupArtboardInteractions(newPage);

    // Add tab button
    const tabBtn = document.createElement('button');
    tabBtn.className = 'tab-btn';
    tabBtn.dataset.board = newId;
    tabBtn.innerHTML = `<span class="tab-num">0${newIdx}</span><span class="tab-label"> Board ${newIdx}</span>`;

    const allBtn = dom.artboardTabs.querySelector('.all-boards-btn');
    if (allBtn) dom.artboardTabs.insertBefore(tabBtn, allBtn);
    else dom.artboardTabs.appendChild(tabBtn);

    switchBoard(newId);
    pushHistory('Add New Artboard');
    showToast(`Created Artboard 0${newIdx}`, 'success');
  }

  function duplicateActiveArtboard() {
    const activeWrapper = dom.artboardsContainer.querySelector(`.page-artboard-wrapper[data-board-id="${state.currentBoard}"]`);
    if (!activeWrapper) return;

    const totalBoards = dom.artboardsContainer.querySelectorAll('.page-artboard-wrapper').length;
    const newIdx = totalBoards + 1;
    const newId = `page-${newIdx}`;

    const cloneWrapper = activeWrapper.cloneNode(true);
    cloneWrapper.dataset.boardId = newId;

    const label = cloneWrapper.querySelector('.artboard-label-tag');
    if (label) label.textContent = `ARTBOARD 0${newIdx} // COPY`;

    const page = cloneWrapper.querySelector('.page');
    if (page) {
      page.id = newId;
      const numPill = page.querySelector('.page-num-pill');
      if (numPill) numPill.textContent = `0${newIdx} // 0${newIdx}`;
    }

    dom.artboardsContainer.appendChild(cloneWrapper);
    if (page) setupArtboardInteractions(page);

    // Add tab button
    const tabBtn = document.createElement('button');
    tabBtn.className = 'tab-btn';
    tabBtn.dataset.board = newId;
    tabBtn.innerHTML = `<span class="tab-num">0${newIdx}</span><span class="tab-label"> Board ${newIdx}</span>`;

    const allBtn = dom.artboardTabs.querySelector('.all-boards-btn');
    if (allBtn) dom.artboardTabs.insertBefore(tabBtn, allBtn);
    else dom.artboardTabs.appendChild(tabBtn);

    switchBoard(newId);
    pushHistory('Duplicate Artboard');
    showToast(`Duplicated to Board 0${newIdx}`, 'success');
  }

  function deleteActiveArtboard() {
    const wrappers = dom.artboardsContainer.querySelectorAll('.page-artboard-wrapper');
    if (wrappers.length <= 1) {
      showToast('Cannot delete the last remaining artboard!', 'warn');
      return;
    }

    if (confirm(`Delete active artboard ${state.currentBoard}?`)) {
      const activeWrapper = dom.artboardsContainer.querySelector(`.page-artboard-wrapper[data-board-id="${state.currentBoard}"]`);
      const activeTab = dom.artboardTabs.querySelector(`.tab-btn[data-board="${state.currentBoard}"]`);

      if (activeWrapper) activeWrapper.remove();
      if (activeTab) activeTab.remove();

      // Switch to first remaining board
      const firstTab = dom.artboardTabs.querySelector('.tab-btn:not(.all-boards-btn)');
      if (firstTab) switchBoard(firstTab.dataset.board);

      pushHistory('Delete Artboard');
      showToast('Artboard deleted', 'warn');
    }
  }

  // ============================================================
  // HISTORY (UNDO / REDO)
  // ============================================================
  function pushHistory(actionName) {
    // Generate clean HTML snapshot
    const snapshot = serializeCurrentHtml();
    
    // Truncate redo tree if we made an edit in the past
    if (state.historyIndex < state.history.length - 1) {
      state.history = state.history.slice(0, state.historyIndex + 1);
    }

    state.history.push({ action: actionName, html: snapshot });
    if (state.history.length > state.maxHistory) {
      state.history.shift();
    }
    state.historyIndex = state.history.length - 1;

    updateHistoryButtons();
  }

  function updateHistoryButtons() {
    dom.btnUndo.disabled = state.historyIndex <= 0;
    dom.btnRedo.disabled = state.historyIndex >= state.history.length - 1;
  }

  dom.btnUndo.addEventListener('click', () => {
    if (state.historyIndex > 0) {
      state.historyIndex--;
      const entry = state.history[state.historyIndex];
      renderArtboardsFromHtml(entry.html);
      updateHistoryButtons();
      showToast(`Undo: ${entry.action}`, 'info');
    }
  });

  dom.btnRedo.addEventListener('click', () => {
    if (state.historyIndex < state.history.length - 1) {
      state.historyIndex++;
      const entry = state.history[state.historyIndex];
      renderArtboardsFromHtml(entry.html);
      updateHistoryButtons();
      showToast(`Redo: ${entry.action}`, 'info');
    }
  });

  // ============================================================
  // SERIALIZATION & BACKEND PERSISTENCE
  // ============================================================
  function serializeCurrentHtml() {
    const parser = new DOMParser();
    const doc = parser.parseFromString(state.rawTemplateHtml, 'text/html');

    const liveWrappers = dom.artboardsContainer.querySelectorAll('.page-artboard-wrapper');
    liveWrappers.forEach(wrapper => {
      const boardId = wrapper.dataset.boardId;
      const livePage = wrapper.querySelector('.page');
      let targetPage = doc.getElementById(boardId);

      if (livePage) {
        // Clone live page and strip editor-specific classes
        const cleanClone = livePage.cloneNode(true);
        cleanClone.classList.remove('active-selection', 'hover-target');
        cleanClone.querySelectorAll('.active-selection, .hover-target').forEach(el => {
          el.classList.remove('active-selection', 'hover-target');
        });
        cleanClone.querySelectorAll('[contenteditable]').forEach(el => {
          el.removeAttribute('contenteditable');
        });

        if (targetPage) {
          targetPage.replaceWith(cleanClone);
        } else {
          doc.body.appendChild(cleanClone);
        }
      }
    });

    // Update --page-width and --page-height in saved document styles
    let styleTag = doc.querySelector('style');
    if (styleTag) {
      let css = styleTag.textContent;
      css = css.replace(/--page-width:\s*[^;]+;/, `--page-width: ${state.artboardWidth}px;`);
      css = css.replace(/--page-height:\s*[^;]+;/, `--page-height: ${state.artboardHeight}px;`);
      css = css.replace(/@page\s*\{[^}]*size:\s*[^;]+;/i, `@page {\n      size: ${state.artboardWidth}px ${state.artboardHeight}px;`);
      styleTag.textContent = css;
    }

    if (state.theme) {
      doc.body.dataset.theme = state.theme;
    }

    return '<!DOCTYPE html>\n' + doc.documentElement.outerHTML;
  }

  async function saveHtmlDocument() {
    try {
      setStatus('SAVING...', 'busy');
      const cleanHtml = serializeCurrentHtml();
      
      const res = await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html: cleanHtml })
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Save failed');

      state.rawTemplateHtml = cleanHtml;
      setStatus('READY', 'ready');
      showToast('Saved to src/menu.html', 'success');
    } catch (err) {
      setStatus('ERROR', 'busy');
      showToast('Save Error: ' + err.message, 'error');
    }
  }

  async function compileProductionPdf() {
    try {
      await saveHtmlDocument();

      setStatus('COMPILING PDF...', 'busy');
      showToast('Launching Headless Playwright Verification...', 'info');

      const res = await fetch('/api/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.stderr || 'Compilation failed');

      setStatus('READY', 'ready');
      
      if (data.passed) {
        dom.auditBadge.textContent = 'VERIFIED PASS';
        dom.auditBadge.className = 'badge-audit-pass';
        showToast('PDF Compiled: All 5 Pages Passed Zero-Overflow!', 'success');
      } else {
        dom.auditBadge.textContent = 'AUDIT WARNING';
        dom.auditBadge.className = 'badge-audit-pass';
        dom.auditBadge.style.backgroundColor = 'rgba(255, 230, 0, 0.2)';
        dom.auditBadge.style.color = '#FFE600';
        showToast('PDF Compiled with minor layout notes', 'warn');
      }

      if (data.pdf && data.pdf.exists) {
        const kb = Math.round(data.pdf.size / 1024);
        dom.pdfLink.textContent = `Download (${kb} KB)`;
        dom.pdfLink.href = data.pdf.url + '?t=' + Date.now();
      }
    } catch (err) {
      setStatus('ERROR', 'busy');
      showToast('Compile Error: ' + err.message, 'error');
    }
  }

  // ============================================================
  // BRAND THEME ENGINE (5 PRINT-CALIBRATED PALETTES)
  // ============================================================
  function setupBrandThemeEngine() {
    if (!dom.themeSwatches) return;

    dom.themeSwatches.addEventListener('click', (e) => {
      const chip = e.target.closest('.theme-swatch-chip');
      if (!chip) return;
      const themeKey = chip.dataset.theme;
      applyBrandTheme(themeKey);
    });
  }

  function applyBrandTheme(themeKey) {
    state.theme = themeKey;
    const pages = dom.artboardsContainer.querySelectorAll('.page');
    pages.forEach(page => {
      page.dataset.theme = themeKey;
    });

    if (dom.themeSwatches) {
      dom.themeSwatches.querySelectorAll('.theme-swatch-chip').forEach(chip => {
        chip.classList.toggle('active', chip.dataset.theme === themeKey);
      });
    }

    pushHistory(`Apply Theme: ${themeKey}`);
    showToast(`Brand Theme: ${themeKey.replace('-', ' ').toUpperCase()}`, 'info');
  }

  // ============================================================
  // ADAPTIVE GRID COLUMN SWITCHER (1 / 2 / 3 COLUMNS)
  // ============================================================
  function setupGridColumnSwitcher() {
    if (!dom.segGridCols) return;

    dom.segGridCols.addEventListener('click', (e) => {
      const btn = e.target.closest('.seg-btn');
      if (!btn) return;
      const cols = parseInt(btn.dataset.cols, 10) || 2;
      setBoardColumnsForActive(cols);
    });
  }

  function setBoardColumnsForActive(cols) {
    const activeWrapper = dom.artboardsContainer.querySelector(`.page-artboard-wrapper[data-board-id="${state.currentBoard}"]`);
    if (!activeWrapper) return;
    const page = activeWrapper.querySelector('.page');
    if (!page) return;

    setBoardColumns(page, cols);
    updateGridColsUi(cols);
    pushHistory(`Set Grid to ${cols} Columns`);
    showToast(`Artboard Grid: ${cols} Column${cols > 1 ? 's' : ''}`, 'info');
  }

  function setBoardColumns(pageEl, cols) {
    const grid = pageEl.querySelector('.items-grid');
    if (!grid) return;
    grid.classList.remove('cols-1', 'cols-2', 'cols-3');
    grid.classList.add(`cols-${cols}`);
  }

  function updateGridColsUi(cols) {
    if (dom.segGridCols) {
      dom.segGridCols.querySelectorAll('.seg-btn').forEach(b => {
        b.classList.toggle('active', parseInt(b.dataset.cols, 10) === cols);
      });
    }
  }

  // ============================================================
  // LIVE SCANNABLE VECTOR QR CODE GENERATOR
  // ============================================================
  function setupQrCodeGenerator() {
    function updateAllQrBadges(url) {
      if (!url) return;
      state.footerQrUrl = url;
      const qrDataUri = window.CRAVE_QR && typeof window.CRAVE_QR.generateQrDataUri === 'function'
        ? window.CRAVE_QR.generateQrDataUri(url, { size: 104, fgColor: '#141414', bgColor: '#FFFFFF' })
        : null;

      if (!qrDataUri) return;

      const qrImages = dom.artboardsContainer.querySelectorAll('.qr-badge img');
      qrImages.forEach(img => {
        img.src = qrDataUri;
      });

      pushHistory('Update Footer QR Code');
      showToast(`Generated live vector QR for: ${url}`, 'success');
    }

    if (dom.btnUpdateQr && dom.inpFooterQrUrl) {
      dom.btnUpdateQr.addEventListener('click', () => {
        updateAllQrBadges(dom.inpFooterQrUrl.value.trim());
      });
      dom.inpFooterQrUrl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          updateAllQrBadges(dom.inpFooterQrUrl.value.trim());
        }
      });
    }
  }

  // ============================================================
  // UNIVERSAL EXPORT STUDIO MODAL (8 FORMATS + PRE-PRESS)
  // ============================================================
  function setupExportModal() {
    if (!dom.btnOpenExportModal) return;

    function openExportModal() {
      if (dom.exportModalBackdrop) {
        dom.exportModalBackdrop.style.display = 'flex';
        if (dom.exportActiveBoardNum) {
          const num = state.currentBoard ? state.currentBoard.replace('page-', '') : '01';
          dom.exportActiveBoardNum.textContent = num.padStart(2, '0');
        }
        updateExportOptionsUI();
      }
    }

    function closeExportModal() {
      if (dom.exportModalBackdrop) {
        dom.exportModalBackdrop.style.display = 'none';
      }
    }

    function updateExportOptionsUI() {
      const fmt = state.exportFormat;
      const isRaster = ['png', 'jpg', 'jpeg', 'webp'].includes(fmt);
      const isVectorPrint = ['pdf', 'eps', 'svg'].includes(fmt);
      const isAlpha = ['png', 'webp', 'svg'].includes(fmt);

      if (dom.optDpiScale) {
        dom.optDpiScale.style.display = isRaster ? 'flex' : 'none';
      }
      if (dom.chkCropMarksRow) {
        dom.chkCropMarksRow.style.display = isVectorPrint ? 'flex' : 'none';
      }
      if (dom.chkTransparentRow) {
        dom.chkTransparentRow.style.display = isAlpha ? 'flex' : 'none';
      }

      const labels = {
        pdf: 'Download Vector PDF',
        png: `Download PNG (${state.exportScale}x / ${state.exportScale * 96} DPI)`,
        jpg: `Download JPEG (${state.exportQuality}%)`,
        webp: `Download WebP (${state.exportQuality}%)`,
        svg: 'Download Scalable SVG',
        eps: 'Download PostScript EPS',
        html: 'Download Standalone HTML',
        json: 'Download Menu Data JSON'
      };
      if (dom.btnExecuteExportText) {
        dom.btnExecuteExportText.textContent = labels[fmt] || `Download ${fmt.toUpperCase()}`;
      }
    }

    // Format card selection
    if (dom.formatCards) {
      dom.formatCards.addEventListener('click', (e) => {
        const card = e.target.closest('.format-card');
        if (!card) return;
        dom.formatCards.querySelectorAll('.format-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        state.exportFormat = card.dataset.format || 'pdf';
        updateExportOptionsUI();
      });
    }

    // Scope control
    if (dom.segExportScope) {
      dom.segExportScope.addEventListener('click', (e) => {
        const btn = e.target.closest('.seg-btn');
        if (!btn) return;
        dom.segExportScope.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.exportScope = btn.dataset.scope || 'current';
      });
    }

    // Scale control
    if (dom.segExportScale) {
      dom.segExportScale.addEventListener('click', (e) => {
        const btn = e.target.closest('.seg-btn');
        if (!btn) return;
        dom.segExportScale.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.exportScale = parseInt(btn.dataset.scale, 10) || 2;
        updateExportOptionsUI();
      });
    }

    // Toggles
    if (dom.chkCropMarks) {
      dom.chkCropMarks.addEventListener('change', () => {
        state.exportCropMarks = dom.chkCropMarks.checked;
      });
    }
    if (dom.chkTransparent) {
      dom.chkTransparent.addEventListener('change', () => {
        state.exportTransparent = dom.chkTransparent.checked;
      });
    }

    // Modal buttons
    dom.btnOpenExportModal.addEventListener('click', openExportModal);
    if (dom.btnCloseExportModal) dom.btnCloseExportModal.addEventListener('click', closeExportModal);
    if (dom.btnCancelExport) dom.btnCancelExport.addEventListener('click', closeExportModal);
    if (dom.exportModalBackdrop) {
      dom.exportModalBackdrop.addEventListener('click', (e) => {
        if (e.target === dom.exportModalBackdrop) closeExportModal();
      });
    }

    // Execute Export Action
    if (dom.btnExecuteExport) {
      dom.btnExecuteExport.addEventListener('click', async () => {
        try {
          if (dom.exportSpinner) dom.exportSpinner.style.display = 'inline-block';
          dom.btnExecuteExport.disabled = true;
          setStatus('EXPORTING...', 'busy');

          const serializedHtml = serializeCurrentHtml();
          const payload = {
            html: serializedHtml,
            format: state.exportFormat,
            scope: state.exportScope,
            boardId: state.currentBoard || 'page-1',
            scale: state.exportScale,
            quality: state.exportQuality,
            cropMarks: state.exportCropMarks,
            transparent: state.exportTransparent
          };

          const res = await fetch('/api/export', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          }).catch(err => {
            console.warn('[EXPORT] /api/export endpoint unreachable, trying client-side export:', err);
            return null;
          });

          if (res && res.ok) {
            const blob = await res.blob();
            const dispHeader = res.headers.get('Content-Disposition') || '';
            const matchFilename = dispHeader.match(/filename="?([^";]+)"?/);
            const filename = matchFilename ? matchFilename[1] : `crave-lab-menu.${state.exportFormat}`;

            // Trigger browser download
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);

            setStatus('READY', 'ready');
            showToast(`Exported ${filename} (${Math.round(blob.size / 1024)} KB)`, 'success');
            closeExportModal();
            return;
          }

          // Client-side fallback for static preview / GitHub Pages
          if (state.exportFormat === 'html') {
            const blob = new Blob([serializedHtml], { type: 'text/html;charset=utf-8' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'crave-lab-menu.html';
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            showToast('Exported standalone HTML (Client-Side)', 'success');
            closeExportModal();
            return;
          }

          if (state.exportFormat === 'json') {
            const menuData = {
              title: 'CRAVE LAB Menu',
              theme: state.theme,
              columns: state.gridCols,
              artboards: Array.from(document.querySelectorAll('.page-artboard-wrapper')).map((bw, idx) => ({
                id: bw.dataset.boardId || `page-${idx+1}`,
                title: bw.querySelector('.category-header-title')?.textContent?.trim() || '',
                subtitle: bw.querySelector('.category-subtitle')?.textContent?.trim() || '',
                items: Array.from(bw.querySelectorAll('.menu-card')).map(mc => ({
                  title: mc.querySelector('.item-title')?.textContent?.trim() || '',
                  desc: mc.querySelector('.item-desc')?.textContent?.trim() || '',
                  price: mc.querySelector('.price-val')?.textContent?.trim() || ''
                }))
              }))
            };
            const blob = new Blob([JSON.stringify(menuData, null, 2)], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'crave-lab-menu.json';
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            showToast('Exported structured JSON (Client-Side)', 'success');
            closeExportModal();
            return;
          }

          if (state.exportFormat === 'pdf') {
            window.print();
            showToast('Print dialog opened. (For full 300 DPI vector PDF + 3mm bleed, run locally via npm start)', 'info');
            closeExportModal();
            return;
          }

          throw new Error('This format requires the local Node server. Run "npm start" locally for 300 DPI PNG, EPS, and Vector PDF with 3mm bleed!');
        } catch (err) {
          setStatus('ERROR', 'busy');
          showToast(err.message, 'error');
          console.error(err);
        } finally {
          if (dom.exportSpinner) dom.exportSpinner.style.display = 'none';
          dom.btnExecuteExport.disabled = false;
        }
      });
    }

    // JSON Import Trigger
    if (dom.btnTriggerImportJson && dom.inpImportJson) {
      dom.btnTriggerImportJson.addEventListener('click', () => {
        dom.inpImportJson.click();
      });

      dom.inpImportJson.addEventListener('change', async (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        try {
          const text = await file.text();
          const jsonData = JSON.parse(text);
          importMenuFromJson(jsonData);
          closeExportModal();
          showToast(`Imported menu from ${file.name}`, 'success');
        } catch (err) {
          showToast('Failed to import JSON: ' + err.message, 'error');
        }
      });
    }
  }

  function importMenuFromJson(data) {
    if (!data || !data.boards || !Array.isArray(data.boards)) {
      throw new Error('Invalid JSON: missing boards array');
    }

    if (data.theme) {
      applyBrandTheme(data.theme);
    }

    data.boards.forEach(b => {
      const wrapper = dom.artboardsContainer.querySelector(`.page-artboard-wrapper[data-board-id="${b.id}"]`);
      if (!wrapper) return;
      const page = wrapper.querySelector('.page');
      if (!page) return;

      if (b.categoryTitle) {
        const h1 = page.querySelector('.outlined-title');
        if (h1) h1.innerHTML = b.categoryTitle;
      }
      if (b.categorySubtitle) {
        const sub = page.querySelector('.category-subtitle');
        if (sub) sub.textContent = b.categorySubtitle;
      }
      if (b.columns) {
        setBoardColumns(page, b.columns);
      }

      if (b.items && Array.isArray(b.items)) {
        const grid = page.querySelector('.items-grid');
        if (grid) {
          const cards = grid.querySelectorAll('.menu-card');
          b.items.forEach((itemData, idx) => {
            if (cards[idx]) {
              const card = cards[idx];
              const titleEl = card.querySelector('.item-title');
              if (titleEl && itemData.title) titleEl.textContent = itemData.title;
              const descEl = card.querySelector('.item-desc');
              if (descEl && itemData.desc) descEl.textContent = itemData.desc;
              const priceEl = card.querySelector('.price-pill');
              if (priceEl && itemData.price) priceEl.textContent = itemData.price;
              const oldPriceEl = card.querySelector('.old-price');
              if (oldPriceEl && itemData.oldPrice) oldPriceEl.textContent = itemData.oldPrice;
            }
          });
        }
      }
    });

    pushHistory('Import Menu from JSON');
  }

  // ============================================================
  // SHORTCUTS & HELPERS
  // ============================================================
  function setupShortcuts() {
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
        return;
      }

      const key = e.key.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && key === 's') {
        e.preventDefault();
        saveHtmlDocument();
      } else if ((e.ctrlKey || e.metaKey) && key === 'e') {
        e.preventDefault();
        if (dom.btnOpenExportModal) dom.btnOpenExportModal.click();
      } else if ((e.ctrlKey || e.metaKey) && key === 'z') {
        e.preventDefault();
        dom.btnUndo.click();
      } else if ((e.ctrlKey || e.metaKey) && key === 'y') {
        e.preventDefault();
        dom.btnRedo.click();
      } else if (key === 'v') setTool('select');
      else if (key === 't') setTool('text');
      else if (key === 'p') setTool('price');
      else if (key === 'b') setTool('badge');
      else if (key === 'h') setTool('hand');
      else if (key === 'z') setTool('zoom');
      else if (key === 'g') dom.toggleGuidesBtn.click();
      else if (key === 'i') toggleInspector();
      else if ((e.shiftKey && key === 'o') || key === 'o') {
        e.preventDefault();
        setTool('artboard');
      }
      else if (e.key === 'Escape') {
        if (dom.exportModalBackdrop && dom.exportModalBackdrop.style.display !== 'none') {
          dom.exportModalBackdrop.style.display = 'none';
        } else {
          closeInspectorDrawer();
          clearSelection();
        }
      }
      else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (state.selectedCard) deleteSelectedCard();
      }
    });
  }

  function setStatus(text, type = 'ready') {
    dom.statusPill.textContent = text;
    dom.statusPill.className = `status-pill status-${type}`;
  }

  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    dom.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  // Run app on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
