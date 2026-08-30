import { mkdirSync, readFileSync, writeFileSync } from "fs";

const H = 48;
const UNIT = 1000;
const ITEM_COUNT = 12;
/** Extra headroom above the 48px band so tall furniture can poke out */
const VIEW_Y = -14;
const VIEW_H = 62;

const FURN_SCALE = 1.5;

const F = {
  wood: "#6b5010",
  woodHi: "#846040",
  fabric: "#9a8268",
  fabricHi: "#c4b4a0",
  shade: "#d4c4a8",
  metal: "#8a8a94",
  glow: "#d4b86a",
  book: "#6a3f96",
};

const TK = {
  core: "#a8e8ff",
  glow: "#d8f4ff",
  shine: "#f6fdff",
  accent: "#6ed4ff",
};

const DUST = ["#ffffff", "#f6fdff", "#e8f8ff", "#d8f4ff", "#f0e8ff"];

const FIRE = {
  core: "#ffffff",
  hot: "#f6fdff",
  base: "#dceeff",
};

const GAP_FIRE_COUNT = 26;

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

function floatTiming(id) {
  const dur = (2.8 + (id % 5) * 0.28).toFixed(2);
  const begin = ((id * 0.47) % 4).toFixed(2);
  const dir = id % 2 === 0 ? 1 : -1;
  return { dur, begin, dir };
}

function telekinesisFloat(id) {
  const { dur, begin, dir } = floatTiming(id);
  const hx = 7 + (id % 4);
  const up = 2 + (id % 2);
  const down = 4 + (id % 3);
  const a = (dir * 4.5).toFixed(1);
  const b = (-dir * 2.8).toFixed(1);
  const c = (dir * 1.6).toFixed(1);
  const values =
    `0 0;${dir * hx} ${-up};${-dir * Math.round(hx * 0.9)} ${down};` +
    `${dir * Math.round(hx * 0.45)} ${Math.round(down * 0.55)};` +
    `${-dir * Math.round(hx * 0.65)} ${-Math.round(up * 0.6)};` +
    `${dir * Math.round(hx * 0.3)} ${Math.round(down * 0.85)};0 0`;
  return (
    `<animateTransform attributeName='transform' type='translate' values='${values}' ` +
    `dur='${dur}s' begin='${begin}s' repeatCount='indefinite' ` +
    `keyTimes='0;0.14;0.31;0.48;0.67;0.84;1' ` +
    `calcMode='spline' keySplines='0.34 0 0.66 1;0.34 0 0.66 1;0.34 0 0.66 1;0.34 0 0.66 1;0.34 0 0.66 1;0.34 0 0.66 1'/>` +
    `<animateTransform attributeName='transform' additive='sum' type='rotate' values='0;${a};${b};${c};0' ` +
    `dur='${dur}s' begin='${begin}s' repeatCount='indefinite' keyTimes='0;.22;.52;.78;1' ` +
    `calcMode='spline' keySplines='0.38 0 0.62 1;0.38 0 0.62 1;0.38 0 0.62 1;0.38 0 0.62 1'/>`
  );
}

function occupiedFromCells(cells) {
  const set = new Set();
  for (const [x, y, w, h] of cells) {
    const rw = w ?? 2;
    const rh = h ?? 2;
    for (let py = y; py < y + rh; py++) {
      for (let px = x; px < x + rw; px++) {
        set.add(`${px},${py}`);
      }
    }
  }
  return set;
}

function sparseEdge(edge, id) {
  const out = new Set();
  const sorted = [...edge].sort();
  for (let i = 0; i < sorted.length; i++) {
    if (i % 3 === id % 3) out.add(sorted[i]);
  }
  return out;
}

function setToRects(set, fill) {
  const placed = new Set();
  const out = [];
  const points = [...set]
    .map((k) => k.split(",").map(Number))
    .sort((a, b) => a[1] - b[1] || a[0] - b[0]);

  for (const [x, y] of points) {
    const sx = x - (x % 2);
    const sy = y - (y % 2);
    const key = `${sx},${sy}`;
    if (placed.has(key)) continue;
    placed.add(key);
    out.push(`<rect x='${sx}' y='${sy}' width='2' height='2' fill='${fill}'/>`);
  }
  return out.join("");
}

function scaleCell([x, y, w, h]) {
  const rw = w ?? 2;
  const rh = h ?? 2;
  return [
    Math.round(x * FURN_SCALE),
    Math.round(y * FURN_SCALE),
    Math.max(2, Math.round(rw * FURN_SCALE)),
    Math.max(2, Math.round(rh * FURN_SCALE)),
  ];
}

function scaleParts(parts) {
  return parts.map((p) => ({
    fill: p.fill,
    cells: p.cells.map(scaleCell),
  }));
}

function makeSprite(parts, pivotX, pivotY) {
  const scaled = scaleParts(parts);
  const cells = cellsFromParts(scaled);
  const { w, h } = boundsFromCells(cells);
  return {
    body: bodyFromParts(scaled),
    cells,
    w,
    h,
    pivotX: Math.round(pivotX * FURN_SCALE),
    pivotY: Math.round(pivotY * FURN_SCALE),
  };
}

function bodyFromParts(parts) {
  return parts.map((p) => rects(p.cells, 0, 0, p.fill)).join("");
}

function cellsFromParts(parts) {
  return parts.flatMap((p) => p.cells);
}

function boundsFromCells(cells) {
  let w = 0;
  let h = 0;
  for (const [x, y, rw, rh] of cells) {
    w = Math.max(w, x + (rw ?? 2));
    h = Math.max(h, y + (rh ?? 2));
  }
  return { w, h };
}

function outerEdge(filled) {
  const out = new Set();
  for (const key of filled) {
    const [x, y] = key.split(",").map(Number);
    for (const [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      const nk = `${x + dx},${y + dy}`;
      if (!filled.has(nk)) out.add(nk);
    }
  }
  return out;
}

function boundsFromFilled(filled) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const key of filled) {
    const [x, y] = key.split(",").map(Number);
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }
  return { minX, minY, maxX, maxY };
}

/** Sparse corner ticks — old psychic bracket feel without boxing the whole piece */
function cornerTicks(minX, minY, maxX, maxY) {
  const pad = 1;
  const arm = 3;
  const t = 2;
  const l = minX - pad;
  const top = minY - pad;
  const r = maxX + pad - (t - 1);
  const b = maxY + pad - (t - 1);
  return [
    [l, top, arm, t],
    [l, top, t, arm],
    [r - arm + t, top, arm, t],
    [r, top, t, arm],
    [l, b - arm + t, t, arm],
    [l, b, arm, t],
    [r, b - arm + t, t, arm],
    [r - arm + t, b, arm, t],
  ];
}

function dilateSet(set, radius) {
  const out = new Set();
  for (const key of set) {
    const [x, y] = key.split(",").map(Number);
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) <= radius) {
          out.add(`${x + dx},${y + dy}`);
        }
      }
    }
  }
  return out;
}

function clipPathFromOutline(edgeSet, tickCells, clipId) {
  return (
    `<clipPath id='${clipId}'>` +
    `${setToRects(edgeSet, "#fff")}${rects(tickCells, 0, 0, "#fff")}</clipPath>`
  );
}

/** Traveling light band clipped to the psychic outline — actual shine, not just brighter paint */
function travelingShine(id, minX, minY, maxX, maxY, clipId, vertical = false) {
  const pad = 3;
  const dur = (1.45 + (id % 4) * 0.28).toFixed(2);
  const begin = ((id * 0.29) % 2.1).toFixed(2);

  if (vertical) {
    const x0 = minX - pad;
    const w = maxX - minX + pad * 2 + 2;
    const y0 = minY - pad;
    const travel = maxY - minY + pad * 2 + 12;
    const bandH = 5;
    const values = id % 2 === 0 ? `0 ${-bandH};0 ${travel}` : `0 ${travel};0 ${-bandH}`;
    return (
      `<g clip-path='url(#${clipId})'>` +
      `<rect x='${x0}' y='${y0}' width='${w}' height='${bandH}' fill='${TK.glow}' opacity='0.88'>` +
      `<animateTransform attributeName='transform' type='translate' values='${values}' dur='${dur}s' begin='${begin}s' repeatCount='indefinite' calcMode='linear'/></rect>` +
      `<rect x='${x0 + Math.max(0, Math.floor(w / 2) - 1)}' y='${y0 + 1}' width='2' height='3' fill='${TK.shine}' opacity='0.95'>` +
      `<animateTransform attributeName='transform' type='translate' values='${values}' dur='${dur}s' begin='${begin}s' repeatCount='indefinite' calcMode='linear'/></rect></g>`
    );
  }

  const x0 = minX - pad;
  const y0 = minY - pad;
  const h = maxY - minY + pad * 2 + 2;
  const travel = maxX - minX + pad * 2 + 12;
  const bandW = 5;
  const values = id % 2 === 0 ? `${-bandW} 0;${travel} 0` : `${travel} 0;${-bandW} 0`;

  return (
    `<g clip-path='url(#${clipId})'>` +
    `<rect x='${x0}' y='${y0}' width='${bandW}' height='${h}' fill='${TK.glow}' opacity='0.88'>` +
    `<animateTransform attributeName='transform' type='translate' values='${values}' dur='${dur}s' begin='${begin}s' repeatCount='indefinite' calcMode='linear'/></rect>` +
    `<rect x='${x0 + 1}' y='${y0 + Math.max(0, Math.floor(h / 2) - 1)}' width='3' height='2' fill='${TK.shine}' opacity='0.95'>` +
    `<animateTransform attributeName='transform' type='translate' values='${values}' dur='${dur}s' begin='${begin}s' repeatCount='indefinite' calcMode='linear'/></rect></g>`
  );
}

function tkOutline(shapeCells, id, animated = true) {
  const clipId = `tkclip${id}`;
  const filled = occupiedFromCells(shapeCells);
  const fullEdge = outerEdge(filled);
  const edge = sparseEdge(fullEdge, id);
  const { minX, minY, maxX, maxY } = boundsFromFilled(filled);
  const tickCells = cornerTicks(minX, minY, maxX, maxY);
  const clipEdge = dilateSet(fullEdge, 1);

  const dur = (2.4 + (id % 4) * 0.35).toFixed(2);
  const begin = ((id * 0.37) % 2.5).toFixed(2);
  const trace = setToRects(edge, TK.core);
  const ticks = rects(tickCells, 0, 0, TK.glow);
  const clip = clipPathFromOutline(clipEdge, tickCells, clipId);
  const vertical = id % 3 === 1;
  const shine = animated ? travelingShine(id, minX, minY, maxX, maxY, clipId, vertical) : "";

  if (!animated) {
    return `<defs>${clip}</defs><g opacity='0.48'>${trace}${ticks}</g>`;
  }

  return (
    `<defs>${clip}</defs>` +
    `<g opacity='0.42'>${trace}${ticks}` +
    `<animate attributeName='opacity' values='0.32;0.5;0.32' dur='${dur}s' begin='${begin}s' repeatCount='indefinite'/>` +
    `</g>${shine}`
  );
}

function flameSize(variant) {
  if (variant === 0) return { w: 6, h: 8 };
  if (variant === 1) return { w: 6, h: 6 };
  return { w: 6, h: 4 };
}

function boxesOverlap(a, b, pad = 0) {
  return !(
    a.x + a.w + pad < b.x - pad ||
    b.x + b.w + pad < a.x - pad ||
    a.y + a.h + pad < b.y - pad ||
    b.y + b.h + pad < a.y - pad
  );
}

function furniturePlacements() {
  const placements = [];
  for (let i = 0; i < ITEM_COUNT; i++) {
    const baseX = 20 + Math.floor((i * (UNIT - 40)) / ITEM_COUNT);
    const x = baseX + spread(i, -8, 8, 3);
    const variant = i % 6;
    const y = itemY(i, variant);
    const { w, h } = SPRITES[variant]();
    placements.push({ x, y, w, h, variant, id: i });
  }
  return placements;
}

function findGapFireSlots(furnitureBoxes) {
  const slots = [];
  const sorted = [...furnitureBoxes].sort((a, b) => a.x - b.x);

  for (let i = 0; i < sorted.length - 1 && slots.length < GAP_FIRE_COUNT; i++) {
    const left = sorted[i];
    const right = sorted[i + 1];
    const gapLeft = left.x + left.w + 8;
    const gapRight = right.x - 8;
    if (gapRight - gapLeft < 10) continue;

    const gapWidth = gapRight - gapLeft;
    const firesInGap = gapWidth > 36 ? 2 : 1;
    for (let f = 0; f < firesInGap && slots.length < GAP_FIRE_COUNT; f++) {
      const variant = (slots.length + f) % 3;
      const { w, h } = flameSize(variant);
      const x =
        firesInGap === 1
          ? Math.round((gapLeft + gapRight - w) / 2)
          : Math.round(gapLeft + ((f + 1) * gapWidth) / (firesInGap + 1) - w / 2);
      const y = spread(i + 50 + f * 17, 14, 38, 26 + f);
      const box = { x, y, w, h };
      const blocked =
        furnitureBoxes.some((fbox) => boxesOverlap(box, fbox, 10)) ||
        slots.some((s) => boxesOverlap(box, { x: s.x, y: s.y, ...flameSize(s.variant) }, 4));
      if (!blocked) slots.push({ x, y, variant, id: slots.length + 40 });
    }
  }

  for (let t = 0; t < 140 && slots.length < GAP_FIRE_COUNT; t++) {
    const i = slots.length + t + 60;
    const variant = i % 3;
    const { w, h } = flameSize(variant);
    const x = spread(i, 10, UNIT - w - 10, 22);
    const y = spread(i, 8, H - h - 2, 24);
    const box = { x, y, w, h };
    const blocked =
      furnitureBoxes.some((fbox) => boxesOverlap(box, fbox, 10)) ||
      slots.some((s) => boxesOverlap(box, { x: s.x, y: s.y, ...flameSize(s.variant) }, 4));
    if (!blocked) slots.push({ x, y, variant, id: slots.length + 40 });
  }

  return slots;
}

function flameRect(x, y, w, h, fill) {
  return `<rect x='${x}' y='${y}' width='${w}' height='${h}' fill='${fill}'/>`;
}

function whiteFlameBody(variant) {
  if (variant === 0) {
    return (
      flameRect(2, 0, 2, 2, FIRE.core) +
      flameRect(0, 2, 6, 2, FIRE.hot) +
      flameRect(1, 4, 4, 2, FIRE.hot) +
      flameRect(2, 6, 2, 2, FIRE.base)
    );
  }
  if (variant === 1) {
    return (
      flameRect(1, 0, 4, 2, FIRE.core) +
      flameRect(0, 2, 6, 2, FIRE.hot) +
      flameRect(2, 4, 2, 2, FIRE.base)
    );
  }
  return flameRect(2, 0, 2, 2, FIRE.core) + flameRect(1, 2, 4, 2, FIRE.hot);
}

/** Small white psychic flames tucked into empty gaps between furniture */
function gapFire(id, x, y, variant, animated = true) {
  const { w, h } = flameSize(variant);
  const pivotX = Math.round(w / 2);
  const pivotY = Math.round(h / 2);
  const body = whiteFlameBody(variant);
  const flickerDur = (0.42 + (id % 5) * 0.1).toFixed(2);
  const begin = ((id * 0.21) % 1.8).toFixed(2);
  const motion = animated ? telekinesisFloat(id) : "";
  const dust = fireDust(id, w, h, animated);

  if (!animated) {
    return `<g transform='translate(${x} ${y})' opacity='0.72'>${body}</g>`;
  }

  return (
    `<g transform='translate(${x} ${y})'>` +
    `<g transform='translate(${pivotX} ${pivotY})'>${motion}` +
    `<g transform='translate(${-pivotX} ${-pivotY})' opacity='0.8'>${body}${dust}` +
    `<animate attributeName='opacity' values='0.5;0.95;0.6;0.88;0.5' dur='${flickerDur}s' begin='${begin}s' repeatCount='indefinite'/>` +
    `</g></g></g>`
  );
}

function gapFires(slots, animated = true) {
  return slots.map((s) => gapFire(s.id, s.x, s.y, s.variant, animated)).join("");
}

/** Single drifting dust mote */
function dustMote(seed, sx, sy, colorId, fall, drift, lift = 0) {
  const color = DUST[colorId % DUST.length];
  const dur = (2.6 + (seed % 6) * 0.38).toFixed(2);
  const begin = ((seed * 0.23) % 3.1).toFixed(2);
  const dir = seed % 2 === 0 ? 1 : -1;

  return (
    `<rect x='${sx}' y='${sy}' width='2' height='2' fill='${color}' opacity='0'>` +
    `<animate attributeName='opacity' values='0;1;0.78;0' keyTimes='0;0.12;0.65;1' dur='${dur}s' begin='${begin}s' repeatCount='indefinite'/>` +
    `<animateTransform attributeName='transform' type='translate' ` +
    `values='0 0;${Math.round(drift * 0.4)} ${lift + Math.round(fall * 0.18)};` +
    `${Math.round(drift * 0.85)} ${lift + Math.round(fall * 0.5)};${drift + dir * 2} ${lift + fall}' ` +
    `keyTimes='0;0.3;0.68;1' dur='${dur}s' begin='${begin}s' repeatCount='indefinite' ` +
    `calcMode='spline' keySplines='0.38 0 0.62 1;0.38 0 0.62 1;0.38 0 0.62 1'/></rect>`
  );
}

/** Psychic dust — spills from the furniture, drifts, then fades */
function magicalDust(id, minX, minY, maxX, maxY, animated = true, count = 9) {
  if (!animated) return "";

  let out = "";
  for (let p = 0; p < count; p++) {
    const seed = id * 13 + p * 19;
    const edgePick = seed % 4;
    let sx;
    let sy;
    if (edgePick === 0) {
      sx = spread(seed, minX, maxX, 1);
      sy = maxY - 1;
    } else if (edgePick === 1) {
      sx = minX - 1;
      sy = spread(seed, minY + 2, maxY, 2);
    } else if (edgePick === 2) {
      sx = maxX + 1;
      sy = spread(seed, minY + 2, maxY, 4);
    } else {
      sx = spread(seed, minX + 2, maxX - 2, 5);
      sy = minY + 1;
    }

    const dir = seed % 2 === 0 ? 1 : -1;
    const fall = 14 + (seed % 9);
    const drift = dir * (5 + (seed % 7));
    const lift = edgePick === 3 ? -3 : 0;
    out += dustMote(seed, sx, sy, id + p, fall, drift, lift);
  }
  return `<g>${out}</g>`;
}

/** Dust drifting off white psychic flames */
function fireDust(id, w, h, animated = true) {
  if (!animated) return "";

  const count = 4;
  let out = "";
  for (let p = 0; p < count; p++) {
    const seed = id * 11 + p * 29;
    const sx = spread(seed, 0, Math.max(0, w - 2), 1);
    const sy = spread(seed, 0, Math.max(0, h - 3), 3);
    const dir = seed % 2 === 0 ? 1 : -1;
    const fall = 12 + (seed % 8);
    const drift = dir * (3 + (seed % 4));
    out += dustMote(seed, sx, sy, id + p + 3, fall, drift, -1);
  }
  return `<g>${out}</g>`;
}

function spriteChair() {
  return makeSprite(
    [
      { cells: [[2, 0, 6, 4]], fill: F.fabric },
      { cells: [[0, 4, 10, 3]], fill: F.fabricHi },
      { cells: [[1, 7, 2, 5], [7, 7, 2, 5]], fill: F.wood },
    ],
    5,
    8,
  );
}

function spriteTable() {
  return makeSprite(
    [
      { cells: [[0, 0, 14, 3]], fill: F.woodHi },
      { cells: [[5, 3, 4, 9]], fill: F.wood },
    ],
    7,
    8,
  );
}

function spriteCouch() {
  return makeSprite(
    [
      { cells: [[0, 0, 18, 4]], fill: F.fabric },
      { cells: [[0, 2, 3, 6], [15, 2, 3, 6]], fill: F.fabric },
      { cells: [[0, 6, 18, 4]], fill: F.fabricHi },
    ],
    9,
    7,
  );
}

function spriteLamp() {
  return makeSprite(
    [
      { cells: [[0, 0, 10, 6]], fill: F.shade },
      { cells: [[4, 6, 2, 10]], fill: F.metal },
      { cells: [[2, 16, 6, 4]], fill: F.wood },
    ],
    5,
    14,
  );
}

function spriteLantern() {
  return makeSprite(
    [
      { cells: [[3, 0, 4, 2]], fill: F.metal },
      { cells: [[1, 2, 8, 8]], fill: F.woodHi },
      { cells: [[3, 4, 4, 4]], fill: F.glow },
      { cells: [[2, 10, 6, 2]], fill: F.wood },
    ],
    5,
    8,
  );
}

function spriteSideTable() {
  return makeSprite(
    [
      { cells: [[4, 0, 4, 2]], fill: F.book },
      { cells: [[0, 2, 12, 2]], fill: F.woodHi },
      { cells: [[1, 4, 2, 8], [9, 4, 2, 8]], fill: F.wood },
    ],
    6,
    8,
  );
}

const SPRITES = [spriteChair, spriteTable, spriteCouch, spriteLamp, spriteLantern, spriteSideTable];

function floatingItem(x, y, variant, id, animated = true) {
  const { body, cells, pivotX, pivotY } = SPRITES[variant]();
  const { minX, minY, maxX, maxY } = boundsFromFilled(occupiedFromCells(cells));
  const outline = tkOutline(cells, id, animated);
  const dust = magicalDust(id, minX, minY, maxX, maxY, animated);
  const motion = animated ? telekinesisFloat(id) : "";

  return (
    `<g transform='translate(${x} ${y})'>` +
    `<g transform='translate(${pivotX} ${pivotY})'>${motion}` +
    `<g transform='translate(${-pivotX} ${-pivotY})'>${outline}${body}${dust}</g></g></g>`
  );
}

function itemY(i, variant) {
  const { h } = SPRITES[variant]();
  const tall = variant === 3 || variant === 4;
  const zone = i % 3;
  let y;
  if (zone === 0) {
    y = spread(i, 8, tall ? 16 : 20, 7);
  } else if (zone === 1) {
    y = spread(i, 18, 30, 11);
  } else {
    const bottomMin = Math.max(26, H - h);
    y = spread(i, bottomMin, H - h + 2, 13);
  }
  if (variant === 3) y += 8;
  return y;
}

function telekinesisScene(animated = true) {
  const placements = furniturePlacements();
  const furnitureBoxes = placements.map((p) => ({ x: p.x, y: p.y, w: p.w, h: p.h }));
  const fireSlots = findGapFireSlots(furnitureBoxes);
  const fires = gapFires(fireSlots, animated);
  const items = placements
    .map((p) => floatingItem(p.x, p.y, p.variant, p.id, animated))
    .join("");
  return fires + items;
}

function buildSvg(animated = true) {
  return (
    `<svg xmlns='http://www.w3.org/2000/svg' width='${UNIT}' height='${H}' ` +
    `viewBox='0 ${VIEW_Y} ${UNIT} ${VIEW_H}' preserveAspectRatio='xMidYMax slice' overflow='visible' ` +
    `shape-rendering='crispEdges'>${telekinesisScene(animated)}</svg>`
  );
}

function enc(svg) {
  return encodeURIComponent(svg.replace(/\s+/g, " ").trim());
}

const animatedSvg = buildSvg(true);
const staticSvg = buildSvg(false);
const tileEnc = enc(animatedSvg);
const staticEnc = enc(staticSvg);

const css = `/* Espeon — telekinetic furniture floating in psychic energy */
html[data-palette="espeon"] .section-diagonal-gap--crawl-ltr,
html[data-palette="espeon"] .section-diagonal-gap--crawl-rtl {
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}

html[data-palette="espeon"] .section-diagonal-gap--crawl-ltr,
html[data-palette="espeon"] .section-diagonal-gap--crawl-rtl,
html[data-palette="espeon"] .section-diagonal-gap {
  background-color: var(--palette-divider);
  background-image: url("data:image/svg+xml,${tileEnc}");
  background-repeat: repeat-x;
  background-size: ${UNIT}px ${H}px;
  background-position: left center;
  overflow: visible;
}

@media (prefers-reduced-motion: reduce) {
  html[data-palette="espeon"] .section-diagonal-gap--crawl-ltr,
  html[data-palette="espeon"] .section-diagonal-gap--crawl-rtl,
  html[data-palette="espeon"] .section-diagonal-gap {
    background-image: url("data:image/svg+xml,${staticEnc}");
  }
}
`;

const mainPath = "src/eeveelution-dividers.css";
const main = readFileSync(mainPath, "utf8");
const s = main.indexOf("/* Espeon");
const e = main.indexOf("/* Umbreon");
writeFileSync(mainPath, main.slice(0, s) + css.trim() + "\n\n" + main.slice(e));

mkdirSync("src/dividers", { recursive: true });
writeFileSync("src/dividers/espeon-divider.svg", animatedSvg);
writeFileSync("src/dividers/espeon-divider-static.svg", staticSvg);

console.log("Espeon telekinesis divider built —", ITEM_COUNT, "floating furniture pieces");
