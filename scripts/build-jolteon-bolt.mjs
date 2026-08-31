/**
 * Jolteon divider — skyline + storm clouds.
 * Run: node scripts/build-jolteon-bolt.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dividersDir = path.join(root, "src", "dividers");
const cssPath = path.join(root, "src", "eeveelution-dividers.css");

/** Tile width is computed from skyline layout — see computeTileW(). */
let TILE_W;
const H = 48;
const CELL = 4;
const BCELL = 2;
const SKYLINE_GAP = 26;

/** Sky is transparent so --palette-divider shows through. */
const C = {
  shadow: "#2e2c34",
  building: "#5a5860",
  light: "#7a7882",
  highlight: "#9a98a2",
  window: "#d4c85a",
  windowGlow: "#fff6b8",
  windowGlowSoft: "#e8dc78",
  cloud: "#665a78",
  cloudDark: "#50465f",
  cloudLight: "#7f728f",
  groundMist: "#8a7f9a",
  groundMistLight: "#9d92ad",
};

/** Deterministic 0–1 noise for repeatable but irregular cloud scatter. */
function cloudNoise(n) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/** Build an erratic horizontal cloud band — uneven columns and random gaps. */
function cloudBandCells(startCol, endCol, seed = 0) {
  const cells = [];
  for (let cx = startCol; cx < endCol; cx++) {
    const lx = cx - startCol;
    const heightRoll = cloudNoise(cx + seed);
    const maxRow = heightRoll > 0.8 ? 4 : heightRoll > 0.58 ? 3 : heightRoll > 0.32 ? 2 : heightRoll > 0.1 ? 1 : 0;
    for (let cy = 0; cy <= maxRow; cy++) {
      const gapRoll = cloudNoise(cx * 7 + cy * 13 + seed);
      if (gapRoll > 0.14) cells.push([lx, cy]);
    }
  }
  return cells;
}

/** Place buildings edge-to-edge with fixed gaps; trailing gap matches seam on repeat. */
function buildSkyline() {
  const types = SKYLINE_TYPE_INDICES.map((i) => BUILDING_TYPES[i]);
  const widths = types.map((t) => t(0).w);
  let x = 0;
  return types.map((type, id) => {
    const slot = { x, type, id };
    x += widths[id] + SKYLINE_GAP;
    return slot;
  });
}

function computeTileW(skyline) {
  const last = skyline[skyline.length - 1];
  const { w } = last.type(0);
  return last.x + w + SKYLINE_GAP;
}

function buildClouds(tileW) {
  const cols = Math.ceil(tileW / CELL);
  const driftSlow = { dur: 3, begin: 0, values: "0 0;24 -4;42 2;20 -5;0 0" };
  const driftMid = { dur: 2.5, begin: 0.6, values: "0 0;-28 -3;-46 3;-22 -5;0 0" };

  const mist = {
    x: 0,
    y: 0,
    cells: cloudBandCells(0, cols, 11),
    drift: driftSlow,
    opacity: 0.68,
    colorSeed: 3,
  };

  const haze = {
    x: Math.round(-tileW * 0.08),
    y: 1,
    cells: cloudBandCells(0, cols + 6, 47),
    drift: driftMid,
    opacity: 0.58,
    colorSeed: 29,
  };

  return [haze, mist];
}

function bpx(bx, row, col, fill) {
  const x = bx + col * BCELL;
  const y = H - (row + 1) * BCELL;
  return `<rect x="${x}" y="${y}" width="${BCELL}" height="${BCELL}" fill="${fill}"/>`;
}

function bblock(bx, row, col, w, h, fill) {
  const x = bx + col * BCELL;
  const y = H - (row + h) * BCELL;
  return `<rect x="${x}" y="${y}" width="${w * BCELL}" height="${h * BCELL}" fill="${fill}"/>`;
}

function centerCol(baseW, sectionW) {
  return Math.floor((baseW - sectionW) / 2);
}

/** Left shadow / center body / right light column shading. */
function shadedRow(bx, row, col, w) {
  if (w <= 0) return "";
  if (w === 1) return bpx(bx, row, col, C.building);
  if (w === 2) return bpx(bx, row, col, C.shadow) + bpx(bx, row, col + 1, C.light);
  let out = bpx(bx, row, col, C.shadow);
  for (let c = col + 1; c < col + w - 1; c++) out += bpx(bx, row, c, C.building);
  return out + bpx(bx, row, col + w - 1, C.light);
}

/**
 * Art Deco tower — wide base, tall narrow shaft, crown setback, tapering spire.
 * Dimensions in BCELL units; rows counted from bottom (0 = ground).
 */
function artDecoTower(bx, spec) {
  const {
    baseW,
    baseH,
    shaftW,
    shaftH,
    crownW,
    crownH,
    spireH,
    windows = [],
  } = spec;

  const parts = [];
  const windowPixels = [];
  let row = 0;

  for (let r = 0; r < baseH; r++) parts.push(shadedRow(bx, row + r, 0, baseW));
  row += baseH;

  const shaftCol = centerCol(baseW, shaftW);
  for (let r = 0; r < shaftH; r++) parts.push(shadedRow(bx, row + r, shaftCol, shaftW));
  const shaftStartRow = row;
  row += shaftH;

  const crownCol = centerCol(baseW, crownW);
  for (let r = 0; r < crownH; r++) parts.push(shadedRow(bx, row + r, crownCol, crownW));
  row += crownH;

  for (let i = 0; i < spireH; i++) {
    const w = spireH === 1 ? 1 : i < spireH - 1 ? 2 : 1;
    const spireCol = centerCol(baseW, w);
    if (w === 1) parts.push(bpx(bx, row + i, spireCol, C.highlight));
    else parts.push(shadedRow(bx, row + i, spireCol, w));
  }
  row += spireH;

  for (const [shaftR, shaftC] of windows) {
    windowPixels.push({
      x: bx + (shaftCol + shaftC) * BCELL,
      y: H - (shaftStartRow + shaftR + 1) * BCELL,
    });
  }

  return {
    svg: parts.join(""),
    w: baseW * BCELL,
    windows: windowPixels,
  };
}

function empireTower(bx) {
  return artDecoTower(bx, {
    baseW: 14,
    baseH: 3,
    shaftW: 6,
    shaftH: 8,
    crownW: 8,
    crownH: 2,
    spireH: 3,
    windows: [
      [2, 2],
      [5, 3],
    ],
  });
}

function officeTower(bx) {
  return artDecoTower(bx, {
    baseW: 12,
    baseH: 3,
    shaftW: 5,
    shaftH: 7,
    crownW: 7,
    crownH: 2,
    spireH: 2,
    windows: [[3, 2]],
  });
}

function shortTower(bx) {
  return artDecoTower(bx, {
    baseW: 10,
    baseH: 2,
    shaftW: 4,
    shaftH: 5,
    crownW: 6,
    crownH: 1,
    spireH: 2,
    windows: [[2, 1]],
  });
}

function slimTower(bx) {
  return artDecoTower(bx, {
    baseW: 8,
    baseH: 2,
    shaftW: 3,
    shaftH: 8,
    crownW: 5,
    crownH: 2,
    spireH: 3,
    windows: [[4, 1]],
  });
}

function boldTower(bx) {
  return artDecoTower(bx, {
    baseW: 16,
    baseH: 3,
    shaftW: 6,
    shaftH: 6,
    crownW: 10,
    crownH: 2,
    spireH: 2,
    windows: [
      [2, 3],
      [4, 2],
    ],
  });
}

/** Art Deco skyscraper variants — varied heights for natural skyline rhythm. */
const BUILDING_TYPES = [
  empireTower,
  officeTower,
  shortTower,
  slimTower,
  boldTower,
];

const SKYLINE_TYPE_INDICES = [0, 4, 1, 3, 2, 0];

const SKYLINE = buildSkyline();
TILE_W = computeTileW(SKYLINE);

const SKYLINE_BUILT = SKYLINE.map((slot) => ({
  ...slot,
  ...slot.type(slot.x),
}));

const CLOUDS = buildClouds(TILE_W);

/** Spatial dither — dark pixels scattered by position, not array order. */
function cloudFill(cx, cy, seed = 0) {
  const n = cloudNoise(cx * 17 + cy * 31 + seed);
  if (n < 0.18) return C.cloudDark;
  if (n < 0.55) return C.cloud;
  return C.cloudLight;
}

function cloudPixelArt(cells, seed = 0) {
  return cells
    .map(([cx, cy]) => {
      const fill = cloudFill(cx, cy, seed);
      return `<rect x="${cx * CELL}" y="${cy * CELL}" width="${CELL}" height="${CELL}" fill="${fill}"/>`;
    })
    .join("");
}

function cloudDriftAnim(cloud, animated) {
  if (!animated) return "";
  const { dur, begin, values } = cloud.drift;
  return `<animateTransform attributeName="transform" type="translate"
    values="${values}"
    dur="${dur}s" begin="${begin}s" repeatCount="indefinite"
    calcMode="linear" keyTimes="0;0.25;0.5;0.75;1"/>`;
}

function skylineLayer() {
  const ground = `<rect x="0" y="${H - 2}" width="${TILE_W}" height="2" fill="${C.shadow}"/>`;
  return ground + SKYLINE_BUILT.map((b) => `<g>${b.svg}</g>`).join("\n");
}

/** Per-window flicker — rapid blips, mostly on; glow pulses in sync but stays softer. */
function windowFlickerAnim(seed, animated, layer) {
  if (!animated) return "";
  const begin = (cloudNoise(seed) * 2.8).toFixed(2);
  const dur = (2.1 + cloudNoise(seed + 3) * 1.4).toFixed(2);
  const variant = Math.floor(cloudNoise(seed + 5) * 3);

  const patterns = [
  {
    keyTimes: "0;0.015;0.03;0.045;0.06;0.075;0.09;0.105;0.12;1",
    core: "1;0;1;1;0;1;1;1;1;1",
    glow: "0.55;0.06;0.5;0.55;0.08;0.52;0.55;0.55;0.55;0.55",
  },
  {
    keyTimes: "0;0.7;0.715;0.73;0.745;0.76;0.775;0.79;0.805;1",
    core: "1;1;1;1;0;1;0;1;1;1",
    glow: "0.55;0.55;0.55;0.55;0.07;0.52;0.06;0.5;0.55;0.55",
  },
  {
    keyTimes: "0;0.02;0.035;0.05;0.065;0.5;0.515;0.53;0.545;1",
    core: "1;0;1;1;1;1;0;1;1;1",
    glow: "0.55;0.06;0.5;0.55;0.55;0.55;0.07;0.5;0.55;0.55",
  },
  ];

  const { keyTimes, core, glow } = patterns[variant];
  const values = layer === "glow" ? glow : core;
  return `<animate attributeName="opacity" values="${values}" keyTimes="${keyTimes}"
    dur="${dur}s" begin="${begin}s" repeatCount="indefinite" calcMode="linear"/>`;
}

function windowLightGroup(win, id, animated) {
  const { x, y } = win;
  const seed = id * 41 + x * 5 + y * 11;
  const core = `<rect x="${x}" y="${y}" width="${BCELL}" height="${BCELL}" fill="${C.window}">
    ${windowFlickerAnim(seed, animated, "core")}
  </rect>`;

  const glowOffsets = [
    [-2, -2], [0, -2], [2, -2],
    [-2, 0], [2, 0],
    [-2, 2], [0, 2], [2, 2],
  ];
  const glow = glowOffsets
    .map(([ox, oy], i) => {
      const fill = i % 2 === 0 ? C.windowGlow : C.windowGlowSoft;
      return `<rect x="${x + ox}" y="${y + oy}" width="${BCELL}" height="${BCELL}" fill="${fill}" opacity="0.55">
        ${windowFlickerAnim(seed + i, animated, "glow")}
      </rect>`;
    })
    .join("");

  return `<g>${glow}${core}</g>`;
}

function windowLightsLayer(animated) {
  let id = 0;
  const lights = SKYLINE_BUILT.flatMap((b) =>
    (b.windows ?? []).map((win) => windowLightGroup(win, id++, animated)),
  );
  return lights.length ? `<g>${lights.join("")}</g>` : "";
}

/** Low ground-hugging mist at the base of the skyline (~1/3 tower height). */
function groundMistCells(tileW, seed = 73) {
  const mistHeightPx = 14;
  const cols = Math.ceil(tileW / BCELL);
  const rows = Math.ceil(mistHeightPx / BCELL);
  const cells = [];

  for (let cx = 0; cx < cols; cx++) {
    for (let cy = 0; cy < rows; cy++) {
      const depth = (cy + 1) / rows;
      const n = cloudNoise(cx * 11 + cy * 19 + seed);

      // Always fill the bottom rows so mist meets the divider edge.
      if (cy >= rows - 2) {
        cells.push([cx, cy]);
      } else if (n * depth > 0.26) {
        cells.push([cx, cy]);
      }
    }
  }

  return { cells, rows };
}

function groundMistFill(cx, cy, seed = 0) {
  const n = cloudNoise(cx * 13 + cy * 29 + seed);
  if (n < 0.45) return C.groundMist;
  return C.groundMistLight;
}

function groundMistLayer(animated) {
  const { cells, rows } = groundMistCells(TILE_W);
  const baseY = H - rows * BCELL;
  const opacity = 0.26;
  const drift = animated
    ? `<animateTransform attributeName="transform" type="translate"
        values="0 0;8 0;14 0;6 0;0 0"
        dur="5.5s" begin="0.4s" repeatCount="indefinite"
        calcMode="linear" keyTimes="0;0.25;0.5;0.75;1"/>`
    : "";

  const pixels = cells
    .map(([cx, cy]) => {
      const fill = groundMistFill(cx, cy, 88);
      return `<rect x="${cx * BCELL}" y="${baseY + cy * BCELL}" width="${BCELL}" height="${BCELL}" fill="${fill}"/>`;
    })
    .join("");

  const bottomCap = `<rect x="0" y="${H - 2}" width="${TILE_W}" height="2" fill="${C.groundMist}"/>`;

  return `<g opacity="${opacity}">
    ${drift}
    <g>${bottomCap}${pixels}</g>
  </g>`;
}

function stormLayer(animated) {
  return CLOUDS.map((cloud, i) => {
    const baseOpacity = cloud.opacity ?? 0.92;
    return `<g transform="translate(${cloud.x},${cloud.y})">
      ${cloudDriftAnim(cloud, animated)}
      <g opacity="${baseOpacity}">
        <g>
          ${cloudPixelArt(cloud.cells, cloud.colorSeed ?? i)}
          <animate attributeName="opacity"
            values="${(baseOpacity * 0.92).toFixed(2)};${Math.min(baseOpacity * 1.06, 1).toFixed(2)};${(baseOpacity * 0.96).toFixed(2)};${Math.min(baseOpacity * 1.04, 1).toFixed(2)};${(baseOpacity * 0.92).toFixed(2)}"
            dur="${(1.0 + (i % 5) * 0.18).toFixed(2)}s" begin="${(i * 0.23).toFixed(2)}s" repeatCount="indefinite"/>
        </g>
      </g>
    </g>`;
  }).join("\n");
}

function buildSvg({ animated }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${TILE_W}" height="${H}" viewBox="0 0 ${TILE_W} ${H}" preserveAspectRatio="xMidYMid slice" overflow="visible" shape-rendering="crispEdges">
${skylineLayer()}
${windowLightsLayer(animated)}
${groundMistLayer(animated)}
${stormLayer(animated)}
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

  const replacement = `/* Jolteon — storm clouds over skyline */
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
