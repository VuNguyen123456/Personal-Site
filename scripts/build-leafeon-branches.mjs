import { readFileSync, writeFileSync } from "fs";

const S = 4;
const H = 48;
const UNIT = 1000;
const LEFT = 16;
const RIGHT = UNIT - 16;
const BRANCH_COUNT = 18;

const C = {
  bark: "#3d6b45",
  wood: "#4a7a52",
  leaf: "#6bc399",
  leafHi: "#89d89b",
  leafLo: "#378582",
  gold: "#b68933",
};

let leafClusterId = 0;
let windyLeafCount = 0;

function rects(cells, ox, oy, fill) {
  return cells
    .map(([x, y]) => `<rect x='${ox + x * S}' y='${oy + y * S}' width='${S}' height='${S}' fill='${fill}'/>`)
    .join("");
}

function isWindyLeaf(id) {
  return id % 4 === 0 || id % 7 === 3;
}

function windTiming(id) {
  const dur = (2.4 + (id % 6) * 0.28).toFixed(2);
  const begin = ((id * 0.37) % 2.8).toFixed(2);
  const dir = id % 2 === 0 ? 1 : -1;
  const sway = (2 + (id % 3)).toFixed(1);
  const drift = (1 + (id % 2)).toFixed(0);
  return { dur, begin, dir, sway, drift };
}

function windSway(id) {
  const { dur, begin, dir, sway, drift } = windTiming(id);
  const a = dir * sway;
  const b = (-dir * sway * 0.55).toFixed(1);
  const dx1 = dir * drift;
  const dx2 = (-dir * Math.max(1, drift - 1)).toFixed(0);
  return `<animateTransform attributeName='transform' type='rotate' values='0;${a};${b};0' dur='${dur}s' begin='${begin}s' repeatCount='indefinite' keyTimes='0;.35;.7;1' calcMode='spline' keySplines='0.45 0 0.55 1;0.45 0 0.55 1;0.45 0 0.55 1'/><animateTransform attributeName='transform' additive='sum' type='translate' values='0 0;${dx1} ${dir > 0 ? -1 : 1};${dx2} 0;0 0' dur='${dur}s' begin='${begin}s' repeatCount='indefinite' keyTimes='0;.4;.75;1' calcMode='spline' keySplines='0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1'/>`;
}

/** Pixel leaf cluster; some clusters sway in the wind */
function leafCluster(cx, cy, flip) {
  const id = leafClusterId++;
  const f = flip ? (y) => -y : (y) => y;
  const cells = [
    [0, f(0)],
    [1, f(0)],
    [2, f(0)],
    [0, f(1)],
    [2, f(1)],
  ];
  const hi = [[1, f(0)]];
  const lo = [[1, f(1)]];

  const body =
    rects(cells, 0, 0, C.leaf) + rects(hi, 0, 0, C.leafHi) + rects(lo, 0, 0, C.leafLo);

  const ox = cx * S;
  const oy = cy * S;
  const pivotX = S * 1.5;
  const pivotY = S * (flip ? 0.5 : 0.5);

  if (!isWindyLeaf(id)) {
    return rects(cells, ox, oy, C.leaf) + rects(hi, ox, oy, C.leafHi) + rects(lo, ox, oy, C.leafLo);
  }

  windyLeafCount++;
  return `<g transform='translate(${ox} ${oy})'><g transform='translate(${pivotX} ${pivotY})'>${windSway(id)}<g transform='translate(${-pivotX} ${-pivotY})'>${body}</g></g></g>`;
}

function branchStraight() {
  return (
    rects(
      [
        [1, 0],
        [1, 1],
        [1, 2],
        [0, 3],
        [1, 3],
        [2, 3],
        [1, 4],
        [1, 5],
      ],
      0,
      0,
      C.wood,
    ) +
    rects([[1, 0]], 0, 0, C.bark) +
    leafCluster(3, 1, false) +
    leafCluster(0, 4, false) +
    leafCluster(3, 5, false) +
    rects([[1, 6]], 0, 0, C.gold)
  );
}

function branchLeanR() {
  return (
    rects(
      [
        [1, 0],
        [2, 1],
        [2, 2],
        [3, 3],
        [3, 4],
        [4, 5],
        [4, 6],
      ],
      0,
      0,
      C.wood,
    ) +
    rects([[2, 0]], 0, 0, C.bark) +
    leafCluster(0, 1, false) +
    leafCluster(4, 3, false) +
    leafCluster(5, 6, false)
  );
}

function branchLeanL() {
  return (
    rects(
      [
        [2, 0],
        [1, 1],
        [1, 2],
        [0, 3],
        [0, 4],
        [0, 5],
      ],
      0,
      0,
      C.wood,
    ) +
    rects([[1, 0]], 0, 0, C.bark) +
    leafCluster(4, 1, false) +
    leafCluster(0, 3, false) +
    leafCluster(1, 5, false)
  );
}

function branchFork() {
  return (
    rects(
      [
        [2, 0],
        [1, 1],
        [2, 1],
        [3, 1],
        [1, 2],
        [3, 2],
        [2, 3],
        [2, 4],
        [2, 5],
      ],
      0,
      0,
      C.wood,
    ) +
    rects([[2, 0]], 0, 0, C.bark) +
    leafCluster(0, 1, false) +
    leafCluster(4, 1, false) +
    leafCluster(1, 3, false) +
    leafCluster(3, 4, false) +
    leafCluster(0, 5, false) +
    leafCluster(4, 6, false)
  );
}

function branchSprig() {
  return (
    rects(
      [
        [1, 0],
        [1, 1],
        [0, 2],
        [1, 2],
        [2, 2],
      ],
      0,
      0,
      C.wood,
    ) +
    leafCluster(3, 0, false) +
    leafCluster(0, 3, false)
  );
}

function branchThick() {
  return (
    rects(
      [
        [1, 0],
        [2, 0],
        [1, 1],
        [2, 1],
        [1, 2],
        [2, 2],
        [0, 3],
        [1, 3],
        [2, 3],
        [3, 3],
        [1, 4],
        [2, 4],
        [1, 5],
        [2, 5],
      ],
      0,
      0,
      C.wood,
    ) +
    rects(
      [
        [1, 0],
        [2, 0],
      ],
      0,
      0,
      C.bark,
    ) +
    leafCluster(4, 2, false) +
    leafCluster(0, 4, false) +
    leafCluster(4, 5, false)
  );
}

const VARIANTS = [branchStraight, branchLeanR, branchLeanL, branchFork, branchSprig, branchThick];

function buildPlacements() {
  const span = RIGHT - LEFT;
  return Array.from({ length: BRANCH_COUNT }, (_, i) => {
    const x = Math.round(LEFT + (i / (BRANCH_COUNT - 1)) * span);
    const yJitter = (i % 3) - 1;
    const draw = VARIANTS[i % VARIANTS.length];
    const fromTop = i % 2 === 0;
    return { x, yJitter, draw, fromTop };
  });
}

function branchGroup(p) {
  const art = p.draw();
  if (p.fromTop) {
    return `<g transform='translate(${p.x} ${p.yJitter})'>${art}</g>`;
  }
  return `<g transform='translate(${p.x} ${H + p.yJitter}) scale(1 -1)'>${art}</g>`;
}

function buildSvg() {
  leafClusterId = 0;
  windyLeafCount = 0;
  const inner = buildPlacements().map(branchGroup).join("");
  return `<svg xmlns='http://www.w3.org/2000/svg' width='${UNIT}' height='${H}' viewBox='0 0 ${UNIT} ${H}' preserveAspectRatio='xMidYMid slice' overflow='visible' shape-rendering='crispEdges'><g opacity='.92'>${inner}</g></svg>`;
}

function enc(svg) {
  return encodeURIComponent(svg.replace(/\s+/g, " ").trim());
}

const tileEnc = enc(buildSvg());

const css = `/* Leafeon — static branches; some leaves sway in the wind, full width */
html[data-palette="leafeon"] .section-diagonal-gap--crawl-ltr,
html[data-palette="leafeon"] .section-diagonal-gap--crawl-rtl {
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}

html[data-palette="leafeon"] .section-diagonal-gap--crawl-ltr,
html[data-palette="leafeon"] .section-diagonal-gap--crawl-rtl {
  background-color: var(--palette-divider);
  background-image: url("data:image/svg+xml,${tileEnc}");
  background-repeat: no-repeat;
  background-size: 100% 100%;
  background-position: center;
}
`;

const mainPath = "src/eeveelution-dividers.css";
const main = readFileSync(mainPath, "utf8");
const s = main.indexOf("/* Leafeon");
const e = main.indexOf("/* Glaceon");
writeFileSync(mainPath, main.slice(0, s) + css.trim() + "\n\n" + main.slice(e));
console.log(
  "done —",
  BRANCH_COUNT,
  "static branches,",
  windyLeafCount,
  "/",
  leafClusterId,
  "leaf clusters sway",
);
