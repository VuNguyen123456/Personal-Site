import { readFileSync, writeFileSync } from "fs";

const H = 48;
const UNIT = 1000;
const FLOWER_COUNT = 96;
/** Nudge the whole meadow band downward in the divider */
const FIELD_Y_SHIFT = 5;

const C = {
  grass: "#5a9e6e",
  grassHi: "#6bb88a",
  grassLo: "#4a8a5c",
  stem: "#5a9e6e",
  stemDark: "#4a8a5c",
  leaf: "#89d89b",
  petal: "#f291a4",
  petalSoft: "#fbcdd2",
  petalPale: "#ffd4e0",
  ribbon: "#97dcfb",
  center: "#fff8d0",
};

function rects(cells, ox, oy, fill) {
  return cells
    .map(([x, y, w, h]) => {
      const rw = w ?? 2;
      const rh = h ?? 2;
      return `<rect x='${ox + x}' y='${oy + y}' width='${rw}' height='${rh}' fill='${fill}'/>`;
    })
    .join("");
}

function spread(i, min, max, salt = 0) {
  const span = max - min;
  return Math.round(min + ((((i * 41 + salt * 19) % 97) + 1) / 98) * span);
}

function windTiming(id) {
  const dur = (2.6 + (id % 7) * 0.32).toFixed(2);
  const begin = ((id * 0.31) % 3.2).toFixed(2);
  const dir = id % 2 === 0 ? 1 : -1;
  const sway = (1.5 + (id % 4) * 0.6).toFixed(1);
  const drift = 1 + (id % 2);
  return { dur, begin, dir, sway, drift };
}

function windSway(id) {
  const { dur, begin, dir, sway, drift } = windTiming(id);
  const a = (dir * sway).toFixed(1);
  const b = (-dir * sway * 0.5).toFixed(1);
  const dx1 = dir * drift;
  const dx2 = -dir * Math.max(1, drift - 1);
  return (
    `<animateTransform attributeName='transform' type='rotate' values='0;${a};${b};0' ` +
    `dur='${dur}s' begin='${begin}s' repeatCount='indefinite' keyTimes='0;.35;.7;1' ` +
    `calcMode='spline' keySplines='0.45 0 0.55 1;0.45 0 0.55 1;0.45 0 0.55 1'/>` +
    `<animateTransform attributeName='transform' additive='sum' type='translate' values='0 0;${dx1} ${dir > 0 ? -1 : 1};${dx2} 0;0 0' ` +
    `dur='${dur}s' begin='${begin}s' repeatCount='indefinite' keyTimes='0;.4;.75;1' ` +
    `calcMode='spline' keySplines='0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1'/>`
  );
}

/** Grass tufts along the ground */
function grassBed() {
  let out = "";
  for (let x = 0; x < UNIT; x += 4) {
    const n = Math.floor(x / 4) % 5;
    const fill = n === 0 ? C.grassLo : n === 2 ? C.grassHi : C.grass;
    out += rects([[0, 0, 2, 2]], x, H - 4, fill);
    if (n % 2 === 0) {
      out += rects([[2, -2, 2, 2]], x, H - 4, C.grassHi);
    }
  }
  return out;
}

function flowerBody(variant) {
  const stem = rects([[2, 6, 2, 6], [0, 10, 2, 4]], 0, 0, C.stem);
  const leaf = rects([[0, 8, 4, 2], [4, 10, 4, 2]], 0, 0, C.leaf);

  if (variant === 0) {
    return (
      stem +
      leaf +
      rects(
        [
          [0, 2, 2, 2],
          [4, 2, 2, 2],
          [2, 0, 2, 2],
          [0, 4, 2, 2],
          [4, 4, 2, 2],
        ],
        0,
        0,
        C.petal,
      ) +
      rects([[2, 2, 2, 2]], 0, 0, C.center)
    );
  }
  if (variant === 1) {
    return (
      stem +
      rects(
        [
          [1, 0, 4, 2],
          [0, 2, 2, 2],
          [5, 2, 2, 2],
          [2, 4, 2, 2],
        ],
        0,
        0,
        C.petalSoft,
      ) +
      rects([[2, 2, 2, 2]], 0, 0, C.center) +
      rects([[5, 8, 3, 2]], 0, 0, C.leaf)
    );
  }
  if (variant === 2) {
    return (
      rects([[2, 8, 2, 8]], 0, 0, C.stemDark) +
      rects(
        [
          [1, 4, 2, 2],
          [3, 4, 2, 2],
          [2, 2, 2, 2],
        ],
        0,
        0,
        C.petalPale,
      ) +
      rects([[2, 4, 2, 2]], 0, 0, C.center)
    );
  }
  return (
    stem +
    rects(
      [
        [0, 1, 2, 2],
        [4, 1, 2, 2],
        [2, 2, 2, 2],
        [1, 4, 2, 2],
        [3, 4, 2, 2],
      ],
      0,
      0,
      C.petal,
    ) +
    rects([[2, 2, 2, 2]], 0, 0, C.center) +
    rects([[6, 3, 2, 2]], 0, 0, C.ribbon)
  );
}

const PIVOT = { x: 3, y: 14 };

function swayingFlower(x, y, variant, id) {
  const body = flowerBody(variant);
  const { x: px, y: py } = PIVOT;
  return (
    `<g transform='translate(${x} ${y})'>` +
    `<g transform='translate(${px} ${py})'>${windSway(id)}` +
    `<g transform='translate(${-px} ${-py})'>${body}</g></g></g>`
  );
}

function flowerField() {
  const flowers = [];
  for (let i = 0; i < FLOWER_COUNT; i++) {
    const baseX = 4 + Math.floor((i * (UNIT - 12)) / FLOWER_COUNT);
    const x = baseX + spread(i, -3, 3, 10);
    const y = spread(i, 12, H - 18, 11) + (i % 5) - 2 + FIELD_Y_SHIFT;
    flowers.push(swayingFlower(x, y, i % 4, i));
  }
  return flowers.join("");
}

function buildSvg() {
  return (
    `<svg xmlns='http://www.w3.org/2000/svg' width='${UNIT}' height='${H}' ` +
    `viewBox='0 0 ${UNIT} ${H}' preserveAspectRatio='none' overflow='visible' ` +
    `shape-rendering='crispEdges'>${grassBed()}${flowerField()}</svg>`
  );
}

function enc(svg) {
  return encodeURIComponent(svg.replace(/\s+/g, " ").trim());
}

const tileEnc = enc(buildSvg());

const css = `/* Sylveon — flower field swaying in the wind */
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
console.log("done —", FLOWER_COUNT, "Sylveon flowers, wind sway");
