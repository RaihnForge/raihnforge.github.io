#!/usr/bin/env node
// Templates the Mecromage placeholder for other buckets.
// Usage: node build-placeholder.js <out-path> <DISPLAY NAME> <accent-hex> <subline>
const fs = require('fs');
const path = require('path');

const [, , outPath, displayName, accentHex, subline = 'DEVLOG · MEDIA RECOVERY PENDING'] = process.argv;
if (!outPath || !displayName || !accentHex) {
  console.error('usage: build-placeholder.js <out-path> <DISPLAY NAME> <#hex> [subline]');
  process.exit(1);
}

const lighten = (hex) => {
  const n = hex.replace('#', '');
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  const mix = (c) => Math.min(255, Math.round(c + (255 - c) * 0.25));
  return `#${[mix(r), mix(g), mix(b)].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
};

const accentBright = lighten(accentHex);
const fontSize = displayName.length > 14 ? 36 : displayName.length > 10 ? 42 : 48;
const letterSpacing = displayName.length > 14 ? 4 : 8;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${displayName} — ${subline.toLowerCase()}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1F1813"/>
      <stop offset="100%" stop-color="#0C0A09"/>
    </linearGradient>
    <radialGradient id="forge-glow" cx="50%" cy="55%" r="55%">
      <stop offset="0%" stop-color="${accentHex}" stop-opacity="0.22"/>
      <stop offset="60%" stop-color="${accentHex}" stop-opacity="0.06"/>
      <stop offset="100%" stop-color="${accentHex}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="cool-glow" cx="85%" cy="15%" r="40%">
      <stop offset="0%" stop-color="#7FB7D4" stop-opacity="0.10"/>
      <stop offset="100%" stop-color="#7FB7D4" stop-opacity="0"/>
    </radialGradient>
    <pattern id="grid" width="46" height="46" patternUnits="userSpaceOnUse">
      <path d="M46 0 L0 0 0 46" fill="none" stroke="${accentHex}" stroke-opacity="0.06" stroke-width="1"/>
    </pattern>
  </defs>

  <rect width="800" height="450" fill="url(#bg)"/>
  <rect width="800" height="450" fill="url(#grid)"/>
  <rect width="800" height="450" fill="url(#forge-glow)"/>
  <rect width="800" height="450" fill="url(#cool-glow)"/>

  <g stroke="${accentHex}" stroke-opacity="0.28" fill="none">
    <line x1="60" y1="225" x2="280" y2="225" stroke-dasharray="2 6"/>
    <line x1="520" y1="225" x2="740" y2="225" stroke-dasharray="2 6"/>
  </g>

  <text x="400" y="208" text-anchor="middle"
        font-family="Cinzel, Georgia, 'Times New Roman', serif"
        font-size="${fontSize}" font-weight="700"
        fill="#E8DFD2" letter-spacing="${letterSpacing}">${displayName.toUpperCase()}</text>

  <text x="400" y="246" text-anchor="middle"
        font-family="'JetBrains Mono', 'Courier New', monospace"
        font-size="12" fill="#A99E8E" letter-spacing="5">${subline}</text>

  <g transform="translate(400 312)">
    <line x1="-90" y1="0" x2="-26" y2="0" stroke="${accentHex}" stroke-opacity="0.55"/>
    <line x1="26" y1="0" x2="90" y2="0" stroke="${accentHex}" stroke-opacity="0.55"/>
    <text x="0" y="4" text-anchor="middle"
          font-family="'JetBrains Mono', 'Courier New', monospace"
          font-size="11" fill="${accentBright}" letter-spacing="4">RAIHNFORGE</text>
  </g>
</svg>
`;

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, svg);
console.log(`wrote ${outPath}`);
