const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// CRC32 implementation for PNG chunks
const crcTable = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[i] = c >>> 0;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcPayload = Buffer.concat([typeBuf, data]);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(crcPayload), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function generatePng(width, height) {
  // RGBA buffer
  const stride = width * 4 + 1; // 1 filter byte per line
  const rawData = Buffer.alloc(stride * height);

  // Center (cx, cy), radius
  const cx = width / 2;
  const cy = height / 2;
  const cornerRadius = width * 0.23;

  // Helper to check if point (x, y) is inside rounded rectangle
  function isInRoundedRect(x, y, w, h, r) {
    const rx = Math.max(r, Math.min(w - r, x));
    const ry = Math.max(r, Math.min(h - r, y));
    const dx = x - rx;
    const dy = y - ry;
    return (dx * dx + dy * dy) <= (r * r);
  }

  // Polygon point in polygon for lightning bolt (normalized 0..1 coordinates)
  // [ [0.56, 0.12], [0.28, 0.52], [0.51, 0.52], [0.44, 0.88], [0.72, 0.48], [0.49, 0.48] ]
  const boltPoly = [
    [0.56, 0.11],
    [0.27, 0.53],
    [0.51, 0.53],
    [0.44, 0.89],
    [0.73, 0.47],
    [0.49, 0.47]
  ];

  function pointInPolygon(px, py, poly) {
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const xi = poly[i][0], yi = poly[i][1];
      const xj = poly[j][0], yj = poly[j][1];
      const intersect = ((yi > py) !== (yj > py)) &&
        (px < (xj - xi) * (py - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  }

  // Padding
  const pad = Math.max(1, Math.round(width * 0.05));
  const rectW = width - pad * 2;
  const rectH = height - pad * 2;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * stride;
    rawData[rowOffset] = 0; // Filter type: None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;

      const normX = (x - pad) / rectW;
      const normY = (y - pad) / rectH;

      if (x >= pad && x < width - pad && y >= pad && y < height - pad &&
          isInRoundedRect(x - pad, y - pad, rectW, rectH, cornerRadius)) {

        // Check if inside lightning bolt
        if (pointInPolygon(normX, normY, boltPoly)) {
          // Pure white bolt with slight cyan-white gradient
          rawData[pxOffset] = 255;
          rawData[pxOffset + 1] = 255;
          rawData[pxOffset + 2] = 255;
          rawData[pxOffset + 3] = 255;
        } else {
          // Indigo (#4f46e5) to Cyan (#06b6d4) linear diagonal gradient
          const t = (x + y) / (width + height);
          const r = Math.round(79 * (1 - t) + 6 * t);
          const g = Math.round(70 * (1 - t) + 182 * t);
          const b = Math.round(229 * (1 - t) + 212 * t);

          rawData[pxOffset] = r;
          rawData[pxOffset + 1] = g;
          rawData[pxOffset + 2] = b;
          rawData[pxOffset + 3] = 255;
        }
      } else {
        // Transparent outside
        rawData[pxOffset] = 0;
        rawData[pxOffset + 1] = 0;
        rawData[pxOffset + 2] = 0;
        rawData[pxOffset + 3] = 0;
      }
    }
  }

  // PNG Signature
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // Bit depth: 8
  ihdr[9] = 6; // Color type: RGBA (6)
  ihdr[10] = 0; // Compression: Deflate (0)
  ihdr[11] = 0; // Filter: Standard (0)
  ihdr[12] = 0; // Interlace: None (0)

  const ihdrChunk = createChunk('IHDR', ihdr);
  const idatChunk = createChunk('IDAT', zlib.deflateSync(rawData));
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

function createIco(pngBuffers) {
  // ICO header: 6 bytes
  const numImages = pngBuffers.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // 1 = ICO
  header.writeUInt16LE(numImages, 4); // Image count

  const dirEntries = [];
  let offset = 6 + (numImages * 16);

  for (const { width, height, buffer } of pngBuffers) {
    const entry = Buffer.alloc(16);
    entry[0] = width >= 256 ? 0 : width;
    entry[1] = height >= 256 ? 0 : height;
    entry[2] = 0; // Palette colors
    entry[3] = 0; // Reserved
    entry.writeUInt16LE(1, 4); // Color planes
    entry.writeUInt16LE(32, 6); // Bits per pixel
    entry.writeUInt32LE(buffer.length, 8); // Size
    entry.writeUInt32LE(offset, 12); // Offset

    dirEntries.push(entry);
    offset += buffer.length;
  }

  return Buffer.concat([header, ...dirEntries, ...pngBuffers.map(p => p.buffer)]);
}

// Generate files
const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

const png16 = generatePng(16, 16);
const png32 = generatePng(32, 32);
const png48 = generatePng(48, 48);
const png180 = generatePng(180, 180);
const png512 = generatePng(512, 512);

fs.writeFileSync(path.join(publicDir, 'favicon-16x16.png'), png16);
fs.writeFileSync(path.join(publicDir, 'favicon-32x32.png'), png32);
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), png180);
fs.writeFileSync(path.join(publicDir, 'android-chrome-192x192.png'), generatePng(192, 192));
fs.writeFileSync(path.join(publicDir, 'android-chrome-512x512.png'), png512);

const icoBuf = createIco([
  { width: 16, height: 16, buffer: png16 },
  { width: 32, height: 32, buffer: png32 },
  { width: 48, height: 48, buffer: png48 }
]);
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuf);

console.log('✅ Generated PNG and ICO favicon files successfully in public/');
