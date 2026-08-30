/**
 * Jolteon divider — skyline + storm clouds with periodic lightning strikes.
 * Run: node scripts/build-jolteon-bolt.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dividersDir = path.join(root, "src", "dividers");
const cssPath = path.join(root, "src", "eeveelution-dividers.css");

/** Seamless horizontal tile — must match CSS background-size width */
const TILE_W = 290;
const H = 48;
const CELL = 4;

/** Matches Jolteon --palette-divider (ffef42 22% + white); sky is transparent so CSS shows through. */
const C = {
  building: "#6a5a7d",
  buildingDark: "#4f4462",
  window: "#e7d94d",
  windowDim: "#d4c85a",
  cloud: "#c4b8d4",
  cloudDark: "#a89bb8",
  bolt: "#ffef42",
};

/** Low skyline silhouettes — varied shapes, max ~16px tall (room for clouds). */
const BUILDING_TYPES = [
  steppedSpire,
  twinTower,
  terraceBlock,
  antennaTower,
  wingedBase,
  lowRetail,
  splitTower,
];

const SKYLINE = Array.from({ length: 10 }, (_, i) => {
  const type = BUILDING_TYPES[i % BUILDING_TYPES.length];
  const x = i * 29 + (i % 2);
  return { x, type, id: i };
}).filter((b) => b.x < TILE_W - 4);

function px(bx, row, col, fill = C.building) {
  const x = bx + col * CELL;
  const y = H - (row + 1) * CELL;
  return `<rect x="${x}" y="${y}" width="${CELL}" height="${CELL}" fill="${fill}"/>`;
}

function win(bx, row, col, bright = false) {
  return px(bx, row, col, bright ? C.window : C.windowDim);
}

/** Wide base, stepped middle, thin spire. */
function steppedSpire(bx) {
  const parts = [
    px(bx, 0, 0), px(bx, 0, 1), px(bx, 0, 2), px(bx, 0, 3),
    px(bx, 1, 0), px(bx, 1, 1), px(bx, 1, 2), px(bx, 1, 3),
    px(bx, 2, 1, C.buildingDark), px(bx, 2, 2, C.buildingDark),
    px(bx, 3, 1), px(bx, 3, 2),
    win(bx, 1, 1), win(bx, 1, 2, true),
  ];
  return { svg: parts.join(""), strikeX: bx + 10, strikeY: H - 4 * CELL, w: 16 };
}

/** Two narrow towers on a shared podium. */
function twinTower(bx) {
  const parts = [
    px(bx, 0, 0), px(bx, 0, 1), px(bx, 0, 2), px(bx, 0, 3), px(bx, 0, 4),
    px(bx, 1, 0), px(bx, 1, 4),
    px(bx, 2, 0), px(bx, 2, 4),
    px(bx, 3, 1), px(bx, 3, 3),
    win(bx, 1, 0), win(bx, 1, 4, true),
  ];
  return { svg: parts.join(""), strikeX: bx + 10, strikeY: H - 4 * CELL, w: 20 };
}

/** Three-tier setback terrace. */
function terraceBlock(bx) {
  const parts = [
    px(bx, 0, 0), px(bx, 0, 1), px(bx, 0, 2), px(bx, 0, 3), px(bx, 0, 4),
    px(bx, 1, 1), px(bx, 1, 2), px(bx, 1, 3),
    px(bx, 2, 2),
    px(bx, 0, 0, C.buildingDark), px(bx, 0, 4, C.buildingDark),
    win(bx, 1, 2, true),
  ];
  return { svg: parts.join(""), strikeX: bx + 10, strikeY: H - 3 * CELL, w: 20 };
}

/** Short block + antenna mast. */
function antennaTower(bx) {
  const parts = [
    px(bx, 0, 0), px(bx, 0, 1), px(bx, 0, 2),
    px(bx, 1, 0), px(bx, 1, 1), px(bx, 1, 2),
    px(bx, 2, 1, C.buildingDark),
    px(bx, 3, 1, C.window),
    win(bx, 0, 1), win(bx, 1, 0, true),
  ];
  return { svg: parts.join(""), strikeX: bx + 6, strikeY: H - 4 * CELL, w: 12 };
}

/** Taller core with low side wings. */
function wingedBase(bx) {
  const parts = [
    px(bx, 0, 0), px(bx, 0, 4),
    px(bx, 1, 0), px(bx, 1, 1), px(bx, 1, 2), px(bx, 1, 3), px(bx, 1, 4),
    px(bx, 2, 1), px(bx, 2, 2), px(bx, 2, 3),
    px(bx, 3, 2),
    win(bx, 1, 2, true), win(bx, 2, 1),
  ];
  return { svg: parts.join(""), strikeX: bx + 10, strikeY: H - 4 * CELL, w: 20 };
}

/** Short wide storefront. */
function lowRetail(bx) {
  const parts = [
    px(bx, 0, 0), px(bx, 0, 1), px(bx, 0, 2), px(bx, 0, 3),
    px(bx, 1, 0, C.buildingDark), px(bx, 1, 3, C.buildingDark),
    win(bx, 0, 1, true), win(bx, 0, 2),
  ];
  return { svg: parts.join(""), strikeX: bx + 8, strikeY: H - 2 * CELL, w: 16 };
}

/** Main shaft with side notch. */
function splitTower(bx) {
  const parts = [
    px(bx, 0, 0), px(bx, 0, 1), px(bx, 0, 2), px(bx, 0, 3),
    px(bx, 1, 0), px(bx, 1, 1), px(bx, 1, 3),
    px(bx, 2, 0), px(bx, 2, 3),
    px(bx, 3, 1), px(bx, 3, 2),
    win(bx, 1, 0), win(bx, 2, 3, true),
  ];
  return { svg: parts.join(""), strikeX: bx + 6, strikeY: H - 4 * CELL, w: 16 };
}

const SKYLINE_BUILT = SKYLINE.map((slot) => ({
  ...slot,
  ...slot.type(slot.x),
}));

/** Dark cloud clusters within the tile. */
const CLOUDS = [
  { x: 12, y: 0, cells: [[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1], [3, 1], [1, 2]] },
  { x: 108, y: 2, cells: [[0, 0], [1, 0], [2, 0], [3, 0], [0, 1], [1, 1], [2, 1], [3, 1], [2, 2]] },
  { x: 212, y: 1, cells: [[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1], [1, 2]] },
];

/** Lightning targets — cloud column to building below (per tile). */
const STRIKES = [
  { cloudIdx: 0, buildingIdx: 2, begin: 0 },
  { cloudIdx: 1, buildingIdx: 5, begin: 2.2 },
  { cloudIdx: 2, buildingIdx: 8, begin: 4.4 },
  { cloudIdx: 0, buildingIdx: 7, begin: 6.6 },
  { cloudIdx: 1, buildingIdx: 3, begin: 8.0 },
];

const STRIKE_DUR = 9.8;

function cloudCenter(cloud) {
  let sx = 0;
  let sy = 0;
  for (const [cx, cy] of cloud.cells) {
    sx += cloud.x + cx * CELL + CELL / 2;
    sy += cloud.y + cy * CELL + CELL / 2;
  }
  const n = cloud.cells.length;
  return { x: sx / n, y: sy / n + CELL * 1.2 };
}

function buildingTop(b) {
  return { x: b.strikeX, y: b.strikeY };
}

function rectsFromCells(cells, ox, oy, fill) {
  return cells
    .map(([cx, cy]) => `<rect x="${ox + cx * CELL}" y="${oy + cy * CELL}" width="${CELL}" height="${CELL}" fill="${fill}"/>`)
    .join("");
}

function skylineLayer() {
  return SKYLINE_BUILT.map((b) => `<g>${b.svg}</g>`).join("\n");
}

function cloudsLayer() {
  return CLOUDS.map((cloud, i) => {
    const dark = cloud.cells.filter((_, j) => j % 2 === 0);
    const mid = cloud.cells.filter((_, j) => j % 2 === 1);
    return `<g opacity="0.82">
      ${rectsFromCells(dark, cloud.x, cloud.y, C.cloudDark)}
      ${rectsFromCells(mid, cloud.x, cloud.y, C.cloud)}
      <animate attributeName="opacity" values="0.76;0.84;0.8;0.84;0.76" dur="4.5s" begin="${i * 0.35}s" repeatCount="indefinite"/>
    </g>`;
  }).join("\n");
}

function lineCells(x0, y0, x1, y1) {
  const out = [];
  let x = x0;
  let y = y0;
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;
  for (;;) {
    out.push([Math.round(x), Math.round(y)]);
    if (x === x1 && y === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x += sx;
    }
    if (e2 < dx) {
      err += dx;
      y += sy;
    }
  }
  return out;
}

function boltSegments(x0, y0, x1, y1) {
  const midX = (x0 + x1) / 2 + (x0 % 2 === 0 ? 6 : -6);
  const midY = (y0 + y1) / 2;
  const seg1 = lineCells(Math.round(x0), Math.round(y0), Math.round(midX), Math.round(midY));
  const seg2 = lineCells(Math.round(midX), Math.round(midY), Math.round(x1), Math.round(y1));
  const set = new Set();
  for (const [x, y] of [...seg1, ...seg2]) {
    set.add(`${x},${y}`);
    for (const [ox, oy] of [
      [0, 0],
      [1, 0],
      [0, 1],
    ]) {
      set.add(`${x + ox},${y + oy}`);
    }
  }
  return [...set].map((k) => {
    const [x, y] = k.split(",").map(Number);
    return `<rect x="${x}" y="${y}" width="2" height="2" fill="${C.bolt}"/>`;
  });
}

function lightningLayer(animated) {
  return STRIKES.map((strike) => {
    const cloud = CLOUDS[strike.cloudIdx];
    const building = SKYLINE_BUILT[strike.buildingIdx];
    if (!cloud || !building) return "";
    const from = cloudCenter(cloud);
    const to = buildingTop(building);
    const bolts = boltSegments(from.x, from.y, to.x, to.y).join("");

    if (!animated) return "";

    const t0 = 0.8;
    const t1 = 0.84;
    const t2 = 0.9;
    const t3 = 0.94;
    return `<g opacity="0">
      <animate attributeName="opacity"
        values="0;0;1;1;0;0"
        keyTimes="0;${t0};${t1};${t2};${t3};1"
        dur="${STRIKE_DUR}s" begin="${strike.begin}s" repeatCount="indefinite"/>
      ${bolts}
    </g>`;
  }).join("\n");
}

function buildSvg({ animated }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${TILE_W}" height="${H}" viewBox="0 0 ${TILE_W} ${H}" shape-rendering="crispEdges">
${skylineLayer()}
${cloudsLayer()}
${lightningLayer(animated)}
</svg>`;
}

function encodeSvg(svg) {
  return `url("data:image/svg+xml,${encodeURIComponent(svg.trim())}")`;
}

function patchCss(ltrUrl, rtlUrl, staticUrl) {
  const css = fs.readFileSync(cssPath, "utf8");
  const start = css.indexOf("/* Jolteon");
  const end = css.indexOf("/* Flareon");
  if (start === -1 || end === -1) {
    throw new Error("Could not find Jolteon/Flareon markers in eeveelution-dividers.css");
  }

  const replacement = `/* Jolteon — storm clouds over skyline with lightning strikes */
html[data-palette="jolteon"] .section-diagonal-gap--crawl-ltr,
html[data-palette="jolteon"] .section-diagonal-gap--crawl-rtl {
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}

html[data-palette="jolteon"] .section-diagonal-gap--crawl-ltr {
  background-color: var(--palette-divider);
  background-image: ${ltrUrl};
  background-repeat: repeat-x;
  background-size: ${TILE_W}px ${H}px;
  background-position: left center;
}

html[data-palette="jolteon"] .section-diagonal-gap--crawl-rtl {
  background-color: var(--palette-divider);
  background-image: ${rtlUrl};
  background-repeat: repeat-x;
  background-size: ${TILE_W}px ${H}px;
  background-position: left center;
}

@media (prefers-reduced-motion: reduce) {
  html[data-palette="jolteon"] .section-diagonal-gap--crawl-ltr,
  html[data-palette="jolteon"] .section-diagonal-gap--crawl-rtl {
    background-image: ${staticUrl};
  }
}

`;

  fs.writeFileSync(cssPath, css.slice(0, start) + replacement + css.slice(end), "utf8");
}

fs.mkdirSync(dividersDir, { recursive: true });

const animated = buildSvg({ animated: true });
const staticSvg = buildSvg({ animated: false });

fs.writeFileSync(path.join(dividersDir, "jolteon-divider.svg"), animated, "utf8");
fs.writeFileSync(path.join(dividersDir, "jolteon-divider-static.svg"), staticSvg, "utf8");

if (fs.existsSync(cssPath)) {
  patchCss(encodeSvg(animated), encodeSvg(animated), encodeSvg(staticSvg));
  console.log("Jolteon skyline divider built and CSS patched.");
} else {
  console.log("Jolteon SVGs written (eeveelution-dividers.css not found).");
}
