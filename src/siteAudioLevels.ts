/**
 * Shared UI volume levels (0–1). Tuned so rapid typing, one-shot cries, and
 * spawn/despawn cues feel like the same “mix” on the page.
 */
export const SITE_AUDIO = {
  /** Cheerful waka per character while typing in */
  typingWakaIn: 0.014,
  /** Softer upbeat waka while erasing */
  typingWakaOut: 0.01,
  /** Each note in instant-reveal arpeggio */
  textSpawnNote: 0.01,
  /** Each note in instant-dismiss arpeggio */
  textDespawnNote: 0.01,
  /** End noise burst on dismiss */
  textDespawnNoise: 0.007,
  /** Showdown/Pokémon cry MP3 (HTMLAudioElement.volume) */
  eeveelutionCry: 0.15,
  /** Poké Ball open — three ascending pops (Web Audio) */
  pokeballOpen: 0.22,
  /** Poké Ball close — three descending pops (Web Audio) */
  pokeballClose: 0.2,
  /** Generic UI click (buttons, links, etc.) */
  uiClick: 0.012,
  /** Page-scroll texture — light airy swipe while scrolling */
  scrollAmbient: 0.05,
} as const;
