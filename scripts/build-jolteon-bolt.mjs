import { readFileSync, writeFileSync } from "fs";

const CELL = 4;
const H = 48;
const W = 480;
const BOLT_DISPLAY_H = Math.round(38 * (2 / 3));

/* Two blues only — no white core */
const BLUE = {
  inner: "#8edcff",
  mid: "#4db8eb",
};

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
    out.push([x, y]);
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

function thicken(points, radius = 1) {
  const set = new Set();
  for (let i = 0; i < points.length - 1; i++) {
    const seg = lineCells(points[i][0], points[i][1], points[i + 1][0], points[i + 1][1]);
    for (const [cx, cy] of seg) {
      for (let ox = -radius; ox <= radius; ox++) {
        for (let oy = -radius; oy <= radius; oy++) {
          if (Math.max(Math.abs(ox), Math.abs(oy)) <= radius) {
            set.add(`${cx + ox},${cy + oy}`);
          }
        }
      }
    }
  }
  return set;
}

function diff(a, b) {
  const d = new Set(a);
  for (const k of b) d.delete(k);
  return d;
}

function union(...sets) {
  const u = new Set();
  for (const s of sets) for (const k of s) u.add(k);
  return u;
}

function thickenSegments(segments, radius) {
  let out = new Set();
  for (const pts of segments) out = union(out, thicken(pts, radius));
  return out;
}

function rectsFromSet(set) {
  const byRow = new Map();
  for (const k of set) {
    const [gx, gy] = k.split(",").map(Number);
    if (!byRow.has(gy)) byRow.set(gy, []);
    byRow.get(gy).push(gx);
  }
  const out = [];
  for (const [gy, cols] of [...byRow.entries()].sort((a, b) => a[0] - b[0])) {
    cols.sort((a, b) => a - b);
    let start = cols[0];
    let prev = cols[0];
    for (let i = 1; i <= cols.length; i++) {
      const c = cols[i];
      if (c === prev + 1) {
        prev = c;
        continue;
      }
      out.push(
        `<rect x="${start * CELL}" y="${gy * CELL}" width="${(prev - start + 1) * CELL}" height="${CELL}"/>`,
      );
      start = c;
      prev = c;
    }
  }
  return out.join("");
}

function layer(set, fill) {
  if (!set.size) return "";
  return `<g fill="${fill}">${rectsFromSet(set)}</g>`;
}

/* Simple 8-bit zigzag — wide spacing, small origin blob, few branches */
const head = [
  [0, 6],
  [1, 5],
  [2, 6],
  [3, 7],
  [2, 7],
];

const mainTrunk = [
  [3, 6],
  [18, 3],
  [33, 8],
  [48, 4],
  [63, 9],
  [78, 5],
  [93, 8],
  [108, 4],
  [117, 6],
];

const segments = [head, mainTrunk];

const branches = [
  [[18, 3], [16, 0]],
  [[48, 4], [50, 1]],
  [[78, 5], [76, 8]],
  [[108, 4], [110, 1]],
];

const branchCells = new Set();
for (const [a, b] of branches) {
  for (const [x, y] of lineCells(a[0], a[1], b[0], b[1])) {
    branchCells.add(`${x},${y}`);
  }
}

const core = union(thickenSegments(segments, 0), branchCells);
const outer = thickenSegments(segments, 1);
const midRing = diff(outer, core);

function buildSvg(mirror = false) {
  const parts = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" shape-rendering="crispEdges" preserveAspectRatio="none">`,
  ];
  if (mirror) parts.push(`<g transform="translate(${W} 0) scale(-1 1)">`);
  parts.push(layer(midRing, BLUE.mid));
  parts.push(layer(core, BLUE.inner));
  if (mirror) parts.push("</g>");
  parts.push("</svg>");
  return parts.join("");
}

const ltrEnc = encodeURIComponent(buildSvg(false).replace(/\s+/g, " ").trim());
const rtlEnc = encodeURIComponent(buildSvg(true).replace(/\s+/g, " ").trim());

const css = `/* Jolteon — simple 8-bit blue lightning (2-tone, no white) */
html[data-palette="jolteon"] .section-diagonal-gap--crawl-ltr,
html[data-palette="jolteon"] .section-diagonal-gap--crawl-rtl {
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  animation: jolteon-bolt-glow 2.2s ease-in-out infinite;
}

@media (prefers-reduced-motion: reduce) {
  html[data-palette="jolteon"] .section-diagonal-gap--crawl-ltr,
  html[data-palette="jolteon"] .section-diagonal-gap--crawl-rtl {
    animation: none;
  }
}

@keyframes jolteon-bolt-glow {
  0%,
  100% {
    filter: brightness(1.06) drop-shadow(0 0 2px #8edcff) drop-shadow(0 0 6px #4db8eb)
      drop-shadow(0 0 12px rgba(77, 184, 235, 0.5));
  }
  50% {
    filter: brightness(1.18) drop-shadow(0 0 4px #8edcff) drop-shadow(0 0 10px #4db8eb)
      drop-shadow(0 0 16px rgba(142, 220, 255, 0.65));
  }
}

html[data-palette="jolteon"] .section-diagonal-gap--crawl-ltr {
  background-color: var(--palette-divider);
  background-image: url("data:image/svg+xml,${ltrEnc}");
  background-repeat: no-repeat;
  background-size: 100% ${BOLT_DISPLAY_H}px;
  background-position: left center;
}

html[data-palette="jolteon"] .section-diagonal-gap--crawl-rtl {
  background-color: var(--palette-divider);
  background-image: url("data:image/svg+xml,${rtlEnc}");
  background-repeat: no-repeat;
  background-size: 100% ${BOLT_DISPLAY_H}px;
  background-position: left center;
}
`;

const mainPath = "src/eeveelution-dividers.css";
const main = readFileSync(mainPath, "utf8");
const s = main.indexOf("/* Jolteon");
const e = main.indexOf("/* Flareon");
writeFileSync(mainPath, main.slice(0, s) + css.trim() + "\n\n" + main.slice(e));
writeFileSync("jolteon-pixel-bolt.css", css);
console.log("done — simple 2-tone jolteon bolt, W=", W);
