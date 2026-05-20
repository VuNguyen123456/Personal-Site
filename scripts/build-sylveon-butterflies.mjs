import { readFileSync, writeFileSync } from "fs";

const H = 48;
const UNIT = 1000;
const PAD = 40;
const COUNT = 16;

const C = {
  wing: "#f291a4",
  wingSoft: "#fbcdd2",
  wingBlue: "#97dcfb",
  body: "#6f82b6",
  dot: "#f9ecde",
};

function rects(cells, ox, oy, fill) {
  return cells
    .map(([x, y, w, h]) => {
      const rw = w ?? 4;
      const rh = h ?? 4;
      return `<rect x='${ox + x}' y='${oy + y}' width='${rw}' height='${rh}' fill='${fill}'/>`;
    })
    .join("");
}

const BUTTERFLIES = [
  () =>
    rects(
      [
        [0, 0, 8, 4],
        [8, 0, 8, 4],
        [-4, 4, 8, 4],
        [4, 4, 8, 4],
        [12, 4, 8, 4],
        [4, 8, 4, 4],
        [8, 8, 4, 4],
      ],
      0,
      0,
      C.wing,
    ) +
    rects([[6, 4, 4, 4]], 0, 0, C.body) +
    rects([[2, 2, 4, 4]], 0, 0, C.wingSoft),
  () =>
    rects(
      [
        [4, 0],
        [8, 0],
        [0, 4, 12, 4],
        [12, 4],
        [16, 4],
        [4, 8],
        [8, 8],
      ],
      0,
      0,
      C.wingBlue,
    ) +
    rects([[6, 4, 4, 4]], 0, 0, C.body) +
    rects([[10, 0, 4, 4]], 0, 0, C.wingSoft),
  () =>
    rects(
      [
        [0, 2, 8, 4],
        [8, 2, 8, 4],
        [-4, 6, 8, 4],
        [8, 6, 8, 4],
        [6, 0, 4, 4],
      ],
      0,
      0,
      C.wing,
    ) +
    rects([[4, 6, 4, 4]], 0, 0, C.body) +
    rects([[12, 6, 4, 4]], 0, 0, C.dot),
  () =>
    rects(
      [
        [0, 0],
        [4, 0],
        [8, 0, 8, 4],
        [0, 4, 4, 4],
        [12, 4, 8, 4],
        [4, 8, 8, 4],
      ],
      0,
      0,
      C.wingSoft,
    ) +
    rects([[6, 4, 4, 4]], 0, 0, C.wing) +
    rects([[2, 4, 4, 4]], 0, 0, C.wingBlue),
];

const W = 20;

function mirror(art, faceRight) {
  if (faceRight) return art;
  return `<g transform='scale(-1 1) translate(${-W} 0)'>${art}</g>`;
}

/** Spread value across [min, max] per butterfly index */
function spread(i, min, max, salt = 0) {
  const span = max - min;
  return Math.round(min + ((((i * 41 + salt * 19) % 97) + 1) / 98) * span);
}

/** Midpoint along a segment, biased away from center (t in 0.12–0.88, staggered per i) */
function along(i, x0, y0, x1, y1, salt = 0) {
  const t = 0.12 + (((i * 29 + salt * 11) % 77) / 77) * 0.76;
  return {
    xm: Math.round(x0 + (x1 - x0) * t),
    ym: Math.round(y0 + (y1 - y0) * t),
  };
}

/** 3-point paths — required when keyTimes has 0;0.5;1 (2 points breaks SMIL in bg SVG) */
function flyPath(i) {
  const dur = (5.5 + (i % 9) * 0.5).toFixed(2);
  const begin = ((i * 0.45) % 7).toFixed(2);
  const type = i % 8;
  const yLane = spread(i, 2, H - 14, 1);
  const xLane = spread(i, 40, UNIT - 40, 2);
  const drift = ((i % 5) - 2) * 6;
  const spline =
    "calcMode='spline' keyTimes='0;0.5;1' keySplines='0.35 0 0.65 1;0.35 0 0.65 1'";

  let x0;
  let y0;
  let xm;
  let ym;
  let x1;
  let y1;
  let faceRight = true;
  let mid;

  switch (type) {
    case 0:
      x0 = -PAD;
      y0 = yLane;
      x1 = UNIT + PAD;
      y1 = yLane + drift;
      xm = spread(i, 60, UNIT - 60, 3);
      ym = spread(i, 0, H - 12, 4);
      faceRight = true;
      break;
    case 1:
      x0 = UNIT + PAD;
      y0 = yLane;
      x1 = -PAD;
      y1 = yLane - drift;
      xm = spread(i, 60, UNIT - 60, 5);
      ym = spread(i, 0, H - 12, 6);
      faceRight = false;
      break;
    case 2:
      x0 = xLane;
      y0 = -PAD;
      x1 = xLane + drift;
      y1 = H + PAD;
      xm = x0 + Math.round(drift / 2);
      ym = spread(i, 4, H - 4, 7);
      faceRight = drift >= 0;
      break;
    case 3:
      x0 = xLane;
      y0 = H + PAD;
      x1 = xLane - drift;
      y1 = -PAD;
      xm = x0 - Math.round(drift / 2);
      ym = spread(i, 4, H - 4, 8);
      faceRight = drift < 0;
      break;
    case 4:
      x0 = -PAD;
      y0 = -PAD;
      x1 = UNIT + PAD;
      y1 = H + PAD;
      mid = along(i, x0, y0, x1, y1, 0);
      xm = mid.xm;
      ym = mid.ym;
      faceRight = true;
      break;
    case 5:
      x0 = UNIT + PAD;
      y0 = H + PAD;
      x1 = -PAD;
      y1 = -PAD;
      mid = along(i, x0, y0, x1, y1, 1);
      xm = mid.xm;
      ym = mid.ym;
      faceRight = false;
      break;
    case 6:
      x0 = UNIT + PAD;
      y0 = -PAD;
      x1 = -PAD;
      y1 = H + PAD;
      mid = along(i, x0, y0, x1, y1, 2);
      xm = mid.xm;
      ym = mid.ym;
      faceRight = false;
      break;
    default:
      x0 = -PAD;
      y0 = H + PAD;
      x1 = UNIT + PAD;
      y1 = -PAD;
      mid = along(i, x0, y0, x1, y1, 3);
      xm = mid.xm;
      ym = mid.ym;
      faceRight = true;
      break;
  }

  const values = `${x0} ${y0};${xm} ${ym};${x1} ${y1}`;
  return {
    dur,
    begin,
    faceRight,
    anim: `<animateTransform attributeName='transform' type='translate' values='${values}' dur='${dur}s' begin='${begin}s' repeatCount='indefinite' ${spline}/>`,
  };
}

function wingFlap(i) {
  const dur = (0.5 + (i % 4) * 0.07).toFixed(2);
  const begin = ((i * 0.13) % 0.9).toFixed(2);
  const tilt = i % 2 === 0 ? 4 : -4;
  return `<animateTransform attributeName='transform' type='rotate' values='0;${tilt};0;${-tilt};0' dur='${dur}s' begin='${begin}s' repeatCount='indefinite' keyTimes='0;0.25;0.5;0.75;1'/>`;
}

function butterfly(i) {
  const art = BUTTERFLIES[i % BUTTERFLIES.length]();
  const { anim, faceRight } = flyPath(i);
  const body = mirror(art, faceRight);
  const op = (0.82 + (i % 4) * 0.04).toFixed(2);
  return `<g opacity='${op}'>${anim}<g>${wingFlap(i)}${body}</g></g>`;
}

function buildSvg() {
  const bugs = Array.from({ length: COUNT }, (_, i) => butterfly(i)).join("");
  return `<svg xmlns='http://www.w3.org/2000/svg' width='${UNIT}' height='${H}' viewBox='0 0 ${UNIT} ${H}' preserveAspectRatio='none' overflow='visible' shape-rendering='crispEdges'>${bugs}</svg>`;
}

function enc(svg) {
  return encodeURIComponent(svg.replace(/\s+/g, " ").trim());
}

const tileEnc = enc(buildSvg());

const css = `/* Sylveon — butterflies crossing the divider in many directions */
html[data-palette="sylveon"] .section-diagonal-gap--crawl-ltr,
html[data-palette="sylveon"] .section-diagonal-gap--crawl-rtl {
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}

html[data-palette="sylveon"] .section-diagonal-gap--crawl-ltr,
html[data-palette="sylveon"] .section-diagonal-gap--crawl-rtl,
html[data-palette="sylveon"] .section-diagonal-gap {
  background-color: var(--palette-divider);
  background-image: url("data:image/svg+xml,${tileEnc}");
  background-repeat: no-repeat;
  background-size: 100% 100%;
  background-position: center;
}
`;

const mainPath = "src/eeveelution-dividers.css";
const main = readFileSync(mainPath, "utf8");
const s = main.indexOf("/* Sylveon");
writeFileSync(mainPath, main.slice(0, s) + css.trim() + "\n");
console.log("done —", COUNT, "Sylveon butterflies, full width");
