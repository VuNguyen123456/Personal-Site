import { readFileSync, writeFileSync } from "fs";

const H = 48;
const UNIT = 1000;
const LEFT = 8;
const RIGHT = UNIT - 8;
const FLAKE_COUNT = 56;

const C = {
  snow: "#ffffff",
  snowSoft: "#f4fcff",
  snowDim: "#e8f6fa",
};

function flake(i) {
  const span = RIGHT - LEFT;
  const x0 = Math.round(LEFT + ((i * 17 + 7) % (span + 1)));
  const size = 2 + (i % 3);
  const dur = (2.4 + (i % 8) * 0.32).toFixed(2);
  const begin = ((i * 0.21) % 3.6).toFixed(2);
  const opacity = (0.5 + (i % 5) * 0.1).toFixed(2);
  const fill = i % 7 === 0 ? C.snowSoft : i % 11 === 0 ? C.snowDim : C.snow;
  const yStart = -size - 4;
  const yEnd = H + size + 4;
  const drift = ((i % 5) - 2) * 1.5;
  const x1 = Math.round(x0 + drift);
  const spline = "calcMode='spline' keyTimes='0;1' keySplines='0.3 0 0.7 1'";

  return `<rect x='${x0}' y='${yStart}' width='${size}' height='${size}' fill='${fill}' opacity='${opacity}' shape-rendering='crispEdges'><animate attributeName='y' values='${yStart};${yEnd}' dur='${dur}s' begin='${begin}s' repeatCount='indefinite' ${spline}/><animate attributeName='x' values='${x0};${x1};${x0}' dur='${dur}s' begin='${begin}s' repeatCount='indefinite' keyTimes='0;.5;1' calcMode='spline' keySplines='0.4 0 0.6 1;0.4 0 0.6 1'/></rect>`;
}

function buildSvg() {
  const flakes = Array.from({ length: FLAKE_COUNT }, (_, i) => flake(i)).join("");
  return `<svg xmlns='http://www.w3.org/2000/svg' width='${UNIT}' height='${H}' viewBox='0 0 ${UNIT} ${H}' preserveAspectRatio='xMidYMid slice' overflow='visible' shape-rendering='crispEdges'>${flakes}</svg>`;
}

function enc(svg) {
  return encodeURIComponent(svg.replace(/\s+/g, " ").trim());
}

const tileEnc = enc(buildSvg());

const css = `/* Glaceon — snowflakes (white dots) falling top to bottom, full width */
html[data-palette="glaceon"] .section-diagonal-gap--crawl-ltr,
html[data-palette="glaceon"] .section-diagonal-gap--crawl-rtl {
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}

html[data-palette="glaceon"] .section-diagonal-gap--crawl-ltr,
html[data-palette="glaceon"] .section-diagonal-gap--crawl-rtl {
  background-color: var(--palette-divider);
  background-image: url("data:image/svg+xml,${tileEnc}");
  background-repeat: no-repeat;
  background-size: 100% 100%;
  background-position: center;
}
`;

const mainPath = "src/eeveelution-dividers.css";
const main = readFileSync(mainPath, "utf8");
const s = main.indexOf("/* Glaceon");
const e = main.indexOf("/* Espeon");
writeFileSync(mainPath, main.slice(0, s) + css.trim() + "\n\n" + main.slice(e));
console.log("done —", FLAKE_COUNT, "falling snowflakes, full width");
