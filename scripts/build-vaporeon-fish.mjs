import { readFileSync, writeFileSync } from "fs";

const H = 48;
const UNIT = 1000;
const FISH_COUNT = 22;

const C = {
  deep: "#336e8c",
  mid: "#5a9eb8",
  fin: "#8b647d",
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

/** Fish art in local coords (0,0); faces right */
const FISH = [
  () =>
    rects(
      [
        [0, 2],
        [4, 0, 12, 4],
        [4, 4, 12, 4],
        [16, 2],
        [20, 0],
        [20, 4],
      ],
      0,
      0,
      C.deep,
    ),
  () =>
    rects(
      [
        [0, 2, 8, 4],
        [0, 6, 8, 4],
        [8, 4],
        [4, 0],
      ],
      0,
      0,
      C.fin,
    ),
  () =>
    rects(
      [
        [0, 1, 20, 2],
        [20, 0, 4, 2],
        [24, 1, 4, 2],
        [20, 3, 4, 2],
        [24, 4, 4, 2],
      ],
      0,
      0,
      C.deep,
    ),
  () =>
    rects(
      [
        [4, 4],
        [0, 6, 8, 4],
        [8, 6],
        [4, 2],
        [8, 0],
        [0, 0],
      ],
      0,
      0,
      C.mid,
    ),
  () =>
    rects(
      [
        [0, 0, 6, 4],
        [6, 2, 10, 4],
        [16, 0],
        [16, 4],
        [20, 2],
      ],
      0,
      0,
      C.deep,
    ),
  () =>
    rects(
      [
        [0, 4, 12, 6],
        [4, 0],
        [8, 0],
        [12, 2],
      ],
      0,
      0,
      C.fin,
    ),
  () =>
    rects(
      [
        [0, 2, 8, 4],
        [8, 0],
        [8, 4],
        [12, 2],
        [0, 6, 4, 2],
      ],
      0,
      0,
      C.deep,
    ),
  () =>
    rects(
      [
        [0, 1, 6, 2],
        [6, 0, 4, 2],
        [6, 3, 4, 2],
      ],
      0,
      0,
      C.mid,
    ),
];

function swimPath(i, toRight) {
  const dur = (9 + (i % 7) * 1.4).toFixed(2);
  const begin = ((i * 0.62) % 7.5).toFixed(2);
  const y = 6 + (i % 9) * 4 + (i % 3);
  const wobble = (i % 2 === 0 ? 1 : -1);
  const start = toRight ? -48 - (i % 6) * 28 : UNIT + 48 + (i % 6) * 28;
  const end = toRight ? UNIT + 48 : -48;
  const mid = ((start + end) / 2).toFixed(0);
  const y1 = y;
  const y2 = y + wobble;
  const spline = "calcMode='spline' keyTimes='0;.5;1' keySplines='0.35 0 0.65 1;0.35 0 0.65 1'";
  return {
    dur,
    begin,
    anim: `<animateTransform attributeName='transform' type='translate' values='${start} ${y1};${mid} ${y2};${end} ${y1}' dur='${dur}s' begin='${begin}s' repeatCount='indefinite' ${spline}/>`,
  };
}

function fishBob(i) {
  const dur = (0.55 + (i % 4) * 0.08).toFixed(2);
  const begin = ((i * 0.17) % 0.9).toFixed(2);
  const tilt = i % 2 === 0 ? 2 : -2;
  return `<animateTransform attributeName='transform' type='rotate' values='0;${tilt};0;${-tilt};0' dur='${dur}s' begin='${begin}s' repeatCount='indefinite' keyTimes='0;.25;.5;.75;1'/>`;
}

function swimmingFish(i, toRight) {
  const draw = FISH[i % FISH.length];
  const { anim } = swimPath(i, toRight);
  const art = draw();
  const w = 28;
  const body = toRight ? art : `<g transform='scale(-1 1) translate(${-w} 0)'>${art}</g>`;
  return `<g>${anim}<g>${fishBob(i)}${body}</g></g>`;
}

function buildSvg(toRight) {
  const fish = Array.from({ length: FISH_COUNT }, (_, i) => swimmingFish(i, toRight)).join("");
  return `<svg xmlns='http://www.w3.org/2000/svg' width='${UNIT}' height='${H}' viewBox='0 0 ${UNIT} ${H}' preserveAspectRatio='xMidYMid slice' overflow='visible' shape-rendering='crispEdges'><g opacity='.4'>${fish}</g></svg>`;
}

function enc(svg) {
  return encodeURIComponent(svg.replace(/\s+/g, " ").trim());
}

const ltrEnc = enc(buildSvg(true));
const rtlEnc = enc(buildSvg(false));

const css = `/* Vaporeon — pixel fish swimming across divider, full width */
html[data-palette="vaporeon"] .section-diagonal-gap--crawl-ltr,
html[data-palette="vaporeon"] .section-diagonal-gap--crawl-rtl {
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}

html[data-palette="vaporeon"] .section-diagonal-gap--crawl-ltr {
  background-color: var(--palette-divider);
  background-image: url("data:image/svg+xml,${ltrEnc}");
  background-repeat: no-repeat;
  background-size: 100% 100%;
  background-position: center;
}

html[data-palette="vaporeon"] .section-diagonal-gap--crawl-rtl {
  background-color: var(--palette-divider);
  background-image: url("data:image/svg+xml,${rtlEnc}");
  background-repeat: no-repeat;
  background-size: 100% 100%;
  background-position: center;
}
`;

const mainPath = "src/eeveelution-dividers.css";
const main = readFileSync(mainPath, "utf8");
const s = main.indexOf("/* Vaporeon");
const e = main.indexOf("/* Jolteon");
writeFileSync(mainPath, main.slice(0, s) + css.trim() + "\n\n" + main.slice(e));
console.log("done —", FISH_COUNT, "swimming fish per direction, full width");
