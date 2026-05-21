import { SITE_AUDIO } from "./siteAudioLevels";
import { isSiteAudioMuted } from "./siteAudioMute";
import { runWithSharedAudioContext } from "./typingSound";

/** Match PokeballOpenSpawn: closed (0ms) → semi (200ms) → open (450ms). */
const POP_STAGE_AT_S = [0, 0.2, 0.45] as const;
const POP_OPEN_HZ = [392, 523, 698] as const;
const POP_CLOSE_HZ = [698, 523, 392] as const;

function playStagePop(
  ctx: AudioContext,
  master: GainNode,
  tStart: number,
  at: number,
  freq: number,
  peak: number,
): void {
  const t = tStart + at;
  const popDur = 0.09;

  const tone = ctx.createOscillator();
  tone.type = "sine";
  tone.frequency.setValueAtTime(freq * 1.04, t);
  tone.frequency.exponentialRampToValueAtTime(freq * 0.88, t + 0.02);

  const toneGain = ctx.createGain();
  toneGain.gain.setValueAtTime(0.0001, t);
  toneGain.gain.linearRampToValueAtTime(peak, t + 0.004);
  toneGain.gain.exponentialRampToValueAtTime(0.0001, t + popDur);

  tone.connect(toneGain);
  toneGain.connect(master);
  tone.start(t);
  tone.stop(t + popDur + 0.015);

  const clickLen = 0.026;
  const clickFrames = Math.max(1, Math.floor(ctx.sampleRate * clickLen));
  const noiseBuf = ctx.createBuffer(1, clickFrames, ctx.sampleRate);
  const noiseData = noiseBuf.getChannelData(0);
  for (let i = 0; i < clickFrames; i++) {
    noiseData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (clickFrames * 0.22));
  }

  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuf;
  const clickFilter = ctx.createBiquadFilter();
  clickFilter.type = "bandpass";
  clickFilter.frequency.value = freq * 1.5;
  clickFilter.Q.value = 0.75;
  const clickGain = ctx.createGain();
  clickGain.gain.setValueAtTime(0.0001, t);
  clickGain.gain.linearRampToValueAtTime(peak * 0.32, t + 0.002);
  clickGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.024);

  noise.connect(clickFilter);
  clickFilter.connect(clickGain);
  clickGain.connect(master);
  noise.start(t);
  noise.stop(t + clickLen + 0.01);
}

function playPopSequence(
  ctx: AudioContext,
  freqs: readonly number[],
  level: number,
): void {
  const t0 = ctx.currentTime;
  const master = ctx.createGain();
  master.gain.value = level;
  master.connect(ctx.destination);
  const peaks = [0.1, 0.11, 0.12] as const;
  POP_STAGE_AT_S.forEach((at, i) => {
    playStagePop(ctx, master, t0, at, freqs[i], peaks[i]);
  });
}

function playSynthesizedPokeballOpen(ctx: AudioContext): void {
  playPopSequence(ctx, POP_OPEN_HZ, SITE_AUDIO.pokeballOpen);
}

function playSynthesizedPokeballClose(ctx: AudioContext): void {
  playPopSequence(ctx, POP_CLOSE_HZ, SITE_AUDIO.pokeballClose);
}

let lastCloseSoundAt = 0;

function scheduleSound(delayMs: number, play: () => void): () => void {
  if (delayMs <= 0) {
    play();
    return () => {};
  }
  const id = window.setTimeout(play, delayMs);
  return () => window.clearTimeout(id);
}

export function playPokeballOpenSound(delayMs = 0): () => void {
  if (typeof window === "undefined") return () => {};
  if (isSiteAudioMuted()) return () => {};
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};

  return scheduleSound(delayMs, () => {
    runWithSharedAudioContext(playSynthesizedPokeballOpen);
  });
}

export function playPokeballCloseSound(delayMs = 0): () => void {
  if (typeof window === "undefined") return () => {};
  if (isSiteAudioMuted()) return () => {};
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};

  return scheduleSound(delayMs, () => {
    const now = Date.now();
    if (now - lastCloseSoundAt < 450) return;
    lastCloseSoundAt = now;
    runWithSharedAudioContext(playSynthesizedPokeballClose);
  });
}
