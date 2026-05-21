import { readFileSync, writeFileSync } from "fs";

/** Divider strip: 48px tall, full viewport width. Keep square pixels via slice (not stretch). */
const H = 48;
const W = 1000;
const PX = 4;
const CX = W / 2;
const CY = H / 2;
const MOON_KEEP = 22;

const C = {
  void: "#050810",
  voidDeep: "#03050c",
  voidSoft: "#0a0e2b",
  moonShadow: "#9a96a8",
  moonBase: "#c4c0d2",
  moonLit: "#dad6ea",
  moonBright: "#ebe8f4",
  moonPeak: "#f4f2f8",
  moonRim: "#706c7c",
  starWhite: "#fffef8",
  starGold: "#f5d76e",
  starGoldSoft: "#d4b04a",
  starBlue: "#a8c8e8",
  starPink: "#e8b0d8",
};

const TWINKLE =
  "calcMode='spline' keyTimes='0;0.5;1' keySplines='0.42 0 0.58 1;0.42 0 0.58 1'";

/** ~5×5 smooth circle: body (d²≤5) + edge band (d²≤8) + soft rim (d² 9–11). */
function moonDist2(dx, dy) {
  return dx * dx + dy * dy;
}

/** Gentle top-left light only — no per-cell blotches. */
function moonBodyFill(dx, dy, d2) {
  const lit = -dx * 0.45 - dy * 0.55;
  if (d2 <= 2) return lit > 0.3 ? C.moonPeak : C.moonBright;
  if (d2 <= 4) return lit > -0.2 ? C.moonBright : C.moonLit;
  if (d2 <= 5) return lit > 0 ? C.moonLit : C.moonBase;
  return C.moonBase;
}

const MOON = [];
const MOON_SOFT = [];

for (let dy = -2; dy <= 2; dy++) {
  for (let dx = -2; dx <= 2; dx++) {
    const d2 = moonDist2(dx, dy);
    if (d2 <= 5) {
      MOON.push([dx, dy, moonBodyFill(dx, dy, d2)]);
    } else if (d2 <= 8) {
      MOON.push([dx, dy, d2 <= 7 ? C.moonShadow : C.moonRim]);
    }
  }
}

for (let dy = -3; dy <= 3; dy++) {
  for (let dx = -3; dx <= 3; dx++) {
    const d2 = moonDist2(dx, dy);
    if (d2 >= 9 && d2 <= 11) {
      MOON_SOFT.push([dx, dy]);
    }
  }
}

/** Two soft craters + one highlight fleck. */
const CRATER_PITS = [
  [0, -1, 2, 2, 2, 2, C.moonShadow],
  [-1, 0, 2, 2, 2, 2, C.moonShadow],
];

const HIGHLIGHTS = [[0, -1, 1, 1, C.moonPeak]];

function moonAnchor() {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  const all = [...MOON.map(([dx, dy]) => [dx, dy]), ...MOON_SOFT];
  for (const [dx, dy] of all) {
    minX = Math.min(minX, dx);
    maxX = Math.max(maxX, dx);
    minY = Math.min(minY, dy);
    maxY = Math.max(maxY, dy);
  }
  return {
    ox: CX - ((minX + maxX + 1) / 2) * PX,
    oy: CY - ((minY + maxY + 1) / 2) * PX,
  };
}

const MOON_POS = moonAnchor();

function rnd(i, salt, min, max) {
  const n = ((i * 7919 + salt * 104729) >>> 0) % 10007;
  return min + (n % (max - min + 1));
}

function nearMoon(x, y) {
  return Math.hypot(x - CX, y - CY) < MOON_KEEP;
}

function nightSky() {
  let s = `<rect x='0' y='0' width='${W}' height='${H}' fill='${C.void}'/>`;
  for (let y = 0; y < H; y += 4) {
    for (let x = 0; x < W; x += 4) {
      const i = x / 4 + (y / 4) * (W / 4);
      if (rnd(i, 1, 0, 5) !== 0) continue;
      if (nearMoon(x + 2, y + 2, 0)) continue;
      s += `<rect x='${x}' y='${y}' width='2' height='2' fill='${rnd(i, 2, 0, 1) ? C.voidSoft : C.voidDeep}'/>`;
    }
  }
  return s;
}

function starColor(i) {
  const r = rnd(i, 5, 0, 99);
  if (r < 65) return C.starWhite;
  if (r < 82) return r % 2 ? C.starGold : C.starGoldSoft;
  if (r < 92) return C.starBlue;
  return C.starPink;
}

function twinkle(i, peak) {
  const dur = (2 + (rnd(i, 3, 0, 40) / 20)).toFixed(2);
  const begin = (rnd(i, 4, 0, 280) / 100).toFixed(2);
  const lo = (peak * 0.12).toFixed(2);
  const hi = peak.toFixed(2);
  return (
    `<animate attributeName='opacity' values='${lo};${hi};${lo}' dur='${dur}s' ` +
    `begin='${begin}s' repeatCount='indefinite' ${TWINKLE}/>`
  );
}

function starGfx(x, y, kind, fill) {
  if (kind === 1) {
    return (
      `<rect x='${x}' y='${y - 1}' width='1' height='3' fill='${fill}'/>` +
      `<rect x='${x - 1}' y='${y}' width='3' height='1' fill='${fill}'/>`
    );
  }
  if (kind === 2) {
    return (
      `<rect x='${x}' y='${y}' width='2' height='2' fill='${fill}' opacity='0.9'/>` +
      `<rect x='${x}' y='${y - 1}' width='2' height='1' fill='${fill}' opacity='0.45'/>`
    );
  }
  return `<rect x='${x}' y='${y}' width='1' height='1' fill='${fill}'/>`;
}

function stars() {
  const used = new Set();
  const out = [];
  let n = 0;
  for (let slot = 0; n < 90 && slot < 500; slot++) {
    const x = rnd(slot, 10, 3, W - 4);
    const y = rnd(slot, 11, 3, H - 4);
    const key = `${x >> 2},${y >> 2}`;
    if (used.has(key) || nearMoon(x, y)) continue;
    used.add(key);
    n++;
    const peak = 0.45 + rnd(n, 12, 0, 50) / 100;
    const kind = rnd(n, 13, 0, 2);
    out.push(
      `<g opacity='${peak.toFixed(2)}'>${starGfx(x, y, kind, starColor(n))}${twinkle(n, peak)}</g>`,
    );
  }
  return out.join("");
}

function moonGlow() {
  const keySet = new Set([
    ...MOON.map(([dx, dy]) => `${dx},${dy}`),
    ...MOON_SOFT.map(([dx, dy]) => `${dx},${dy}`),
  ]);
  const ring = [];
  const seen = new Set();

  for (const [dx, dy] of [
    ...MOON.map(([x, y]) => [x, y]),
    ...MOON_SOFT.map(([x, y]) => [x, y]),
  ]) {
    const bx = MOON_POS.ox + dx * PX;
    const by = MOON_POS.oy + dy * PX;
    const edges = [
      [`${dx},${dy - 1}`, bx, by - 1, PX, 1],
      [`${dx},${dy + 1}`, bx, by + PX, PX, 1],
      [`${dx - 1},${dy}`, bx - 1, by, 1, PX],
      [`${dx + 1},${dy}`, bx + PX, by, 1, PX],
    ];
    for (const [nk, x, y, w, h] of edges) {
      if (keySet.has(nk)) continue;
      const id = `${x},${y}`;
      if (seen.has(id)) continue;
      seen.add(id);
      ring.push(`<rect x='${x}' y='${y}' width='${w}' height='${h}' fill='${C.moonPeak}'/>`);
    }
  }

  const r = ring.join("");
  const pulse =
    `<animate attributeName='opacity' values='0.35;0.9;0.35' dur='5.5s' repeatCount='indefinite' ${TWINKLE}/>`;

  return (
    `<defs>` +
    `<filter id='um-glow' x='-100%' y='-100%' width='300%' height='300%'>` +
    `<feMorphology operator='dilate' radius='1.2' in='SourceGraphic' result='d'/><feGaussianBlur in='d' stdDeviation='3.5'/>` +
    `</filter>` +
    `<filter id='um-halo' x='-150%' y='-150%' width='400%' height='400%'>` +
    `<feMorphology operator='dilate' radius='2' in='SourceGraphic' result='d'/><feGaussianBlur in='d' stdDeviation='7'/>` +
    `</filter>` +
    `</defs>` +
    `<g>${pulse}<g filter='url(#um-halo)' opacity='0.4'>${r}</g>` +
    `<g filter='url(#um-glow)' opacity='0.7'>${r}</g></g>`
  );
}

function moonRect(dx, dy, ox, oy, w, h, fill, opacity) {
  const x = MOON_POS.ox + dx * PX + ox;
  const y = MOON_POS.oy + dy * PX + oy;
  const op = opacity != null ? ` opacity='${opacity}'` : "";
  return `<rect x='${x}' y='${y}' width='${w}' height='${h}' fill='${fill}'${op}/>`;
}

function moonDraw() {
  const soft = MOON_SOFT.map(([dx, dy]) =>
    moonRect(dx, dy, 0, 0, PX, PX, C.moonRim, "0.5"),
  ).join("");
  const body = MOON.map(([dx, dy, fill]) => moonRect(dx, dy, 0, 0, PX, PX, fill)).join("");
  const pits = CRATER_PITS.map(([dx, dy, ox, oy, w, h, fill]) =>
    moonRect(dx, dy, ox, oy, w, h, fill),
  ).join("");
  const highlights = HIGHLIGHTS.map(([dx, dy, ox, oy, fill]) =>
    moonRect(dx, dy, ox, oy, 1, 1, fill, "0.75"),
  ).join("");
  return `${moonGlow()}${soft}${body}${pits}${highlights}`;
}

function buildSvg() {
  return (
    `<svg xmlns='http://www.w3.org/2000/svg' width='${W}' height='${H}' ` +
    `viewBox='0 0 ${W} ${H}' preserveAspectRatio='xMidYMid slice' overflow='visible' ` +
    `shape-rendering='crispEdges'>${nightSky()}${stars()}${moonDraw()}</svg>`
  );
}

function enc(svg) {
  return encodeURIComponent(svg.replace(/\s+/g, " ").trim());
}

const tileEnc = enc(buildSvg());

const css = `/* Umbreon — night sky; square pixels (slice, not stretch) */
html[data-palette="umbreon"] .section-diagonal-gap--crawl-ltr,
html[data-palette="umbreon"] .section-diagonal-gap--crawl-rtl {
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}

html[data-palette="umbreon"] .section-diagonal-gap--crawl-ltr,
html[data-palette="umbreon"] .section-diagonal-gap--crawl-rtl,
html[data-palette="umbreon"] .section-diagonal-gap {
  background-color: ${C.void};
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
console.log("done — Umbreon divider (proportional slice)");
