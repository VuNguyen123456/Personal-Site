import { readFileSync, writeFileSync } from "fs";

const S = 4;
const H = 48;
/** Seamless horizontal tile — must match CSS background-size width */
const TILE_W = 200;
const WAVE_CYCLES = 4;
const BASE_ROWS = 9;
const WAVE_AMP = 3.5;

const C = {
  glow: "#8a3a28",
  ember: "#bd543a",
  flame: "#e85a2a",
  hot: "#ffc878",
  core: "#fff7b8",
  white: "#fffef0",
  bed: "#d44a2a",
};

function rects(cells) {
  return cells
    .map(([x, y, fill]) => `<rect x='${x}' y='${y}' width='${S}' height='${S}' fill='${fill}'/>`)
    .join("");
}

function colorAtRow(row, height) {
  const t = row / Math.max(1, height - 1);
  if (t < 0.2) return C.glow;
  if (t < 0.4) return C.ember;
  if (t < 0.6) return C.flame;
  if (t < 0.78) return C.hot;
  if (t < 0.92) return C.core;
  return C.white;
}

/** Wavy flame height (rows from bottom); integer cycles → seamless tile */
function waveRowsAt(x) {
  const t = (x / TILE_W) * Math.PI * 2 * WAVE_CYCLES;
  const w =
    BASE_ROWS +
    Math.sin(t) * WAVE_AMP +
    Math.sin(t * 2.15 + 0.8) * 1.25;
  return Math.max(6, Math.min(12, Math.round(w)));
}

function emberBed() {
  const cells = [];
  for (let x = 0; x < TILE_W; x += S) {
    const n = (x / S) % 7;
    cells.push([x, H - S, n < 2 ? C.glow : C.ember]);
    if (n % 2 === 0) cells.push([x, H - 2 * S, C.bed]);
    if (n % 3 !== 2) cells.push([x, H - 3 * S, n < 4 ? C.ember : C.flame]);
  }
  return rects(cells);
}

/** Column flames — bottom row always at y = H - S, height follows sine wave */
function waveFlameColumns() {
  const cells = [];
  for (let x = 0; x < TILE_W; x += S) {
    const height = waveRowsAt(x);
    const lean = Math.round(Math.sin((x / TILE_W) * Math.PI * 6) * 0.5);
    for (let row = 0; row < height; row++) {
      const y = H - (row + 1) * S;
      const fill = colorAtRow(row, height);
      const px = x + (row >= height - 2 ? lean : 0);
      cells.push([px, y, fill]);
      if (row === height - 1 && height >= 8) {
        cells.push([px + S, y, fill === C.white ? C.core : C.white]);
      }
    }
  }
  return rects(cells);
}

function staticSpark(i) {
  const x = ((i * 23 + 7) % (TILE_W / S)) * S;
  const rows = waveRowsAt(x);
  const y = H - (rows + 1) * S;
  const fill = i % 3 === 0 ? C.white : i % 3 === 1 ? C.core : C.hot;
  return `<rect x='${x}' y='${Math.max(0, y)}' width='${S}' height='${S}' fill='${fill}' opacity='0.9'/>`;
}

function buildSvg() {
  const bed = emberBed();
  const flames = waveFlameColumns();
  const sparks = Array.from({ length: 10 }, (_, i) => staticSpark(i)).join("");
  return `<svg xmlns='http://www.w3.org/2000/svg' width='${TILE_W}' height='${H}' viewBox='0 0 ${TILE_W} ${H}' shape-rendering='crispEdges'>${bed}${flames}${sparks}</svg>`;
}

function enc(svg) {
  return encodeURIComponent(svg.replace(/\s+/g, " ").trim());
}

const tileEnc = enc(buildSvg());

const css = `/* Flareon — wavy fire field (seamless tile, bottom-anchored drift) */
html[data-palette="flareon"] .section-diagonal-gap--crawl-ltr,
html[data-palette="flareon"] .section-diagonal-gap--crawl-rtl {
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  animation:
    flareon-fire-burn 1.7s ease-in-out infinite,
    flareon-wave-drift 5s linear infinite;
}

@media (prefers-reduced-motion: reduce) {
  html[data-palette="flareon"] .section-diagonal-gap--crawl-ltr,
  html[data-palette="flareon"] .section-diagonal-gap--crawl-rtl {
    animation: none;
  }
}

@keyframes flareon-fire-burn {
  0%,
  100% {
    filter: brightness(1) saturate(1);
  }
  40% {
    filter: brightness(1.12) saturate(1.08);
  }
  70% {
    filter: brightness(0.92) saturate(0.96);
  }
}

@keyframes flareon-wave-drift {
  from {
    background-position: 0 bottom;
  }
  to {
    background-position: ${TILE_W}px bottom;
  }
}

html[data-palette="flareon"] .section-diagonal-gap--crawl-ltr,
html[data-palette="flareon"] .section-diagonal-gap--crawl-rtl {
  background-color: #e85a2a;
  background-image: url("data:image/svg+xml,${tileEnc}");
  background-repeat: repeat-x;
  background-size: ${TILE_W}px 100%;
  background-position: 0 bottom;
}
`;

const mainPath = "src/eeveelution-dividers.css";
const main = readFileSync(mainPath, "utf8");
const s = main.indexOf("/* Flareon");
const e = main.indexOf("/* Leafeon");
writeFileSync(mainPath, main.slice(0, s) + css.trim() + "\n\n" + main.slice(e));
console.log("done — wavy flame columns, tile", TILE_W, "px");
