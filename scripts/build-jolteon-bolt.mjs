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
  cloud: "#665a78",
  cloudDark: "#50465f",
  cloudLight: "#7f728f",
  boltGlow: "#4d9fff",
  bolt: "#9fe0ff",
  boltCore: "#ffffff",
  boltShine: "#ffffff",
  boltFlash: "#c8eeff",
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
    lightning: true,
    opacity: 0.68,
    colorSeed: 3,
  };

  const haze = {
    x: Math.round(-tileW * 0.08),
    y: 1,
    cells: cloudBandCells(0, cols + 6, 47),
    drift: driftMid,
    lightning: false,
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
    parts.push(bpx(bx, shaftStartRow + shaftR, shaftCol + shaftC, C.window));
  }

  const peakCol = centerCol(baseW, 1);
  return {
    svg: parts.join(""),
    strikeX: bx + (peakCol + 0.5) * BCELL,
    strikeY: H - row * BCELL,
    w: baseW * BCELL,
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

const STRIKE_DUR = 6.5;

/** Pick a cloud pixel above the target — top of cloud, mostly vertical drop. */
function cloudStrikeOrigin(cells, targetLocalX, targetLocalY, seed = 0, preferLong = true) {
  const minDrop = 10;
  const maxDx = preferLong ? 16 : 9;

  const scored = cells
    .map(([cx, cy]) => {
      const px = cx * CELL + CELL / 2;
      const py = cy * CELL + CELL / 2;
      const dx = Math.abs(px - targetLocalX);
      const drop = targetLocalY - py;
      if (drop < minDrop) return null;

      const noise = cloudNoise(cx * 19 + cy * 23 + seed);
      const reachFit = Math.max(0, 6 - Math.abs(dx - maxDx * 0.55));
      return {
        x: px,
        y: py,
        score: drop * 3 - cy * 5 - Math.abs(dx - maxDx * 0.55) * 1.6 + reachFit + noise * 2.5,
      };
    })
    .filter(Boolean);

  if (!scored.length) {
    return { x: targetLocalX, y: Math.max(2, targetLocalY - 14) };
  }

  scored.sort((a, b) => b.score - a.score);
  const pick = Math.floor(cloudNoise(seed + 5) * Math.min(3, scored.length));
  const chosen = scored[pick];
  return { x: chosen.x, y: chosen.y };
}

function buildStrikes(cloudIdx) {
  const begins = [0, 1.6, 3.3, 5.0];
  return begins.map((begin, i) => ({
    cloudIdx,
    buildingIdx: i % SKYLINE_BUILT.length,
    begin,
    jitterX: Math.round((cloudNoise(i * 17 + 3) - 0.5) * 12),
    pathSeed: i * 41 + 7,
    preferLong: cloudNoise(i * 23 + 1) > 0.25,
  }));
}

const STRIKES = buildStrikes(1);

function cloudCenterLocal(cells) {
  let sx = 0;
  let sy = 0;
  for (const [cx, cy] of cells) {
    sx += cx * CELL + CELL / 2;
    sy += cy * CELL + CELL / 2;
  }
  const n = cells.length;
  return { x: sx / n, y: sy / n + CELL * 0.8 };
}

function cloudCenter(cloud) {
  const local = cloudCenterLocal(cloud.cells);
  return { x: cloud.x + local.x, y: cloud.y + local.y };
}

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

function buildingTop(b) {
  return { x: b.strikeX, y: b.strikeY };
}

function rectsFromCells(cells, ox, oy, fill) {
  return cells
    .map(([cx, cy]) => `<rect x="${ox + cx * CELL}" y="${oy + cy * CELL}" width="${CELL}" height="${CELL}" fill="${fill}"/>`)
    .join("");
}

function boltsForCloud(cloud, cloudIdx, animated) {
  if (cloud.lightning === false || !animated) return "";
  return STRIKES.filter((s) => s.cloudIdx === cloudIdx).map((strike) => {
    const building = SKYLINE_BUILT[strike.buildingIdx];
    if (!building) return "";
    const toX = building.strikeX - cloud.x + Math.round((cloudNoise(strike.pathSeed + 11) - 0.5) * 9);
    const toY = building.strikeY - cloud.y;
    const aimX = toX + (strike.jitterX ?? 0);
    const localFrom = cloudStrikeOrigin(cloud.cells, aimX, toY, strike.pathSeed, strike.preferLong !== false);
    const { glow, bolt, core, flash } = boltSegments(localFrom.x, localFrom.y, toX, toY, strike.pathSeed);
    const t0 = 0.44;
    const t1 = 0.48;
    const t2 = 0.7;
    const t3 = 0.76;
    return `<g opacity="0">
      <animate attributeName="opacity"
        values="0;0;1;1;0.85;0"
        keyTimes="0;${t0};${t1};${t2};${t3};1"
        dur="${STRIKE_DUR}s" begin="${strike.begin}s" repeatCount="indefinite"/>
      <g>${flash}</g>
      <g>${glow}</g>
      <g>${bolt}</g>
      <g>${core}</g>
    </g>`;
  }).join("");
}

function skylineLayer() {
  const ground = `<rect x="0" y="${H - 2}" width="${TILE_W}" height="2" fill="${C.shadow}"/>`;
  return ground + SKYLINE_BUILT.map((b) => `<g>${b.svg}</g>`).join("\n");
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
    const bolts = boltsForCloud(cloud, i, animated);
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
      <g>${bolts}</g>
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

const BOLT_GLOW_OFFSETS = [
  [-3, 0], [3, 0], [0, -3], [0, 3],
  [-2, 0], [2, 0], [0, -2], [0, 2],
  [-1, -1], [1, -1], [-1, 1], [1, 1],
  [-1, 0], [1, 0], [0, -1], [0, 1],
  [-2, -1], [2, -1], [-2, 1], [2, 1],
  [-3, -1], [3, -1], [-3, 1], [3, 1],
  [-1, -2], [1, -2], [-1, 2], [1, 2],
];

function jaggedBoltWaypoints(x0, y0, x1, y1, seed) {
  let fromY = Math.round(y0);
  let toY = Math.round(y1);
  const fromX = Math.round(x0);
  const toX = Math.round(x1);

  if (toY <= fromY) {
    fromY = Math.max(2, toY - 12);
  }

  const drop = toY - fromY;
  const segments = Math.max(3, Math.min(5, Math.floor(drop / 5)));
  const maxJag = Math.min(5, Math.max(2, drop * 0.12));
  const waypoints = [{ x: fromX, y: fromY }];

  for (let i = 1; i < segments; i++) {
    const t = i / segments;
    const y = Math.round(fromY + drop * t);
    const baseX = fromX + (toX - fromX) * t;
    const jag = (cloudNoise(seed + i * 17) - 0.5) * 2 * maxJag;
    waypoints.push({
      x: Math.round(baseX + jag),
      y,
    });
  }

  waypoints.push({ x: toX, y: toY });
  return waypoints;
}

function boltPathCells(x0, y0, x1, y1, seed) {
  const waypoints = jaggedBoltWaypoints(x0, y0, x1, y1, seed);
  const seen = new Set();
  const corePts = [];

  for (let i = 0; i < waypoints.length - 1; i++) {
    const seg = lineCells(waypoints[i].x, waypoints[i].y, waypoints[i + 1].x, waypoints[i + 1].y);
    for (const [x, y] of seg) {
      const key = `${x},${y}`;
      if (seen.has(key)) continue;
      seen.add(key);
      corePts.push([x, y]);
    }
  }

  // Rare tiny downward branch.
  if (corePts.length > 18 && cloudNoise(seed + 99) > 0.62) {
    const branchAt = Math.floor(corePts.length * (0.4 + cloudNoise(seed + 101) * 0.2));
    const [bx, by] = corePts[branchAt];
    const dir = cloudNoise(seed + 103) > 0.5 ? 1 : -1;
    const branchLen = 2 + Math.floor(cloudNoise(seed + 107) * 3);
    const branch = lineCells(bx, by, bx + dir * 2, by + branchLen);
    for (const [x, y] of branch) {
      const key = `${x},${y}`;
      if (seen.has(key)) continue;
      seen.add(key);
      corePts.push([x, y]);
    }
  }

  return { corePts, seen };
}

function boltSegments(x0, y0, x1, y1, seed = 0) {
  const { corePts, seen } = boltPathCells(x0, y0, x1, y1, seed);

  const glowKeys = new Set();
  for (const [x, y] of corePts) {
    for (const [ox, oy] of BOLT_GLOW_OFFSETS) {
      glowKeys.add(`${x + ox},${y + oy}`);
    }
  }

  const flash = [
    `<rect x="${Math.round(x0) - 10}" y="${Math.round(y0) - 8}" width="20" height="14" fill="${C.boltFlash}" opacity="0.55"/>`,
    `<rect x="${Math.round(x1) - 8}" y="${Math.round(y1) - 6}" width="16" height="10" fill="${C.boltFlash}" opacity="0.45"/>`,
  ].join("");

  const glow = [...glowKeys]
    .filter((k) => !seen.has(k))
    .map((k) => {
      const [x, y] = k.split(",").map(Number);
      return `<rect x="${x}" y="${y}" width="1" height="1" fill="${C.boltGlow}" opacity="0.75"/>`;
    })
    .join("");

  const bolt = corePts
    .map(([x, y]) => `<rect x="${x}" y="${y}" width="2" height="2" fill="${C.bolt}"/>`)
    .join("");

  const core = corePts
    .map(([x, y]) => `<rect x="${x}" y="${y}" width="1" height="1" fill="${C.boltCore}"/><rect x="${x + 1}" y="${y + 1}" width="1" height="1" fill="${C.boltShine}"/>`)
    .join("");

  return { glow, bolt, core, flash };
}

function lightningLayer() {
  return "";
}

function buildSvg({ animated }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${TILE_W}" height="${H}" viewBox="0 0 ${TILE_W} ${H}" preserveAspectRatio="xMidYMid slice" overflow="visible" shape-rendering="crispEdges">
${skylineLayer()}
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
