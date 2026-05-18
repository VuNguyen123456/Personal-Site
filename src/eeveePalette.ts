/** Eevee — surfaces vs ink (see styles.css). */
export const EEVEE_PALETTE = {
  pureLinen: "#FCF3E4",
  moonrise: "#EFDBB6",
  appleSpice: "#C5915D",
} as const;

export const EEVEE_INK = {
  sambuca: "#332011",
  permaBrown: "#633C15",
} as const;

/** Vaporeon — same roles as Eevee in styles.css. */
export const VAPOREON_PALETTE = {
  mainBackground: "#A8DEF0",
  spacerMiddle: "#DFE5F2",
  spacerDots: "#A8DEF0",
  divider: "#E8E5C2",
  borderLine: "#DFE5F2",
  word: "#336E8C",
  description: "#DFE5F2",
  other: "#8B647D",
} as const;

/** Jolteon — electric yellow + purple (see styles.css). */
export const JOLTEON_PALETTE = {
  mainBackground: "#FFFFFF",
  divider: "#FFFEF2",
  borderLine: "#E7D94D",
  word: "#57346F",
  description: "#E7D94D",
  other: "#57346F",
  ink: "#261D2D",
} as const;

/** Flareon — forest green + warm cream + flame (see styles.css). */
export const FLAREON_PALETTE = {
  mainBackground: "#FFF7B8",
  divider: "#FF8D56",
  borderLine: "#BD543A",
  word: "#30563C",
  description: "#BD543A",
  flame: "#FF8D56",
} as const;

/** Leafeon — meadow cream + leaf greens + gold (see styles.css). */
export const LEAFEON_PALETTE = {
  mainBackground: "#F2E7A6",
  divider: "#89D89B",
  borderLine: "#6BC399",
  word: "#B68933",
  description: "#6BC399",
  leaf: "#89D89B",
} as const;

/** Glaceon — icy mint + teal blues (see styles.css). */
export const GLACEON_PALETTE = {
  mainBackground: "#CDEAE8",
  divider: "#56B1D4",
  borderLine: "#4A95B2",
  word: "#378582",
  description: "#56B1D4",
  ice: "#6CB2B8",
} as const;

/** Umbreon — midnight navy + ring yellow + crimson (see styles.css). */
export const UMBREON_PALETTE = {
  mainBackground: "#0A0E2B",
  divider: "#F6D64E",
  borderLine: "#1A2638",
  title: "#D62E36",
  word: "#F6D64E",
  description: "#FFFEF8",
  ring: "#F6D64E",
  crimson: "#D62E36",
} as const;

/** Espeon — lavender + violet + gem pink (see styles.css). */
export const ESPEON_PALETTE = {
  mainBackground: "#DBB2E3",
  divider: "#926ECC",
  borderLine: "#8653B2",
  word: "#294974",
  description: "#E73752",
  gem: "#E73752",
} as const;

/** Sylveon — ribbon pink + cream + periwinkle (see styles.css). */
export const SYLVEON_PALETTE = {
  mainBackground: "#FFFFFF",
  spacerMiddle: "#F7E8D8",
  divider: "#FBCDD2",
  borderLine: "#9EDEF9",
  word: "#6F82B6",
  description: "#F291A4",
  sky: "#97DCFB",
} as const;

export type EeveelutionPaletteId =
  | "eevee"
  | "vaporeon"
  | "jolteon"
  | "flareon"
  | "leafeon"
  | "glaceon"
  | "espeon"
  | "umbreon"
  | "sylveon";

const PALETTE_SPECIES: readonly EeveelutionPaletteId[] = [
  "eevee",
  "vaporeon",
  "jolteon",
  "flareon",
  "leafeon",
  "glaceon",
  "espeon",
  "umbreon",
  "sylveon",
];

export function isEeveelutionPaletteId(slug: string): slug is EeveelutionPaletteId {
  return (PALETTE_SPECIES as readonly string[]).includes(slug);
}
