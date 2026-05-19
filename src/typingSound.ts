/** Retro UI sounds for typewriter readouts (Web Audio — no asset files). */

import { SITE_AUDIO } from "./siteAudioLevels";
import { isSiteAudioMuted } from "./siteAudioMute";

let audioContext: AudioContext | null = null;
let audioResumePromise: Promise<void> | null = null;
let lastTickAt = 0;
let lastSpawnAt = 0;
let lastDespawnAt = 0;
let lastUiClickAt = 0;
let lastScrollAmbientAt = 0;

const MIN_SPAWN_DESPAWN_INTERVAL_MS = 60;

const MIN_TICK_INTERVAL_MS = 14;

/** Alternates each tick — classic “waka-waka” rhythm while typing. */
let wakaHighNext = true;

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctx =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;
  if (!audioContext) audioContext = new Ctx();
  return audioContext;
}

function resumeAudioContext(ctx: AudioContext): Promise<void> {
  if (ctx.state === "running") return Promise.resolve();
  if (!audioResumePromise) {
    audioResumePromise = ctx.resume().catch(() => {}).finally(() => {
      audioResumePromise = null;
    });
  }
  return audioResumePromise;
}

/** Call once from a click/tap/key so later scroll sounds can play (browser policy). */
export function primeAudioContext(): void {
  if (isSiteAudioMuted() || prefersReducedMotion()) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  void resumeAudioContext(ctx);
}

function runWithAudioContext(play: (ctx: AudioContext, t0: number) => void): void {
  if (isSiteAudioMuted() || prefersReducedMotion()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const start = () => {
    if (ctx.state === "running") play(ctx, ctx.currentTime);
  };

  if (ctx.state === "running") {
    start();
    return;
  }

  void resumeAudioContext(ctx).then(start);
}

function playSquareBlip(
  ctx: AudioContext,
  t0: number,
  freq: number,
  startOffset: number,
  peakGain: number,
  duration: number,
): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const t = t0 + startOffset;

  osc.type = "square";
  osc.frequency.setValueAtTime(freq, t);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.linearRampToValueAtTime(peakGain, t + 0.006);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + duration + 0.01);
}

/** Bright, bouncy blip — sine + soft harmonic for a cheerful 8-bit feel. */
function playHappyWaka(
  ctx: AudioContext,
  t0: number,
  freq: number,
  peakGain: number,
  direction: "in" | "out",
): void {
  const duration = direction === "in" ? 0.036 : 0.032;
  /* Glide up on both — detyping used to dip downward and felt “sad” */
  const glideFrom = freq * 0.88;
  const glideTo = freq;

  const tone = ctx.createOscillator();
  const shimmer = ctx.createOscillator();
  const gain = ctx.createGain();
  const shimmerGain = ctx.createGain();

  tone.type = "sine";
  shimmer.type = "triangle";
  tone.frequency.setValueAtTime(glideFrom, t0);
  tone.frequency.exponentialRampToValueAtTime(glideTo, t0 + 0.014);
  shimmer.frequency.setValueAtTime(glideTo * 2, t0 + 0.014);

  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.linearRampToValueAtTime(peakGain, t0 + 0.004);
  gain.gain.setValueAtTime(peakGain * 0.7, t0 + 0.018);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

  shimmerGain.gain.setValueAtTime(0.0001, t0);
  const shimmerMix = direction === "in" ? 0.22 : 0.28;
  shimmerGain.gain.linearRampToValueAtTime(peakGain * shimmerMix, t0 + 0.006);
  shimmerGain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration * 0.85);

  tone.connect(gain);
  shimmer.connect(shimmerGain);
  gain.connect(ctx.destination);
  shimmerGain.connect(ctx.destination);

  tone.start(t0);
  shimmer.start(t0 + 0.008);
  tone.stop(t0 + duration + 0.01);
  shimmer.stop(t0 + duration + 0.01);
}

function playCharacterTick(char: string | undefined, direction: "in" | "out"): void {
  if (char !== undefined && /\s/.test(char)) return;
  if (prefersReducedMotion()) return;

  const now = Date.now();
  if (now - lastTickAt < MIN_TICK_INTERVAL_MS) return;
  lastTickAt = now;

  /* Same bright major pair for both — detyping is softer via gain only */
  const [hi, lo] = [659, 523];

  const freq = wakaHighNext ? hi : lo;
  wakaHighNext = !wakaHighNext;

  const peakGain =
    direction === "in" ? SITE_AUDIO.typingWakaIn : SITE_AUDIO.typingWakaOut;

  runWithAudioContext((ctx, t0) => {
    playHappyWaka(ctx, t0, freq, peakGain, direction);
  });
}

/** Cheerful blip while a character types in. */
export function playTypingTick(char?: string): void {
  playCharacterTick(char, "in");
}

/** Softer upbeat blip while a character is erased. */
export function playDetypingTick(char?: string): void {
  playCharacterTick(char, "out");
}

function scheduleUIClick(ctx: AudioContext): void {
  playHappyWaka(ctx, ctx.currentTime, 784, SITE_AUDIO.uiClick, "in");
}

/** Short cheerful blip for buttons and links (same family as typing waka). */
export function playUIClick(): void {
  const now = Date.now();
  if (now - lastUiClickAt < 45) return;
  lastUiClickAt = now;

  runWithAudioContext((ctx, t0) => {
    playHappyWaka(ctx, t0, 784, SITE_AUDIO.uiClick, "in");
  });
}

/**
 * Play UI click from a real click/tap — resumes AudioContext in the same gesture
 * so the blip is not dropped on the first interaction (common browser policy).
 */
export function playUIClickFromUserGesture(): void {
  if (isSiteAudioMuted() || prefersReducedMotion()) return;
  const now = Date.now();
  if (now - lastUiClickAt < 45) return;
  lastUiClickAt = now;

  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === "running") {
    scheduleUIClick(ctx);
    return;
  }

  void resumeAudioContext(ctx).then(() => {
    if (ctx.state === "running") scheduleUIClick(ctx);
  });
}

/** Light, bright scroll swipe — airy noise + upward chirp (not a low rumble). */
export function playScrollAmbient(direction: "up" | "down"): void {
  const now = Date.now();
  if (now - lastScrollAmbientAt < 55) return;
  lastScrollAmbientAt = now;

  runWithAudioContext((ctx, t0) => {
    const duration = 0.04;
    const peak = SITE_AUDIO.scrollAmbient;

    const sampleCount = Math.max(1, Math.floor(ctx.sampleRate * duration));
    const buffer = ctx.createBuffer(1, sampleCount, ctx.sampleRate);
    const samples = buffer.getChannelData(0);
    for (let i = 0; i < sampleCount; i++) {
      const t = i / sampleCount;
      const env = Math.sin(Math.PI * t);
      samples[i] = (Math.random() * 2 - 1) * env;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = "bandpass";
    noiseFilter.frequency.value = direction === "down" ? 3200 : 2800;
    noiseFilter.Q.value = 0.65;

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.0001, t0);
    noiseGain.gain.linearRampToValueAtTime(peak * 0.5, t0 + 0.004);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

    /* Both directions glide up — avoids a “sinking” feel on scroll down */
    const chirpFrom = direction === "down" ? 440 : 494;
    const chirpTo = direction === "down" ? 587 : 659;

    const tone = ctx.createOscillator();
    tone.type = "triangle";
    tone.frequency.setValueAtTime(chirpFrom, t0);
    tone.frequency.exponentialRampToValueAtTime(chirpTo, t0 + 0.018);

    const toneGain = ctx.createGain();
    toneGain.gain.setValueAtTime(0.0001, t0);
    toneGain.gain.linearRampToValueAtTime(peak * 0.55, t0 + 0.005);
    toneGain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    tone.connect(toneGain);
    noiseGain.connect(ctx.destination);
    toneGain.connect(ctx.destination);
    noise.start(t0);
    tone.start(t0);
    noise.stop(t0 + duration + 0.01);
    tone.stop(t0 + duration + 0.01);
  });
}

/** Instant reveal — quick rising “spawn” chirp. */
export function playTextSpawn(): void {
  const now = Date.now();
  if (now - lastSpawnAt < MIN_SPAWN_DESPAWN_INTERVAL_MS) return;
  lastSpawnAt = now;

  runWithAudioContext((ctx, t0) => {
    const notes = [392, 523, 659, 784];
    const step = 0.022;
    notes.forEach((freq, i) =>
      playSquareBlip(ctx, t0, freq, i * step, SITE_AUDIO.textSpawnNote, 0.055),
    );
  });
}

/** Instant dismiss — falling “despawn / defeated” blip. */
export function playTextDespawn(): void {
  const now = Date.now();
  if (now - lastDespawnAt < MIN_SPAWN_DESPAWN_INTERVAL_MS) return;
  lastDespawnAt = now;

  runWithAudioContext((ctx, t0) => {
    const notes = [622, 466, 349, 220];
    const step = 0.028;
    notes.forEach((freq, i) =>
      playSquareBlip(ctx, t0, freq, i * step, SITE_AUDIO.textDespawnNote, 0.07),
    );

    const sampleCount = Math.floor(ctx.sampleRate * 0.04);
    const buffer = ctx.createBuffer(1, sampleCount, ctx.sampleRate);
    const samples = buffer.getChannelData(0);
    for (let i = 0; i < sampleCount; i++) {
      const decay = 1 - i / sampleCount;
      samples[i] = (Math.random() * 2 - 1) * decay;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 600;
    const noiseGain = ctx.createGain();
    const t = t0 + notes.length * step;
    noiseGain.gain.setValueAtTime(SITE_AUDIO.textDespawnNoise, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start(t);
    noise.stop(t + 0.06);
  });
}
