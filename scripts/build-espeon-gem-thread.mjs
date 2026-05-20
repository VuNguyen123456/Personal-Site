import { readFileSync, writeFileSync } from "fs";

const S = 4;
const H = 48;
const UNIT = 1000;
const CX = UNIT / 2;
const CY = H / 2;
/** Between 0 (too low) and -4 (too high) — aligns hollow with thread knot */
const GEM_LIFT = -2;

const C = {
  thread: "#ffffff",
  threadSoft: "#f5f0ff",
  gem: "#e73752",
  gemDark: "#a8223a",
  gemBright: "#ff5c7a",
  gemShine: "#ffd4de",
};

/** S-curve through divider center (gem sits on the knot) */
const THREAD_PATH = `M -24 ${CY + 6} C ${UNIT * 0.22} ${CY - 14}, ${UNIT * 0.38} ${CY + 14}, ${CX} ${CY} S ${UNIT * 0.78} ${CY - 12}, ${UNIT + 24} ${CY + 4}`;

/** Simple pixel diamond — hollow center so thread shows through */
function gemRects() {
  const cells = [
    [0, -2, C.gemBright],
    [-1, -1, C.gem],
    [0, -1, C.gemBright],
    [1, -1, C.gem],
    [-1, 0, C.gem],
    [1, 0, C.gem],
    [-1, 1, C.gem],
    [0, 1, C.gem],
    [1, 1, C.gem],
    [0, 2, C.gemDark],
  ];
  return cells
    .map(([dx, dy, fill]) => {
      const x = CX + dx * S;
      const y = CY + GEM_LIFT + dy * S;
      return `<rect x='${x}' y='${y}' width='${S}' height='${S}' fill='${fill}'/>`;
    })
    .join("");
}

function gemShine() {
  return `<g>
    <rect x='${CX - S}' y='${CY + GEM_LIFT - 2 * S}' width='${S}' height='${S}' fill='${C.gemShine}'>
      <animate attributeName='opacity' values='0.35;1;0.35' dur='2.2s' repeatCount='indefinite'/>
    </rect>
    <rect x='${CX + S}' y='${CY + GEM_LIFT - S}' width='${S}' height='${S}' fill='${C.gemShine}'>
      <animate attributeName='opacity' values='0.25;0.9;0.25' dur='2.2s' begin='0.45s' repeatCount='indefinite'/>
    </rect>
  </g>`;
}

function threadLayer() {
  return `<g fill='none' stroke-linecap='round' stroke-linejoin='round'>
    <path d='${THREAD_PATH}' stroke='${C.threadSoft}' stroke-width='4' opacity='0.35'/>
    <path d='${THREAD_PATH}' stroke='${C.thread}' stroke-width='2' stroke-dasharray='10 7'>
      <animate attributeName='stroke-dashoffset' values='0;-34' dur='2.4s' repeatCount='indefinite'/>
    </path>
    <path d='${THREAD_PATH}' stroke='${C.thread}' stroke-width='1' opacity='0.55' stroke-dasharray='4 12'>
      <animate attributeName='stroke-dashoffset' values='0;32' dur='1.6s' repeatCount='indefinite'/>
    </path>
  </g>`;
}

function buildSvg() {
  return `<svg xmlns='http://www.w3.org/2000/svg' width='${UNIT}' height='${H}' viewBox='0 0 ${UNIT} ${H}' preserveAspectRatio='xMidYMid slice' overflow='visible' shape-rendering='geometricPrecision'>${threadLayer()}${gemRects()}${gemShine()}</svg>`;
}

function enc(svg) {
  return encodeURIComponent(svg.replace(/\s+/g, " ").trim());
}

const tileEnc = enc(buildSvg());

const css = `/* Espeon — psychic thread through center gem */
html[data-palette="espeon"] .section-diagonal-gap--crawl-ltr,
html[data-palette="espeon"] .section-diagonal-gap--crawl-rtl {
  image-rendering: auto;
}

html[data-palette="espeon"] .section-diagonal-gap--crawl-ltr,
html[data-palette="espeon"] .section-diagonal-gap--crawl-rtl,
html[data-palette="espeon"] .section-diagonal-gap {
  background-color: var(--palette-divider);
  background-image: url("data:image/svg+xml,${tileEnc}");
  background-repeat: no-repeat;
  background-size: 100% 100%;
  background-position: center;
}
`;

const mainPath = "src/eeveelution-dividers.css";
const main = readFileSync(mainPath, "utf8");
const s = main.indexOf("/* Espeon");
const e = main.indexOf("/* Umbreon");
writeFileSync(mainPath, main.slice(0, s) + css.trim() + "\n\n" + main.slice(e));
console.log("done — Espeon smooth thread + simple gem");
