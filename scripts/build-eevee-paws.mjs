import { writeFileSync } from "fs";

const W = 240;
const H = 48;
const CELL = 2;
const PAW_W = 14;
const PAW_H = 11;

const C = {
  b: "#5c6370",
  l: "#9aa3ae",
  d: "#3a3f47",
};

/** One paw — base / highlight (top-right) / shadow (bottom-left) */
const pawCells = [
  /* toes */
  [2, 0, "l"],
  [3, 0, "l"],
  [5, 0, "l"],
  [6, 0, "l"],
  [8, 0, "l"],
  [9, 0, "l"],
  [11, 0, "l"],
  [12, 0, "l"],
  [2, 1, "l"],
  [3, 1, "b"],
  [5, 1, "b"],
  [6, 1, "l"],
  [8, 1, "b"],
  [9, 1, "l"],
  [11, 1, "b"],
  [12, 1, "l"],
  /* upper main */
  [3, 2, "b"],
  [4, 2, "b"],
  [5, 2, "b"],
  [6, 2, "b"],
  [7, 2, "b"],
  [8, 2, "b"],
  [9, 2, "b"],
  [10, 2, "b"],
  [2, 3, "d"],
  [3, 3, "d"],
  [4, 3, "b"],
  [5, 3, "b"],
  [6, 3, "b"],
  [7, 3, "b"],
  [8, 3, "b"],
  [9, 3, "b"],
  [10, 3, "b"],
  [11, 3, "l"],
  [1, 4, "d"],
  [2, 4, "d"],
  [3, 4, "b"],
  [4, 4, "b"],
  [5, 4, "b"],
  [6, 4, "b"],
  [7, 4, "b"],
  [8, 4, "b"],
  [9, 4, "b"],
  [10, 4, "b"],
  [11, 4, "l"],
  [12, 4, "l"],
  [2, 5, "b"],
  [3, 5, "b"],
  [4, 5, "b"],
  [5, 5, "b"],
  [6, 5, "b"],
  [7, 5, "b"],
  [8, 5, "b"],
  [9, 5, "b"],
  [10, 5, "b"],
  [11, 5, "b"],
  [2, 6, "b"],
  [3, 6, "b"],
  [4, 6, "b"],
  [5, 6, "b"],
  [6, 6, "b"],
  [7, 6, "b"],
  [8, 6, "b"],
  [9, 6, "b"],
  [10, 6, "b"],
  [11, 6, "b"],
  [2, 7, "d"],
  [3, 7, "d"],
  [4, 7, "b"],
  [5, 7, "b"],
  [6, 7, "b"],
  [7, 7, "b"],
  [8, 7, "b"],
  [9, 7, "b"],
  [10, 7, "b"],
  [3, 8, "d"],
  [4, 8, "d"],
  [5, 8, "d"],
  [6, 8, "d"],
  [7, 8, "d"],
  [8, 8, "d"],
  [9, 8, "d"],
  [4, 9, "d"],
  [5, 9, "d"],
  [6, 9, "d"],
  [7, 9, "d"],
  [5, 10, "d"],
  [6, 10, "d"],
];

const placements = [
  [12, 9],
  [72, 21],
  [132, 9],
  [192, 21],
];

function mirrorX(x) {
  return PAW_W - 1 - x;
}

function buildPawLayers(mirror) {
  const byColor = { b: [], l: [], d: [] };
  for (const [px, py, shade] of pawCells) {
    const x = mirror ? mirrorX(px) : px;
    byColor[shade].push([x, py]);
  }
  return byColor;
}

function rectsForCells(cells, ox, oy) {
  return cells
    .map(([px, py]) => {
      const x = (ox + px) * CELL;
      const y = (oy + py) * CELL;
      return `<rect x="${x}" y="${y}" width="${CELL}" height="${CELL}"/>`;
    })
    .join("");
}

function buildSvg(mirrorPaws = false) {
  const layers = { b: "", l: "", d: "" };
  for (const [ox, oy] of placements) {
    const paw = buildPawLayers(mirrorPaws);
    for (const shade of ["d", "b", "l"]) {
      layers[shade] += rectsForCells(paw[shade], ox, oy);
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" shape-rendering="crispEdges"><g opacity="0.72"><g fill="${C.d}">${layers.d}</g><g fill="${C.b}">${layers.b}</g><g fill="${C.l}">${layers.l}</g></g></svg>`;
}

const ltrEnc = encodeURIComponent(buildSvg(false).replace(/\s+/g, " ").trim());
const rtlEnc = encodeURIComponent(buildSvg(true).replace(/\s+/g, " ").trim());

const css = `/* Eevee — shaded pixel paws (reference style) */
html[data-palette="eevee"] .section-diagonal-gap--crawl-ltr,
html[data-palette="eevee"] .section-diagonal-gap--crawl-rtl {
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}

html[data-palette="eevee"] .section-diagonal-gap--crawl-ltr {
  background-color: var(--palette-divider);
  background-image: url("data:image/svg+xml,${ltrEnc}");
  background-repeat: repeat-x;
  background-size: ${W}px ${H}px;
  background-position: left center;
}

html[data-palette="eevee"] .section-diagonal-gap--crawl-rtl {
  background-color: var(--palette-divider);
  background-image: url("data:image/svg+xml,${rtlEnc}");
  background-repeat: repeat-x;
  background-size: ${W}px ${H}px;
  background-position: left center;
}
`;

writeFileSync("eevee-paws.css", css);
console.log("eevee paw tile:", W, "x", H, "encoded", ltrEnc.length);
