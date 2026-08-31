/**
 * Eevee divider — running Eevee crosses the band.
 * Run: node scripts/build-eevee-divider.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const publicDividers = path.join(root, "public", "dividers");
const srcDividers = path.join(root, "src", "dividers");
const cssPath = path.join(root, "src", "eeveelution-dividers.css");

fs.mkdirSync(publicDividers, { recursive: true });

const runSrc = path.join(srcDividers, "eevee-run.gif");
const runDest = path.join(publicDividers, "eevee-run.gif");

if (fs.existsSync(runSrc)) {
  fs.copyFileSync(runSrc, runDest);
}

const css = `/* Eevee — running across the divider */
html[data-palette="eevee"] .section-diagonal-gap--crawl-ltr,
html[data-palette="eevee"] .section-diagonal-gap--crawl-rtl {
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}

html[data-palette="eevee"] .section-diagonal-gap {
  overflow: hidden;
  background-image: none;
  background-color: var(--palette-divider);
}

@keyframes eevee-run-ltr {
  from { left: -4.5rem; }
  to { left: 100%; }
}

@keyframes eevee-run-rtl {
  from { left: 100%; }
  to { left: -4.5rem; }
}

html[data-palette="eevee"] .section-diagonal-gap::before {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  left: -4.5rem;
  width: 4.5rem;
  background-image: url("/dividers/eevee-run.gif");
  background-repeat: no-repeat;
  background-position: center bottom;
  background-size: contain;
  pointer-events: none;
}

html[data-palette="eevee"] .section-diagonal-gap--crawl-ltr::before {
  transform: scaleX(-1);
  animation: eevee-run-ltr 7s linear infinite;
}

html[data-palette="eevee"] .section-diagonal-gap--crawl-rtl::before {
  animation: eevee-run-rtl 7s linear infinite;
}

@media (prefers-reduced-motion: reduce) {
  html[data-palette="eevee"] .section-diagonal-gap::before {
    animation: none;
    left: 50%;
    transform: translateX(-50%);
  }

  html[data-palette="eevee"] .section-diagonal-gap--crawl-ltr::before {
    transform: translateX(-50%) scaleX(-1);
  }
}
`;

const main = fs.readFileSync(cssPath, "utf8");
const start = main.indexOf("/* Eevee");
const end = main.indexOf("/* Vaporeon");
if (start === -1 || end === -1) {
  throw new Error("Could not find Eevee/Vaporeon markers in eeveelution-dividers.css");
}
fs.writeFileSync(cssPath, main.slice(0, start) + css.trim() + "\n\n" + main.slice(end));
console.log("Eevee divider — transparent GIF + run CSS patched");
