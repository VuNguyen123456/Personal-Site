import { readFileSync, writeFileSync } from "fs";

const S = 4;
/** Taller tile so cover crop does not flatten the oval top/bottom */
const H = 64;
const UNIT = 1000;
const CX = UNIT / 2;
const CY = H / 2;

const C = {
  void: "#050810",
  voidSoft: "#0a0e2b",
  moonDark: "#b8b4c8",
  moonDim: "#ccc8d8",
  moonGrey: "#dcd8e8",
  moonLight: "#ebe8f4",
  moonPale: "#f4f2fa",
  moonWhite: "#fffef8",
  starWhite: "#fffef8",
  starGold: "#f5d76e",
  starGoldSoft: "#e8c04a",
  starBlue: "#b8d4f0",
  starPink: "#f0c8e8",
  starLavender: "#d8d0f8",
  fieldStar: "#1a1408",
  fieldStarSoft: "#2e2818",
  fieldStarWarm: "#241c10",
  fieldStarGlow: "#5a4520",
};

/** ~20×20px disc: row widths 3-5-5-5-3 — mottled fills, not a clean gradient */
const MOON_CELLS = [
  [-1, -2, C.moonDim],
  [0, -2, C.moonPale],
  [1, -2, C.moonGrey],
  [-2, -1, C.moonDark],
  [-1, -1, C.moonGrey],
  [0, -1, C.moonLight],
  [1, -1, C.moonDim],
  [2, -1, C.moonDark],
  [-2, 0, C.moonDim],
  [-1, 0, C.moonGrey],
  [0, 0, C.moonPale],
  [1, 0, C.moonGrey],
  [2, 0, C.moonDim],
  [-2, 1, C.moonDark],
  [-1, 1, C.moonDim],
  [0, 1, C.moonGrey],
  [1, 1, C.moonLight],
  [2, 1, C.moonDim],
  [-1, 2, C.moonGrey],
  [0, 2, C.moonDark],
  [1, 2, C.moonDim],
];

/** 2×2 crater dimples on the face (ox, oy within each 4×4 cell) */
const MOON_CRATERS = [
  [0, -1, 2, 1],
  [-1, 0, 0, 2],
  [1, 0, 1, 3],
  [0, 1, 2, 0],
  [-2, 1, 2, 2],
  [2, -1, 0, 1],
];

/** Place moon so its bbox center matches divider center (CX, CY) */
function moonBBoxMid(cells) {
  let minDx = Infinity;
  let maxDx = -Infinity;
  let minDy = Infinity;
  let maxDy = -Infinity;
  for (const [dx, dy] of cells) {
    minDx = Math.min(minDx, dx);
    maxDx = Math.max(maxDx, dx);
    minDy = Math.min(minDy, dy);
    maxDy = Math.max(maxDy, dy);
  }
  return {
    midDx: (minDx + maxDx + 1) / 2,
    midDy: (minDy + maxDy + 1) / 2,
  };
}

const { midDx: MOON_MID_DX, midDy: MOON_MID_DY } = moonBBoxMid(MOON_CELLS);
const MOON_OX = CX - MOON_MID_DX * S;
const MOON_OY = CY - MOON_MID_DY * S;

/** Compact night oval — ~90% at dim; shorter vertically so it stays oval under cover */
const SKY_DX_MAX = 12;
const SKY_DY_MAX = 4;
const SKY_R_MIN = 0.9;
const SKY_R_MAX = 1;
const SKY_FS = 2;
const SKY_WAVE_SPREAD = 0.94;
const SKY_EDGE_RAMP = 0.018;

/** Shared slow breathe — glow opacity + sky stretch (snap expand & shrink) */
const BREATHE_DUR = "5.5s";
const BREATHE_SPLINE =
  "calcMode='spline' keyTimes='0;0.5;1' keySplines='0.42 0 0.58 1;0.42 0 0.58 1'";

function skyNormDist(dx, dy) {
  return Math.hypot(dx / SKY_DX_MAX, dy / SKY_DY_MAX);
}

/** 0 = inside min patch (always on); 1 = outer edge at peak glow */
function skyRevealK(d) {
  return (d - SKY_R_MIN) / (SKY_R_MAX - SKY_R_MIN);
}

function skyWavePhase(k, normDx, normDy) {
  const dist = Math.min(k, 0.99);
  const jitter = ((Math.atan2(normDy, normDx) / Math.PI + 1) * 0.004);
  const hash = ((((normDx * 17 + normDy * 29) % 1) + 1) % 1) * 0.008;
  return Math.min(dist ** 0.65 + jitter + hash, 0.998);
}

/** Soft wave on thin rim — inside-out expand, outside-in shrink */
function skyRevealAnim(k, onOpacity = "1", normDx = 0, normDy = 0) {
  if (k <= 0) return "";
  const phase = skyWavePhase(k, normDx, normDy);
  const half = 0.5 * SKY_WAVE_SPREAD;
  const tIn = half * phase;
  const tOut = 1 - half * phase;
  const tIn0 = Math.max(0, tIn - SKY_EDGE_RAMP).toFixed(4);
  const tIn1 = tIn.toFixed(4);
  const tOut0 = tOut.toFixed(4);
  const tOut1 = Math.min(1, tOut + SKY_EDGE_RAMP).toFixed(4);
  return (
    `<animate attributeName='opacity' values='0;0;${onOpacity};${onOpacity};0;0' ` +
    `keyTimes='0;${tIn0};${tIn1};${tOut0};${tOut1};1' dur='${BREATHE_DUR}' repeatCount='indefinite' calcMode='linear'/>`
  );
}

function nightBackdropCells() {
  const parts = [];
  const halfX = SKY_DX_MAX * S;
  const halfY = SKY_DY_MAX * S;
  for (let ox = -halfX; ox < halfX; ox += SKY_FS) {
    for (let oy = -halfY; oy < halfY; oy += SKY_FS) {
      const dx = (ox + SKY_FS / 2) / S;
      const dy = (oy + SKY_FS / 2) / S;
      const d = skyNormDist(dx, dy);
      if (d > SKY_R_MAX) continue;
      const x = CX + ox;
      const y = CY + oy;
      const k = skyRevealK(d);
      const fill = d < 0.44 ? C.void : C.voidSoft;
      const anim = skyRevealAnim(k, "1", dx, dy);
      if (!anim) {
        parts.push(
          `<rect x='${x}' y='${y}' width='${SKY_FS}' height='${SKY_FS}' fill='${fill}'/>`,
        );
        continue;
      }
      parts.push(
        `<rect x='${x}' y='${y}' width='${SKY_FS}' height='${SKY_FS}' fill='${fill}' opacity='0'>${anim}</rect>`,
      );
    }
  }
  return parts.join("");
}

/** Mostly white; occasional gold + soft accent tints */
function starColor(i) {
  const roll = (i * 17 + 5) % 100;
  if (roll < 70) return C.starWhite;
  if (roll < 86) return i % 2 === 0 ? C.starGold : C.starGoldSoft;
  if (roll < 92) return C.starBlue;
  if (roll < 96) return C.starPink;
  return C.starLavender;
}

function starSparkleAnim(i, baseOp) {
  const dur = (2.4 + (i % 7) * 0.3).toFixed(2);
  const begin = ((i * 0.19) % 2.8).toFixed(2);
  const lo = (Number(baseOp) * 0.3).toFixed(2);
  const hi = baseOp;
  return (
    `<animate attributeName='opacity' values='${lo};${hi};${lo}' dur='${dur}s' begin='${begin}s' ` +
    `repeatCount='indefinite' calcMode='spline' keyTimes='0;0.5;1' keySplines='0.42 0 0.58 1;0.42 0 0.58 1'/>`
  );
}

function nightStarsCells() {
  const parts = [];
  for (let i = 0; i < 44; i++) {
    const dx = ((i * 11 + 3) % 25) - 12;
    const dy = ((i * 7 + 2) % 13) - 6;
    const d = skyNormDist(dx, dy);
    if (d > SKY_R_MAX - 0.04) continue;
    const x = CX + dx * S + (i % 3 === 0 ? 1 : 0);
    const y = CY + dy * S + (i % 2);
    const op = (0.55 + (i % 4) * 0.12).toFixed(2);
    const k = skyRevealK(d);
    const reveal = skyRevealAnim(k, "1", dx, dy);
    const twinkle = starSparkleAnim(i, op);
    const fill = starColor(i);
    const star =
      i % 5 === 0
        ? `<rect x='${x}' y='${y - 1}' width='1' height='3' fill='${fill}'/>` +
          `<rect x='${x - 1}' y='${y}' width='3' height='1' fill='${fill}'/>`
        : `<rect x='${x}' y='${y}' width='1' height='1' fill='${fill}'/>`;
    if (!reveal) {
      parts.push(`<g opacity='${op}'>${star}${twinkle}</g>`);
      continue;
    }
    parts.push(`<g opacity='0'>${reveal}<g opacity='${op}'>${star}${twinkle}</g></g>`);
  }
  return parts.join("");
}

function nightSkyPatch() {
  return nightBackdropCells() + nightStarsCells();
}

function fieldStarColor(i) {
  const roll = (i * 23 + 9) % 100;
  if (roll < 75) return C.fieldStar;
  if (roll < 90) return C.fieldStarSoft;
  return C.fieldStarWarm;
}

function fieldStarSparkleAnim(i, baseOp) {
  const dur = (3.1 + (i % 6) * 0.35).toFixed(2);
  const begin = ((i * 0.21) % 3.2).toFixed(2);
  const lo = (Number(baseOp) * 0.2).toFixed(2);
  const hi = baseOp;
  return (
    `<animate attributeName='opacity' values='${lo};${hi};${lo}' dur='${dur}s' begin='${begin}s' ` +
    `repeatCount='indefinite' calcMode='spline' keyTimes='0;0.5;1' keySplines='0.42 0 0.58 1;0.42 0 0.58 1'/>`
  );
}

/** Soft warm halo — ~1 in 4 field stars */
function fieldStarGlowAnim(i) {
  const dur = (3.1 + (i % 6) * 0.35).toFixed(2);
  const begin = ((i * 0.21) % 3.2).toFixed(2);
  return (
    `<animate attributeName='opacity' values='0.06;0.38;0.06' dur='${dur}s' begin='${begin}s' ` +
    `repeatCount='indefinite' calcMode='spline' keyTimes='0;0.5;1' keySplines='0.42 0 0.58 1;0.42 0 0.58 1'/>`
  );
}

/** Dark pinpricks on the yellow divider — outside the night oval */
function fieldStarsCells() {
  const parts = [];
  let n = 0;
  for (let i = 0; n < 56 && i < 200; i++) {
    let px;
    let py;
    const band = i % 3;
    if (band === 0) {
      const side = i % 2 === 0 ? -1 : 1;
      px = CX + side * (58 + ((i * 37 + 17) % 430));
      py = CY + (((i * 19 + 3) % 27) - 13);
    } else if (band === 1) {
      px = 20 + ((i * 41 + 11) % (UNIT - 40));
      py = CY + (((i * 11 + 7) % 23) - 11);
    } else {
      px = CX + (((i * 13 + 5) % 34) - 17);
      py = CY + (((i * 9 + 2) % 20) - 10);
    }
    const dx = (px - CX) / S;
    const dy = (py - CY) / S;
    if (skyNormDist(dx, dy) <= SKY_R_MAX + 0.05) continue;
    if (Math.abs(px - CX) < 28 && Math.abs(py - CY) < 16) continue;

    const x = Math.round(px);
    const y = Math.round(py);
    const op = (0.5 + (n % 5) * 0.1).toFixed(2);
    const fill = fieldStarColor(n);
    const twinkle = fieldStarSparkleAnim(n, op);
    const star =
      n % 7 === 0
        ? `<rect x='${x}' y='${y - 1}' width='1' height='3' fill='${fill}'/>` +
          `<rect x='${x - 1}' y='${y}' width='3' height='1' fill='${fill}'/>`
        : `<rect x='${x}' y='${y}' width='1' height='1' fill='${fill}'/>`;
    if (n % 4 === 0) {
      const glow = `<rect x='${x - 1}' y='${y - 1}' width='3' height='3' fill='${C.fieldStarGlow}' opacity='0'>${fieldStarGlowAnim(n)}</rect>`;
      parts.push(`<g>${glow}<g opacity='${op}'>${star}${twinkle}</g></g>`);
    } else {
      parts.push(`<g opacity='${op}'>${star}${twinkle}</g>`);
    }
    n++;
  }
  return parts.join("");
}

function moonPixels() {
  return MOON_CELLS.map(([dx, dy, fill]) => {
    const x = MOON_OX + dx * S;
    const y = MOON_OY + dy * S;
    return `<rect x='${x}' y='${y}' width='${S}' height='${S}' fill='${fill}'/>`;
  }).join("");
}

function moonCraters() {
  return MOON_CRATERS.map(([dx, dy, ox, oy]) => {
    const x = MOON_OX + dx * S + ox;
    const y = MOON_OY + dy * S + oy;
    return `<rect x='${x}' y='${y}' width='2' height='2' fill='${C.moonDark}'/>`;
  }).join("");
}

/** Soft bright flecks (not uniform shine) */
function moonFlecks() {
  const flecks = [
    [1, -2, 1, 1],
    [-1, -1, 3, 0],
    [0, 0, 0, 1],
    [2, 0, 1, 2],
  ];
  return flecks
    .map(([dx, dy, ox, oy]) => {
      const x = MOON_OX + dx * S + ox;
      const y = MOON_OY + dy * S + oy;
      return `<rect x='${x}' y='${y}' width='1' height='1' fill='${C.moonWhite}' opacity='0.7'/>`;
    })
    .join("");
}

/** Radiating white glow — multi-layer blur + soft pulse (flickering light) */
function moonOutlineGlow() {
  const keys = new Set(MOON_CELLS.map(([dx, dy]) => `${dx},${dy}`));
  const seen = new Set();
  const parts = [];

  for (const [dx, dy] of MOON_CELLS.map(([x, y]) => [x, y])) {
    const x = MOON_OX + dx * S;
    const y = MOON_OY + dy * S;
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
  const layer = (filterId, opacity) =>
    `<g filter='url(#${filterId})' opacity='${opacity}'>${ring}</g>`;

  const flicker = `<animate attributeName='opacity' values='0.22;1;0.22' dur='${BREATHE_DUR}' repeatCount='indefinite' ${BREATHE_SPLINE}/>`;

  return (
    `<defs>` +
    `<filter id='uml-near' x='-90%' y='-90%' width='280%' height='280%'>` +
    `<feMorphology operator='dilate' radius='1' in='SourceGraphic' result='m'/><feGaussianBlur in='m' stdDeviation='2.5'/>` +
    `</filter>` +
    `<filter id='uml-mid' x='-130%' y='-130%' width='360%' height='360%'>` +
    `<feMorphology operator='dilate' radius='2' in='SourceGraphic' result='m'/><feGaussianBlur in='m' stdDeviation='5.5'/>` +
    `</filter>` +
    `<filter id='uml-far' x='-170%' y='-170%' width='440%' height='440%'>` +
    `<feMorphology operator='dilate' radius='3' in='SourceGraphic' result='m'/><feGaussianBlur in='m' stdDeviation='9'/>` +
    `</filter>` +
    `<filter id='uml-haze' x='-220%' y='-220%' width='540%' height='540%'>` +
    `<feMorphology operator='dilate' radius='4' in='SourceGraphic' result='m'/><feGaussianBlur in='m' stdDeviation='14'/>` +
    `</filter>` +
    `</defs>` +
    `<g>${flicker}` +
    layer("uml-haze", "0.5") +
    layer("uml-far", "0.65") +
    layer("uml-mid", "0.8") +
    layer("uml-near", "1") +
    `</g>`
  );
}

function buildSvg() {
  return `<svg xmlns='http://www.w3.org/2000/svg' width='${UNIT}' height='${H}' viewBox='0 0 ${UNIT} ${H}' preserveAspectRatio='xMidYMid slice' overflow='visible' shape-rendering='crispEdges'>${fieldStarsCells()}${nightSkyPatch()}${moonOutlineGlow()}${moonPixels()}${moonCraters()}${moonFlecks()}</svg>`;
}

function enc(svg) {
  return encodeURIComponent(svg.replace(/\s+/g, " ").trim());
}

const tileEnc = enc(buildSvg());

const css = `/* Umbreon — moon on breathing night patch */
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
  background-size: cover;
  background-position: center;
}
`;

const mainPath = "src/eeveelution-dividers.css";
const main = readFileSync(mainPath, "utf8");
const s = main.indexOf("/* Umbreon");
const e = main.indexOf("/* Sylveon");
writeFileSync(mainPath, main.slice(0, s) + css.trim() + "\n\n" + main.slice(e));
console.log("done — Umbreon moon + night sky");
