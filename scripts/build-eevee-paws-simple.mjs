import { readFileSync, writeFileSync } from "fs";

const W = 240;
const H = 48;
const S = 4;
const PAW_W = 16;
const CYCLE = 2.4;
const STEP = 0.55;

const C = {
  base: "#633c15",
  dark: "#3a2209",
};

/** Simple paw: 3 toes + pad (4×4 blocks) */
const paw = [
  [1, 0],
  [2, 0],
  [3, 0],
  [0, 1],
  [1, 1],
  [2, 1],
  [3, 1],
  [1, 2],
  [2, 2],
];

function rects(cells, ox, oy) {
  return cells
    .map(
      ([x, y]) =>
        `<rect x='${ox + x * S}' y='${oy + y * S}' width='${S}' height='${S}'/>`,
    )
    .join("");
}

function crawlFlash(stepIndex, crawlLtr) {
  const order = crawlLtr ? stepIndex : 3 - stepIndex;
  const begin = (order * STEP).toFixed(2);
  return `<animate attributeName='opacity' values='0;0;1;0.35;0' dur='${CYCLE}s' begin='${begin}s' repeatCount='indefinite' keyTimes='0;.78;.88;.95;1' calcMode='spline' keySplines='0.35 0 0.65 1;0.35 0 0.65 1;0.35 0 0.65 1;0.35 0 0.65 1'/>`;
}

function pawGroup(px, py, mirror, stepIndex, crawlLtr) {
  const transform = mirror
    ? `translate(${px + PAW_W} ${py}) scale(-1 1)`
    : `translate(${px} ${py})`;
  const art = rects(paw, 0, 0);
  return `<g transform='${transform}'><g fill='${C.base}' opacity='.32'>${art}</g><g fill='${C.dark}'>${crawlFlash(stepIndex, crawlLtr)}${art}</g></g>`;
}

function tile(mirror, crawlLtr) {
  const placements = [
    [12, 16],
    [72, 26],
    [132, 16],
    [192, 26],
  ];
  const inner = placements
    .map(([px, py], i) => pawGroup(px, py, mirror, i, crawlLtr))
    .join("");
  return `<svg xmlns='http://www.w3.org/2000/svg' width='${W}' height='${H}' viewBox='0 0 ${W} ${H}' shape-rendering='crispEdges'>${inner}</svg>`;
}

function enc(svg) {
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

const css = `/* Eevee — paws with darker crawl highlight marching along the divider */
html[data-palette="eevee"] .section-diagonal-gap--crawl-ltr,
html[data-palette="eevee"] .section-diagonal-gap--crawl-rtl {
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}

html[data-palette="eevee"] .section-diagonal-gap--crawl-ltr {
  background-color: var(--palette-divider);
  background-image: ${enc(tile(false, true))};
  background-repeat: repeat-x;
  background-size: ${W}px ${H}px;
  background-position: left center;
}

html[data-palette="eevee"] .section-diagonal-gap--crawl-rtl {
  background-color: var(--palette-divider);
  background-image: ${enc(tile(true, false))};
  background-repeat: repeat-x;
  background-size: ${W}px ${H}px;
  background-position: left center;
}
`;

const mainPath = "src/eeveelution-dividers.css";
const main = readFileSync(mainPath, "utf8");
const s = main.indexOf("/* Eevee");
const e = main.indexOf("/* Vaporeon");
writeFileSync(mainPath, main.slice(0, s) + css.trim() + "\n\n" + main.slice(e));
console.log("Eevee crawl paws — highlight steps right (LTR) / left (RTL)");
