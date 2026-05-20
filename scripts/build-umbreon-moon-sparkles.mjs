import { readFileSync, writeFileSync } from "fs";

const S = 4;
const H = 48;
const UNIT = 1000;
const CX = UNIT / 2;
const CY = H / 2;

const C = {
  void: "#050810",
  voidSoft: "#0a0e2b",
  moonGrey: "#a8a4b8",
  moonLight: "#d8d6e4",
  moonWhite: "#fffef8",
  sparkle: "#fffef8",
  sparkleDim: "#d8d6e4",
};

/** ~20×20px disc: row widths 3-5-5-5-3 */
const MOON_CELLS = [
  [-1, -2, C.moonLight],
  [0, -2, C.moonWhite],
  [1, -2, C.moonLight],
  [-2, -1, C.moonGrey],
  [-1, -1, C.moonLight],
  [0, -1, C.moonWhite],
  [1, -1, C.moonLight],
  [2, -1, C.moonGrey],
  [-2, 0, C.moonGrey],
  [-1, 0, C.moonLight],
  [0, 0, C.moonWhite],
  [1, 0, C.moonLight],
  [2, 0, C.moonGrey],
  [-2, 1, C.moonGrey],
  [-1, 1, C.moonLight],
  [0, 1, C.moonWhite],
  [1, 1, C.moonLight],
  [2, 1, C.moonGrey],
  [-1, 2, C.moonLight],
  [0, 2, C.moonGrey],
  [1, 2, C.moonLight],
];

/** Equal gap from moon bbox to top/bottom of 48px divider */
function moonVerticalLift(cells) {
  let minDy = Infinity;
  let maxDy = -Infinity;
  for (const [, dy] of cells) {
    minDy = Math.min(minDy, dy);
    maxDy = Math.max(maxDy, dy);
  }
  const top = CY + minDy * S;
  const bottom = CY + (maxDy + 1) * S;
  return (H - bottom - top) / 2;
}

const MOON_LIFT = moonVerticalLift(MOON_CELLS);

function rects(cells) {
  return cells
    .map(([x, y, fill]) => `<rect x='${x}' y='${y}' width='${S}' height='${S}' fill='${fill}'/>`)
    .join("");
}

function inBackdrop(px, py) {
  const dx = (px - CX) / S / 10;
  const dy = (py - (CY + MOON_LIFT)) / S / 5;
  return Math.hypot(dx, dy) <= 1.05;
}

function nightBackdrop() {
  const cells = [];
  for (let dx = -10; dx <= 10; dx++) {
    for (let dy = -5; dy <= 5; dy++) {
      const dist = Math.hypot(dx / 10, dy / 5);
      if (dist > 1.05) continue;
      const x = CX + dx * S;
      const y = CY + MOON_LIFT + dy * S;
      cells.push([x, y, dist < 0.55 ? C.void : C.voidSoft]);
    }
  }
  return rects(cells);
}

/** Static pinprick stars inside the night patch */
function nightStars() {
  const parts = [];
  for (let i = 0; i < 24; i++) {
    const dx = ((i * 11 + 3) % 19) - 9;
    const dy = ((i * 7 + 2) % 11) - 5;
    if (Math.hypot(dx / 10, dy / 5) > 0.9) continue;
    const x = CX + dx * S + (i % 3 === 0 ? 1 : 0);
    const y = CY + MOON_LIFT + dy * S + (i % 2);
    if (!inBackdrop(x, y)) continue;
    const op = (0.55 + (i % 4) * 0.12).toFixed(2);
    parts.push(
      `<rect x='${x}' y='${y}' width='1' height='1' fill='${C.moonWhite}' opacity='${op}'/>`,
    );
  }
  return parts.join("");
}

function moonPixels() {
  return MOON_CELLS.map(([dx, dy, fill]) => {
    const x = CX + dx * S;
    const y = CY + MOON_LIFT + dy * S;
    return `<rect x='${x}' y='${y}' width='${S}' height='${S}' fill='${fill}'/>`;
  }).join("");
}

/** 1px white halo just outside the moon silhouette */
function moonOutlineGlow() {
  const keys = new Set(MOON_CELLS.map(([dx, dy]) => `${dx},${dy}`));
  const seen = new Set();
  const parts = [];

  for (const [dx, dy] of MOON_CELLS.map(([x, y]) => [x, y])) {
    const x = CX + dx * S;
    const y = CY + MOON_LIFT + dy * S;
    const edges = [
      [`${dx},${dy - 1}`, x, y - 1, S, 1],
      [`${dx},${dy + 1}`, x, y + S, S, 1],
      [`${dx - 1},${dy}`, x - 1, y, 1, S],
      [`${dx + 1},${dy}`, x + S, y, 1, S],
    ];
    for (const [nKey, ox, oy, w, h] of edges) {
      if (keys.has(nKey)) continue;
      const id = `${ox},${oy},${w},${h}`;
      if (seen.has(id)) continue;
      seen.add(id);
      parts.push(`<rect x='${ox}' y='${oy}' width='${w}' height='${h}' fill='${C.moonWhite}'/>`);
    }
  }

  const ring = parts.join("");
  return (
    `<defs><filter id='uml' x='-70%' y='-70%' width='240%' height='240%'><feGaussianBlur stdDeviation='2'/></filter></defs>` +
    `<g filter='url(#uml)' opacity='0.4'>${ring}</g>` +
    `<g opacity='0.18'>${ring}</g>`
  );
}

function localSparkle(fill, kind) {
  if (kind === "dot") {
    return `<rect x='1' y='1' width='2' height='2' fill='${fill}'/>`;
  }
  return (
    `<rect x='1' y='0' width='2' height='2' fill='${fill}'/>` +
    `<rect x='0' y='1' width='2' height='2' fill='${fill}'/>` +
    `<rect x='2' y='1' width='2' height='2' fill='${fill}'/>` +
    `<rect x='1' y='2' width='2' height='2' fill='${fill}'/>`
  );
}

function sparkleAt(x, y, push, dur, begin, fill, kind) {
  const shape = localSparkle(fill, kind);
  return (
    `<g opacity='0'>${shape}` +
    `<animateTransform attributeName='transform' type='translate' values='${x} ${y};${x + push} ${y};${x} ${y}' dur='${dur}s' begin='${begin}s' repeatCount='indefinite' calcMode='spline' keyTimes='0;0.55;1' keySplines='0.3 0 0.7 1;0.3 0 0.7 1'/>` +
    `<animate attributeName='opacity' values='0;0.9;0' dur='${dur}s' begin='${begin}s' repeatCount='indefinite'/>` +
    `</g>`
  );
}

function innerSparkles() {
  const parts = [];
  for (let i = 0; i < 14; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    const dist = 18 + ((i * 17 + 7) % 62);
    let x = CX + side * dist;
    let y = CY + MOON_LIFT + ((i * 5) % 9) - 4;
    if (!inBackdrop(x, y)) {
      y = CY + MOON_LIFT + ((i * 3) % 7) - 3;
    }
    const push = side * (6 + (i % 4) * 2);
    const dur = (2.4 + (i % 5) * 0.2).toFixed(2);
    const begin = ((i * 0.14) % 2.6).toFixed(2);
    const fill = i % 3 === 0 ? C.sparkleDim : C.sparkle;
    const kind = i % 4 === 0 ? "dot" : "plus";
    parts.push(sparkleAt(x, y, push, dur, begin, fill, kind));
  }
  return parts.join("");
}

function outerSparkles() {
  const parts = [];
  for (let i = 0; i < 22; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    const t = (i * 11) % 100;
    const dist = 92 + Math.floor(Math.pow(t / 100, 1.75) * 380);
    const x = CX + side * dist;
    const y = CY + ((i * 5) % 11) - 5;
    const push = side * (14 + (i % 5) * 3);
    const dur = (2.6 + (i % 7) * 0.25).toFixed(2);
    const begin = ((i * 0.12) % 2.6).toFixed(2);
    const fill = i % 3 === 0 ? C.sparkleDim : C.sparkle;
    const kind = i % 4 === 0 ? "dot" : "plus";
    parts.push(sparkleAt(x, y, push, dur, begin, fill, kind));
  }
  return parts.join("");
}

function buildSvg() {
  return `<svg xmlns='http://www.w3.org/2000/svg' width='${UNIT}' height='${H}' viewBox='0 0 ${UNIT} ${H}' preserveAspectRatio='xMidYMid slice' overflow='visible' shape-rendering='crispEdges'>${outerSparkles()}${nightBackdrop()}${innerSparkles()}${nightStars()}${moonOutlineGlow()}${moonPixels()}</svg>`;
}

function enc(svg) {
  return encodeURIComponent(svg.replace(/\s+/g, " ").trim());
}

const tileEnc = enc(buildSvg());

const css = `/* Umbreon — moon on night patch + outward sparkles */
html[data-palette="umbreon"] .section-diagonal-gap--crawl-ltr,
html[data-palette="umbreon"] .section-diagonal-gap--crawl-rtl {
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}

html[data-palette="umbreon"] .section-diagonal-gap--crawl-ltr,
html[data-palette="umbreon"] .section-diagonal-gap--crawl-rtl,
html[data-palette="umbreon"] .section-diagonal-gap {
  background-color: var(--palette-divider);
  background-image: url("data:image/svg+xml,${tileEnc}");
  background-repeat: no-repeat;
  background-size: 100% 100%;
  background-position: center;
}
`;

const mainPath = "src/eeveelution-dividers.css";
const main = readFileSync(mainPath, "utf8");
const s = main.indexOf("/* Umbreon");
const e = main.indexOf("/* Sylveon");
writeFileSync(mainPath, main.slice(0, s) + css.trim() + "\n\n" + main.slice(e));
console.log("done — Umbreon moon + sparkles");
