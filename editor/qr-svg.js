/**
 * CRAVE LAB // Zero-Dependency ISO/IEC 18004 QR Code SVG Generator
 * Pure JavaScript Byte-Mode QR Code Generator (Versions 1-6, ECC Level M)
 * Generates lightweight, crisp, scalable vector SVG strings for print & screen.
 */

(function (global) {
  'use strict';

  // Galois Field GF(256) Math for Reed-Solomon Error Correction
  const GF256 = (function () {
    const exp = new Uint8Array(512);
    const log = new Uint8Array(256);
    let x = 1;
    for (let i = 0; i < 255; i++) {
      exp[i] = x;
      log[x] = i;
      x <<= 1;
      if (x & 256) x ^= 0x11d;
    }
    for (let i = 255; i < 512; i++) {
      exp[i] = exp[i - 255];
    }
    return {
      mul: (a, b) => (a === 0 || b === 0 ? 0 : exp[log[a] + log[b]]),
      exp,
      log
    };
  })();

  function polyMul(p1, p2) {
    const res = new Uint8Array(p1.length + p2.length - 1);
    for (let i = 0; i < p1.length; i++) {
      for (let j = 0; j < p2.length; j++) {
        res[i + j] ^= GF256.mul(p1[i], p2[j]);
      }
    }
    return res;
  }

  function polyDiv(dividend, divisor) {
    let remainder = new Uint8Array(dividend);
    for (let i = 0; i < dividend.length - divisor.length + 1; i++) {
      const coef = remainder[i];
      if (coef !== 0) {
        for (let j = 0; j < divisor.length; j++) {
          remainder[i + j] ^= GF256.mul(divisor[j], coef);
        }
      }
    }
    return remainder.slice(dividend.length - divisor.length + 1);
  }

  function getGeneratorPoly(degree) {
    let poly = new Uint8Array([1]);
    for (let i = 0; i < degree; i++) {
      poly = polyMul(poly, new Uint8Array([1, GF256.exp[i]]));
    }
    return poly;
  }

  // Version specs for Byte mode, Error Correction Level M
  const VERSION_CAPACITIES_M = [
    { version: 1, totalCodewords: 26, ecCodewords: 10, dataCodewords: 16, maxBytes: 14 },
    { version: 2, totalCodewords: 44, ecCodewords: 16, dataCodewords: 28, maxBytes: 26 },
    { version: 3, totalCodewords: 70, ecCodewords: 26, dataCodewords: 44, maxBytes: 42 },
    { version: 4, totalCodewords: 100, ecCodewords: 36, dataCodewords: 64, maxBytes: 62 },
    { version: 5, totalCodewords: 134, ecCodewords: 48, dataCodewords: 86, maxBytes: 84 },
    { version: 6, totalCodewords: 172, ecCodewords: 64, dataCodewords: 108, maxBytes: 106 }
  ];

  // Alignment pattern locations
  const ALIGNMENT_COORDS = {
    2: [6, 18],
    3: [6, 22],
    4: [6, 26],
    5: [6, 30],
    6: [6, 34]
  };

  class BitBuffer {
    constructor() {
      this.bits = [];
    }
    put(val, length) {
      for (let i = length - 1; i >= 0; i--) {
        this.bits.push((val >>> i) & 1);
      }
    }
    getBytes() {
      const bytes = [];
      for (let i = 0; i < this.bits.length; i += 8) {
        let byte = 0;
        for (let j = 0; j < 8; j++) {
          byte = (byte << 1) | (this.bits[i + j] || 0);
        }
        bytes.push(byte);
      }
      return new Uint8Array(bytes);
    }
  }

  function encodeData(text, spec) {
    const utf8Encoder = typeof TextEncoder !== 'undefined' ? new TextEncoder() : { encode: str => Buffer.from(str) };
    const dataBytes = utf8Encoder.encode(text);
    if (dataBytes.length > spec.maxBytes) {
      throw new Error(`Data too long for QR Version ${spec.version} Level M (max ${spec.maxBytes} bytes)`);
    }

    const bb = new BitBuffer();
    bb.put(0b0100, 4);
    bb.put(dataBytes.length, 8);
    for (let i = 0; i < dataBytes.length; i++) {
      bb.put(dataBytes[i], 8);
    }
    const totalDataBits = spec.dataCodewords * 8;
    const termLength = Math.min(4, totalDataBits - bb.bits.length);
    bb.put(0, termLength);
    if (bb.bits.length % 8 !== 0) {
      bb.put(0, 8 - (bb.bits.length % 8));
    }
    let padToggle = false;
    while (bb.bits.length < totalDataBits) {
      bb.put(padToggle ? 0x11 : 0xec, 8);
      padToggle = !padToggle;
    }

    const dataCodewords = bb.getBytes();
    const genPoly = getGeneratorPoly(spec.ecCodewords);
    const paddedData = new Uint8Array(spec.dataCodewords + spec.ecCodewords);
    paddedData.set(dataCodewords, 0);

    const ecBytes = polyDiv(paddedData, genPoly);

    const finalCodewords = new Uint8Array(spec.totalCodewords);
    finalCodewords.set(dataCodewords, 0);
    finalCodewords.set(ecBytes, spec.dataCodewords);
    return finalCodewords;
  }

  function createMatrix(version) {
    const size = 17 + 4 * version;
    const matrix = [];
    const isReserved = [];
    for (let r = 0; r < size; r++) {
      matrix.push(new Uint8Array(size));
      isReserved.push(new Uint8Array(size));
    }

    function setModule(r, c, val, reserved = true) {
      if (r >= 0 && r < size && c >= 0 && c < size) {
        matrix[r][c] = val ? 1 : 0;
        if (reserved) isReserved[r][c] = 1;
      }
    }

    function addFinder(top, left) {
      for (let r = -1; r <= 7; r++) {
        for (let c = -1; c <= 7; c++) {
          const row = top + r;
          const col = left + c;
          if (row < 0 || row >= size || col < 0 || col >= size) continue;
          if (
            (r >= 0 && r <= 6 && (c === 0 || c === 6)) ||
            (c >= 0 && c <= 6 && (r === 0 || r === 6)) ||
            (r >= 2 && r <= 4 && c >= 2 && c <= 4)
          ) {
            setModule(row, col, 1);
          } else {
            setModule(row, col, 0);
          }
        }
      }
    }

    addFinder(0, 0);
    addFinder(0, size - 7);
    addFinder(size - 7, 0);

    for (let i = 8; i < size - 8; i++) {
      const bit = i % 2 === 0 ? 1 : 0;
      setModule(6, i, bit);
      setModule(i, 6, bit);
    }

    setModule(4 * version + 9, 8, 1);

    if (ALIGNMENT_COORDS[version]) {
      const coords = ALIGNMENT_COORDS[version];
      for (let i = 0; i < coords.length; i++) {
        for (let j = 0; j < coords.length; j++) {
          const r = coords[i];
          const c = coords[j];
          if (isReserved[r][c]) continue;
          for (let dr = -2; dr <= 2; dr++) {
            for (let dc = -2; dc <= 2; dc++) {
              if (Math.abs(dr) === 2 || Math.abs(dc) === 2 || (dr === 0 && dc === 0)) {
                setModule(r + dr, c + dc, 1);
              } else {
                setModule(r + dr, c + dc, 0);
              }
            }
          }
        }
      }
    }

    for (let i = 0; i < 9; i++) {
      if (i !== 6) {
        setModule(8, i, 0);
        setModule(i, 8, 0);
      }
    }
    for (let i = 0; i < 8; i++) {
      setModule(8, size - 1 - i, 0);
      setModule(size - 1 - i, 8, 0);
    }

    return { size, matrix, isReserved, setModule };
  }

  function applyMask0(r, c) {
    return (r + c) % 2 === 0;
  }

  const FORMAT_BITS = [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0];

  function placeFormatInfo(qr) {
    const size = qr.size;
    for (let i = 0; i < 15; i++) {
      const bit = FORMAT_BITS[i];
      if (i < 6) {
        qr.matrix[8][i] = bit;
      } else if (i === 6) {
        qr.matrix[8][7] = bit;
      } else if (i === 7) {
        qr.matrix[8][8] = bit;
      } else if (i === 8) {
        qr.matrix[7][8] = bit;
      } else {
        qr.matrix[14 - i][8] = bit;
      }

      if (i < 8) {
        qr.matrix[size - 1 - i][8] = bit;
      } else {
        qr.matrix[8][size - 15 + i] = bit;
      }
    }
  }

  function placeDataCodewords(qr, codewords) {
    const size = qr.size;
    let bitIdx = 0;
    const totalBits = codewords.length * 8;

    let dirUp = true;
    for (let col = size - 1; col > 0; col -= 2) {
      if (col === 6) col--;

      const rows = [];
      if (dirUp) {
        for (let r = size - 1; r >= 0; r--) rows.push(r);
      } else {
        for (let r = 0; r < size; r++) rows.push(r);
      }
      dirUp = !dirUp;

      for (const row of rows) {
        for (let c = 0; c < 2; c++) {
          const currentCol = col - c;
          if (qr.isReserved[row][currentCol]) continue;

          let bit = 0;
          if (bitIdx < totalBits) {
            const byte = codewords[Math.floor(bitIdx / 8)];
            const bitOffset = 7 - (bitIdx % 8);
            bit = (byte >>> bitOffset) & 1;
            bitIdx++;
          }

          if (applyMask0(row, currentCol)) {
            bit ^= 1;
          }

          qr.matrix[row][currentCol] = bit;
        }
      }
    }
  }

  function buildQrMatrix(text) {
    const textLen = (typeof TextEncoder !== 'undefined' ? new TextEncoder() : { encode: s => Buffer.from(s) }).encode(text).length;
    let chosenSpec = null;
    for (const spec of VERSION_CAPACITIES_M) {
      if (textLen <= spec.maxBytes) {
        chosenSpec = spec;
        break;
      }
    }
    if (!chosenSpec) {
      throw new Error(`Text too long for built-in QR generator (${textLen} bytes, max 106)`);
    }

    const codewords = encodeData(text, chosenSpec);
    const qr = createMatrix(chosenSpec.version);
    placeDataCodewords(qr, codewords);
    placeFormatInfo(qr);
    return qr;
  }

  function generateQrSvg(text, options = {}) {
    const {
      size = 120,
      fgColor = '#141414',
      bgColor = '#FFFFFF',
      margin = 2
    } = options;

    const qr = buildQrMatrix(text);
    const modCount = qr.size;
    const totalModules = modCount + margin * 2;
    const cellSize = 1;

    let pathD = '';
    for (let r = 0; r < modCount; r++) {
      for (let c = 0; c < modCount; c++) {
        if (qr.matrix[r][c] === 1) {
          const x = (c + margin) * cellSize;
          const y = (r + margin) * cellSize;
          pathD += `M${x},${y}h${cellSize}v${cellSize}h-${cellSize}z `;
        }
      }
    }

    const viewBoxSize = totalModules * cellSize;
    const bgRect = bgColor ? `<rect width="${viewBoxSize}" height="${viewBoxSize}" fill="${bgColor}" rx="2"/>` : '';

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${viewBoxSize} ${viewBoxSize}" shape-rendering="crispEdges">
  ${bgRect}
  <path d="${pathD.trim()}" fill="${fgColor}"/>
</svg>`;
  }

  function generateQrDataUri(text, options = {}) {
    const svg = generateQrSvg(text, options);
    if (typeof btoa !== 'undefined') {
      return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
    } else {
      return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
    }
  }

  const api = {
    generateQrSvg,
    generateQrDataUri,
    buildQrMatrix
  };

  // Expose on globalThis / window for browser and Node
  global.CRAVE_QR = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
