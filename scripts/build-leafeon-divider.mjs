/**
 * Generates Leafeon divider SVGs (leaves + wind only) and patches eeveelution-dividers.css.
 * Run: node scripts/build-leafeon-divider.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dividersDir = path.join(root, "src", "dividers");
const cssPath = path.join(root, "src", "eeveelution-dividers.css");

const LEAF_SCALE = 0.65;

/** Leaf pixel art — each centered near origin for spin. */
const LEAF_TYPES = [
  () =>
    `<rect x="-4" y="-4" width="4" height="4" fill="#89d89b"/><rect x="0" y="-4" width="4" height="4" fill="#6bc399"/><rect x="-4" y="0" width="4" height="4" fill="#6bc399"/><rect x="0" y="0" width="4" height="4" fill="#4a9a5c"/>`,
  () =>
    `<rect x="-2" y="-8" width="4" height="4" fill="#b68933"/><rect x="-2" y="-4" width="4" height="4" fill="#89d89b"/><rect x="-2" y="0" width="4" height="4" fill="#6bc399"/><rect x="-2" y="4" width="4" height="4" fill="#4a9a5c"/>`,
  () =>
    `<rect x="-6" y="-2" width="4" height="4" fill="#6bc399"/><rect x="-2" y="-4" width="4" height="4" fill="#89d89b"/><rect x="2" y="-2" width="4" height="4" fill="#6bc399"/><rect x="-4" y="2" width="4" height="4" fill="#4a9a5c"/><rect x="0" y="2" width="4" height="4" fill="#89d89b"/>`,
  () =>
    `<rect x="-4" y="-4" width="4" height="4" fill="#e3be66"/><rect x="0" y="-4" width="4" height="4" fill="#d4a84a"/><rect x="-2" y="0" width="4" height="4" fill="#c9913a"/><rect x="-4" y="4" width="4" height="4" fill="#b68933"/>`,
  () =>
    `<rect x="-2" y="-6" width="4" height="4" fill="#a8e8c8"/><rect x="-6" y="-2" width="4" height="4" fill="#6bc399"/><rect x="2" y="-2" width="4" height="4" fill="#89d89b"/><rect x="-2" y="2" width="4" height="4" fill="#4a9a5c"/>`,
  () =>
    `<rect x="-2" y="-2" width="4" height="4" fill="#89d89b"/><rect x="0" y="0" width="4" height="4" fill="#6bc399"/>`,
];

const BAND_W = 1000;
const LEAF_CROSS = BAND_W;
const LEAF_COUNT = 36;
const LEAF_PAD = 60;

/** All leaves enter off-screen left and blow across to off-screen right. */
const LEAF_STREAM = Array.from({ length: LEAF_COUNT }, (_, i) => {
  const dur = 6.5 + (i % 7) * 0.85;
  return {
    y: 4 + ((i * 5) % 34),
    dur,
    begin: (-(i * dur) / LEAF_COUNT).toFixed(3),
    type: i % LEAF_TYPES.length,
    spinTurns: 1.5 + (i % 4) * 0.85,
    wobble: (i % 2 === 0 ? 1 : -1) * (4 + (i % 3) * 2),
  };
});

/** Wind gusts — spread across the full divider width */
const WIND_GUSTS = Array.from({ length: 14 }, (_, i) => ({
  w: 8 + (i % 4) * 2,
  y: 4 + ((i * 7) % 38),
  x: (i * 137) % (BAND_W - 40),
  drift: BAND_W,
  begin: i * 0.4,
  peak: 0.32 + (i % 3) * 0.08,
  leafDur: 6.5 + (i % 7) * 0.85,
}));

function clampY(v) {
  return Math.max(2, Math.min(42, v));
}

const FLOW_SPLINE = "calcMode=\"spline\" keyTimes=\"0;0.5;1\" keySplines=\"0.42 0 0.58 1;0.42 0 0.58 1\"";

/** Steady cross-band drift with a gentle vertical arc (Vaporeon-style flow). */
function blowingLeaf(cfg) {
  const { y, dur, begin, type, direction, spinTurns, wobble } = cfg;
  const fromX = direction > 0 ? -LEAF_PAD : BAND_W + LEAF_PAD;
  const toX = direction > 0 ? BAND_W + LEAF_PAD : -LEAF_PAD;
  const spinEnd = Math.round(spinTurns * 360) * direction;
  const wobbleY = clampY(y + wobble).toFixed(1);

  return `<g opacity="0.94">
  <animateTransform attributeName="transform" type="translate"
    values="${fromX} ${y};${toX} ${y}"
    dur="${dur}s" begin="${begin}s" repeatCount="indefinite" calcMode="linear"/>
  <g>
    <animateTransform attributeName="transform" type="translate" additive="sum"
      values="0 0;0 ${wobbleY - y};0 0"
      dur="${dur}s" begin="${begin}s" repeatCount="indefinite" ${FLOW_SPLINE}/>
    <g>
      <animateTransform attributeName="transform" type="rotate"
        values="0;${spinEnd}"
        dur="${dur}s" begin="${begin}s" repeatCount="indefinite" calcMode="linear"/>
      <g transform="scale(${LEAF_SCALE})">
        ${LEAF_TYPES[type]()}
      </g>
    </g>
  </g>
</g>`;
}

/** Ephemeral wind dash — continuous leaf-speed drift, visible most of the way, fade at end. */
function windGust({ w, y, x, drift, begin, direction, peak, leafDur }) {
  const speed = LEAF_CROSS / leafDur;
  const dur = (drift / speed).toFixed(2);
  const travel = drift * direction;
  const fromX = x;
  const toX = x + travel;
  const hold = (peak * 0.9).toFixed(2);

  return `<g>
  <animateTransform attributeName="transform" type="translate"
    values="${fromX} 0;${toX} 0"
    dur="${dur}s" begin="${begin}s" repeatCount="indefinite" calcMode="linear"/>
  <g opacity="0">
    <animate attributeName="opacity"
      values="0;${peak};${hold};0"
      keyTimes="0;0.1;0.82;1"
      dur="${dur}s" begin="${begin}s" repeatCount="indefinite"
      calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1"/>
    <rect x="0" y="${y}" width="${w}" height="2" fill="#ffffff"/>
  </g>
</g>`;
}

function windStreaks(direction) {
  return WIND_GUSTS.map((gust) => windGust({ ...gust, direction })).join("\n");
}

function buildSvg({ animated, direction }) {
  const leaves = animated ? LEAF_STREAM.map((cfg) => blowingLeaf({ ...cfg, direction })).join("\n") : "";
  const wind = animated ? windStreaks(direction) : "";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="48" viewBox="0 0 1000 48" preserveAspectRatio="xMidYMid slice" overflow="visible" shape-rendering="crispEdges">
${wind}
${leaves}
</svg>`;
}

function encodeSvg(svg) {
  return `url("data:image/svg+xml,${encodeURIComponent(svg.trim())}")`;
}

function patchCss(ltrUrl, rtlUrl, staticUrl) {
  const css = fs.readFileSync(cssPath, "utf8");
  const startMarker = "/* Leafeon —";
  const endMarker = "/* Glaceon —";
  const start = css.indexOf(startMarker);
  const end = css.indexOf(endMarker);
  if (start === -1 || end === -1) {
    throw new Error("Could not find Leafeon/Glaceon markers in eeveelution-dividers.css");
  }

  const replacement = `/* Leafeon — leaves blow and spin with the wind */
html[data-palette="leafeon"] .section-diagonal-gap--crawl-ltr,
html[data-palette="leafeon"] .section-diagonal-gap--crawl-rtl {
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}

html[data-palette="leafeon"] .section-diagonal-gap--crawl-ltr {
  background-color: var(--palette-divider);
  background-image: ${ltrUrl};
  background-repeat: no-repeat;
  background-size: 100% 100%;
  background-position: center;
}

html[data-palette="leafeon"] .section-diagonal-gap--crawl-rtl {
  background-color: var(--palette-divider);
  background-image: ${rtlUrl};
  background-repeat: no-repeat;
  background-size: 100% 100%;
  background-position: center;
}

@media (prefers-reduced-motion: reduce) {
  html[data-palette="leafeon"] .section-diagonal-gap--crawl-ltr,
  html[data-palette="leafeon"] .section-diagonal-gap--crawl-rtl {
    background-image: ${staticUrl};
  }
}

`;

  fs.writeFileSync(cssPath, css.slice(0, start) + replacement + css.slice(end), "utf8");
}

fs.mkdirSync(dividersDir, { recursive: true });

const ltrAnimated = buildSvg({ animated: true, direction: 1 });
const rtlAnimated = buildSvg({ animated: true, direction: -1 });
const staticSvg = buildSvg({ animated: false, direction: 1 });

fs.writeFileSync(path.join(dividersDir, "leafeon-divider-ltr.svg"), ltrAnimated, "utf8");
fs.writeFileSync(path.join(dividersDir, "leafeon-divider-rtl.svg"), rtlAnimated, "utf8");
fs.writeFileSync(path.join(dividersDir, "leafeon-divider-static.svg"), staticSvg, "utf8");

if (fs.existsSync(cssPath)) {
  patchCss(encodeSvg(ltrAnimated), encodeSvg(rtlAnimated), encodeSvg(staticSvg));
  console.log("Leafeon dividers built and CSS patched.");
} else {
  console.log("Leafeon SVGs written (eeveelution-dividers.css not found in this root).");
}
