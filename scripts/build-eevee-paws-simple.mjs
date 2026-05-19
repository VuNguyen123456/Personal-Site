import { readFileSync, writeFileSync } from "fs";

const W = 240;
const H = 48;
const S = 4; // 4px blocks — chunky 8-bit
const PAW_W = 16;
const PAW_H = 12;

/** Simple paw: 3 toes + heart-ish pad (all 4×4 blocks) */
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

function tile(mirror) {
  const placements = [
    [12, 16],
    [72, 26],
    [132, 16],
    [192, 26],
  ];
  let inner = "";
  for (const [px, py] of placements) {
    if (mirror) {
      inner += `<g transform='translate(${px + PAW_W} ${py}) scale(-1 1)'>${rects(paw, 0, 0)}</g>`;
    } else {
      inner += `<g transform='translate(${px} ${py})'>${rects(paw, 0, 0)}</g>`;
    }
  }
  return `<svg xmlns='http://www.w3.org/2000/svg' width='${W}' height='${H}' viewBox='0 0 ${W} ${H}' shape-rendering='crispEdges'><g fill='#633c15' opacity='.4'>${inner}</g></svg>`;
}

function enc(svg) {
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

const css = `/* Eevee — simple 8-bit paws; L→R or R→L per divider */
html[data-palette="eevee"] .section-diagonal-gap--crawl-ltr,
html[data-palette="eevee"] .section-diagonal-gap--crawl-rtl {
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}

html[data-palette="eevee"] .section-diagonal-gap--crawl-ltr {
  background-color: var(--palette-divider);
  background-image: ${enc(tile(false))};
  background-repeat: repeat-x;
  background-size: ${W}px ${H}px;
  background-position: left center;
}

html[data-palette="eevee"] .section-diagonal-gap--crawl-rtl {
  background-color: var(--palette-divider);
  background-image: ${enc(tile(true))};
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
console.log("Simple paws:", paw.length, "blocks each, 4 per tile");
