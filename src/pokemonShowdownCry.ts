import { pokeballCryDelayMs } from "./PokeballOpenSpawn";
import { isSiteAudioMuted } from "./siteAudioMute";
import { SITE_AUDIO } from "./siteAudioLevels";

export const SHOWDOWN_CRY_BASE = "https://play.pokemonshowdown.com/audio/cries";

export function pokemonShowdownCryUrl(slug: string) {
  return `${SHOWDOWN_CRY_BASE}/${slug}.mp3`;
}

let cryAudio: HTMLAudioElement | null = null;
let cryDelayTimer: ReturnType<typeof setTimeout> | null = null;

/** Play a species cry MP3; default delay matches Poké Ball open → emerge timing. */
export function playPokemonShowdownCry(
  slug: string,
  options?: { delayMs?: number },
) {
  if (isSiteAudioMuted()) return;

  const play = () => {
    if (cryAudio == null) {
      cryAudio = new Audio();
    }
    cryAudio.src = pokemonShowdownCryUrl(slug);
    cryAudio.volume = SITE_AUDIO.eeveelutionCry;
    cryAudio.currentTime = 0;
    void cryAudio.play().catch(() => {});
  };

  const delayMs = options?.delayMs ?? pokeballCryDelayMs();
  if (delayMs <= 0) {
    play();
    return;
  }

  if (cryDelayTimer != null) {
    window.clearTimeout(cryDelayTimer);
  }
  cryDelayTimer = window.setTimeout(() => {
    cryDelayTimer = null;
    play();
  }, delayMs);
}

export function cancelPokemonShowdownCry() {
  if (cryDelayTimer != null) {
    window.clearTimeout(cryDelayTimer);
    cryDelayTimer = null;
  }
}
