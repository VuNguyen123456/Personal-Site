/** Global mute for synthesized UI sounds and Pokémon cries. */

let siteAudioMuted = false;

export function loadSiteAudioMuted(): boolean {
  if (typeof window === "undefined") return false;
  siteAudioMuted = localStorage.getItem("siteAudioMuted") === "true";
  return siteAudioMuted;
}

export function isSiteAudioMuted(): boolean {
  return siteAudioMuted;
}

export function setSiteAudioMuted(value: boolean): void {
  siteAudioMuted = value;
  if (typeof window !== "undefined") {
    localStorage.setItem("siteAudioMuted", String(value));
  }
}
