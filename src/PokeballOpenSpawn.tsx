import { motion } from "motion/react";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { playPokeballCloseSound, playPokeballOpenSound } from "./pokeballOpenSound";
import { techAssetUrl } from "./techAssets";

/** closed → semi-open → fully open */
export const POKEBALL_OPEN_FRAMES = [
  techAssetUrl("ball open (closed).png"),
  techAssetUrl("ball open (semi open).png"),
  techAssetUrl("ball open (opened).png"),
] as const;

export const POKEBALL_CLOSED_MS = 200;
export const POKEBALL_FRAME_MS = 250;
export const POKEBALL_SHOW_SEMI_MS = POKEBALL_CLOSED_MS;
export const POKEBALL_SHOW_OPEN_MS = POKEBALL_CLOSED_MS + POKEBALL_FRAME_MS;
export const POKEBALL_EMERGE_MS = POKEBALL_CLOSED_MS + POKEBALL_FRAME_MS * 2;
export const POKEBALL_EMERGE_SETTLE_MS = 165;
/** Pause after spawn settles before a species cry (spacer / theme switch). */
export const POKEBALL_CRY_DELAY_MS = 140;

/** When cry should play relative to spawn start (open → emerge → settle → gap). */
export function pokeballCryDelayMs(spawnDelayMs = 0): number {
  return spawnDelayMs + POKEBALL_EMERGE_MS + POKEBALL_EMERGE_SETTLE_MS + POKEBALL_CRY_DELAY_MS;
}

type BallFrame = 0 | 1 | 2;
export type PokeballSpawnPhase =
  | "concealed"
  | "opening"
  | "emerge"
  | "done"
  | "closing"
  | "closing-hide";

export type PokeballSpawnSize = "lg" | "bar" | "dex";

const SIZE = {
  lg: {
    root: "relative flex w-full max-w-[min(92%,320px)] items-end justify-center",
    ball: "pointer-events-none absolute bottom-0 z-10 h-[4.5rem] w-auto max-w-full object-contain sm:h-[5.25rem] lg:h-24",
    sprite: "relative z-[1] h-40 w-auto max-w-[min(92%,320px)] object-contain sm:h-48 lg:h-56",
    hiddenY: 28,
    hiddenScale: 0.35,
    restY: 0,
    sylveonRestY: 25,
    sylveonHiddenY: 28 + 25,
  },
  bar: {
    root: "relative flex h-20 w-full items-center justify-center sm:h-[4.5rem] lg:h-24",
    /** Ball-sized box; ball + Pokémon share center anchor (pop in place). */
    anchor: "relative h-7 w-7 shrink-0 overflow-visible sm:h-8 sm:w-8",
    ball: "pointer-events-none absolute left-1/2 top-1/2 z-10 h-7 w-7 -translate-x-1/2 -translate-y-1/2 object-contain sm:h-8 sm:w-8",
    spriteWrap: "pokeball-bar-sprite-slot pointer-events-none absolute left-1/2 top-1/2 z-[1]",
    sprite: "h-16 w-16 max-w-none object-contain sm:h-[4.5rem] sm:w-[4.5rem] lg:h-20 lg:w-20",
    hiddenY: 0,
    hiddenScale: 0.44,
    restY: 0,
    sylveonRestY: 0,
    sylveonHiddenY: 0,
  },
  dex: {
    root: "inline-flex align-middle",
    /** Same box as the settled sprite so the opening ball matches pop-up position. */
    anchor: "pokeball-dex-anchor relative inline-block h-12 w-12 shrink-0 sm:h-14 sm:w-14",
    /** Wrapper holds position — motion.img scale won't override translate (see styles.css nudge). */
    ballSlot:
      "pokeball-dex-ball-slot pointer-events-none absolute bottom-1 left-1/2 z-10 sm:bottom-1",
    ball: "block h-7 w-7 object-contain object-bottom sm:h-8 sm:w-8",
    sprite: "relative z-[1] block h-12 w-12 object-contain object-bottom sm:h-14 sm:w-14",
    hiddenY: 6,
    hiddenScale: 0.38,
    restY: 0,
    sylveonRestY: 0,
    sylveonHiddenY: 6,
  },
} as const;

export function usePokeballSpawn(
  spawnKey: string | number,
  options?: {
    spawnDelayMs?: number;
    playOpenSound?: boolean;
    playCloseSound?: boolean;
    concealed?: boolean;
    closing?: boolean;
    /** Stay open with Pokémon visible — no re-open animation on later clicks. */
    startRevealed?: boolean;
    onCloseComplete?: () => void;
    /** After the open → emerge sequence finishes (not when startRevealed). */
    onRevealComplete?: () => void;
  },
) {
  const concealed = options?.concealed ?? false;
  const closing = options?.closing ?? false;
  const startRevealed = options?.startRevealed ?? false;
  const [ballFrame, setBallFrame] = useState<BallFrame>(() => {
    if (closing || startRevealed) return 2;
    return 0;
  });
  const [phase, setPhase] = useState<PokeballSpawnPhase>(() => {
    if (closing) return "closing";
    if (concealed) return "concealed";
    if (startRevealed) return "done";
    return "opening";
  });
  const delay = options?.spawnDelayMs ?? 0;
  const playOpenSound = options?.playOpenSound ?? true;
  const playCloseSound = options?.playCloseSound ?? true;
  const onCloseCompleteRef = useRef(options?.onCloseComplete);
  onCloseCompleteRef.current = options?.onCloseComplete;
  const onRevealCompleteRef = useRef(options?.onRevealComplete);
  onRevealCompleteRef.current = options?.onRevealComplete;
  const closeSoundStartedRef = useRef(false);

  useEffect(() => {
    if (!closing) closeSoundStartedRef.current = false;

    if (closing) {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) {
        setBallFrame(0);
        setPhase("concealed");
        onCloseCompleteRef.current?.();
        return;
      }

      setBallFrame(2);
      setPhase("closing");
      let stopCloseSound = () => {};
      if (playCloseSound && !closeSoundStartedRef.current) {
        closeSoundStartedRef.current = true;
        stopCloseSound = playPokeballCloseSound(delay);
      }
      const tHide = window.setTimeout(() => setPhase("closing-hide"), delay + 60);
      const tSemi = window.setTimeout(() => setBallFrame(1), delay + POKEBALL_SHOW_SEMI_MS);
      const tClosed = window.setTimeout(() => setBallFrame(0), delay + POKEBALL_SHOW_OPEN_MS);
      const tConcealed = window.setTimeout(() => {
        setPhase("concealed");
        onCloseCompleteRef.current?.();
      }, delay + POKEBALL_EMERGE_MS);

      return () => {
        stopCloseSound();
        window.clearTimeout(tHide);
        window.clearTimeout(tSemi);
        window.clearTimeout(tClosed);
        window.clearTimeout(tConcealed);
      };
    }

    if (concealed) {
      setBallFrame(0);
      setPhase("concealed");
      return;
    }

    if (startRevealed) {
      setBallFrame(2);
      setPhase("done");
      return;
    }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setBallFrame(2);
      setPhase("done");
      onRevealCompleteRef.current?.();
      return;
    }

    setBallFrame(0);
    setPhase("opening");
    const stopOpenSound = playOpenSound ? playPokeballOpenSound(delay) : () => {};
    const tSemi = window.setTimeout(() => setBallFrame(1), delay + POKEBALL_SHOW_SEMI_MS);
    const tOpen = window.setTimeout(() => setBallFrame(2), delay + POKEBALL_SHOW_OPEN_MS);
    const tEmerge = window.setTimeout(() => setPhase("emerge"), delay + POKEBALL_EMERGE_MS);
    const tDone = window.setTimeout(() => {
      setPhase("done");
      onRevealCompleteRef.current?.();
    }, delay + POKEBALL_EMERGE_MS + POKEBALL_EMERGE_SETTLE_MS);

    return () => {
      stopOpenSound();
      window.clearTimeout(tSemi);
      window.clearTimeout(tOpen);
      window.clearTimeout(tEmerge);
      window.clearTimeout(tDone);
    };
  }, [spawnKey, delay, playOpenSound, playCloseSound, concealed, closing, startRevealed]);

  const showBall =
    phase === "concealed" ||
    phase === "closing" ||
    phase === "closing-hide" ||
    phase !== "done";
  const showPokemon = phase === "emerge" || phase === "done" || phase === "closing";

  return { ballFrame, phase, showBall, showPokemon };
}

export type PokeballOpenSpawnProps = {
  /** Changing this replays the open → emerge sequence */
  spawnKey: string | number;
  spriteSrc: string;
  spriteAlt?: string;
  size?: PokeballSpawnSize;
  /** Stagger multiple spawns (e.g. Eeveelution bar) */
  spawnDelayMs?: number;
  /** Play three-stage Poké Ball open SFX (default on). */
  playOpenSound?: boolean;
  /** Closed ball only — Pokémon hidden until spawnKey opens (e.g. Eeveelution bar). */
  concealed?: boolean;
  /** Run close animation (open → semi → closed), then concealed. */
  closing?: boolean;
  /** Pokémon already out — do not replay open when spawnKey is stable. */
  startRevealed?: boolean;
  playCloseSound?: boolean;
  onCloseComplete?: () => void;
  onRevealComplete?: () => void;
  /** Sylveon large spacer needs extra vertical offset */
  species?: string;
  className?: string;
  spriteClassName?: string;
  wrapperClassName?: string;
  href?: string;
  linkClassName?: string;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onSpriteError?: () => void;
  children?: ReactNode;
  /** When rendering as a button */
  ariaLabel?: string;
  ariaPressed?: boolean;
  dataSpecies?: string;
};

export function PokeballOpenSpawn({
  spawnKey,
  spriteSrc,
  spriteAlt = "",
  size = "lg",
  spawnDelayMs = 0,
  playOpenSound = true,
  playCloseSound = true,
  concealed = false,
  closing = false,
  startRevealed = false,
  onCloseComplete,
  onRevealComplete,
  species,
  className = "",
  spriteClassName = "",
  wrapperClassName = "",
  href,
  linkClassName = "",
  onClick,
  onMouseEnter,
  onFocus,
  onBlur,
  onSpriteError,
  children,
  ariaLabel,
  ariaPressed,
  dataSpecies,
}: PokeballOpenSpawnProps) {
  const cfg = SIZE[size];
  const { ballFrame, phase, showBall, showPokemon } = usePokeballSpawn(spawnKey, {
    spawnDelayMs,
    playOpenSound,
    playCloseSound,
    concealed,
    closing,
    startRevealed,
    onCloseComplete,
    onRevealComplete,
  });

  const isSylveon = species === "sylveon" && size === "lg";
  const pokemonRestY = isSylveon ? cfg.sylveonRestY : cfg.restY;
  const pokemonHiddenY = isSylveon ? cfg.sylveonHiddenY : cfg.hiddenY;
  const barSprite = size === "bar";
  const dexSprite = size === "dex";
  const barCfg = SIZE.bar;
  const dexCfg = SIZE.dex;

  const spriteImg = (
    <motion.img
      src={spriteSrc}
      alt={spriteAlt}
      className={`pokeball-spawn-sprite ${barSprite ? barCfg.sprite : dexSprite ? dexCfg.sprite : cfg.sprite} ${spriteClassName}`.trim()}
      style={barSprite || dexSprite ? { transformOrigin: "center bottom" } : undefined}
      initial={false}
      animate={
        barSprite
          ? showPokemon
            ? { opacity: 1, scale: 1 }
            : { opacity: 0, scale: barCfg.hiddenScale }
          : showPokemon
            ? { opacity: 1, scale: 1, y: pokemonRestY }
            : { opacity: 0, scale: cfg.hiddenScale, y: pokemonHiddenY }
      }
      transition={
        showPokemon
          ? { type: "spring", stiffness: 340, damping: 26, mass: 0.9 }
          : { duration: 0.01 }
      }
      draggable={false}
      onError={onSpriteError}
    />
  );

  const spawnContent = (
    <>
      {showBall ? (
        dexSprite ? (
          <div className={dexCfg.ballSlot}>
            <motion.img
              key={POKEBALL_OPEN_FRAMES[ballFrame]}
              src={POKEBALL_OPEN_FRAMES[ballFrame]}
              alt=""
              className={`pokeball-open-frame ${dexCfg.ball}`}
              initial={false}
              animate={{
                opacity: phase === "emerge" ? 0 : 1,
                scale: phase === "emerge" ? 1.05 : 1,
              }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              draggable={false}
            />
          </div>
        ) : (
          <motion.img
            key={POKEBALL_OPEN_FRAMES[ballFrame]}
            src={POKEBALL_OPEN_FRAMES[ballFrame]}
            alt=""
            className={`pokeball-open-frame ${cfg.ball}`}
            initial={false}
            animate={{
              opacity: phase === "emerge" ? 0 : 1,
              scale: phase === "emerge" ? 1.05 : 1,
            }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            draggable={false}
          />
        )
      ) : null}
      {children ?? (barSprite ? (
        <div className={barCfg.spriteWrap}>
          <div className="pokeball-bar-sprite-offset">{spriteImg}</div>
        </div>
      ) : (
        spriteImg
      ))}
    </>
  );

  const inner =
    size === "bar" ? (
      <div className={SIZE.bar.anchor}>{spawnContent}</div>
    ) : size === "dex" ? (
      <div className={SIZE.dex.anchor}>{spawnContent}</div>
    ) : (
      spawnContent
    );

  const rootClass = `${cfg.root} ${className}`.trim();

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`${rootClass} ${linkClassName}`.trim()}
        onMouseEnter={onMouseEnter}
        onFocus={onFocus}
        onBlur={onBlur}
      >
        {inner}
      </a>
    );
  }

  if (onClick != null) {
    return (
      <button
        type="button"
        data-species={dataSpecies}
        data-typewriter-accelerate
        className={`${rootClass} border-0 bg-transparent p-0 ${wrapperClassName}`.trim()}
        aria-label={ariaLabel}
        aria-pressed={ariaPressed}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onFocus={onFocus}
        onBlur={onBlur}
      >
        {inner}
      </button>
    );
  }

  return <motion.div className={`${rootClass} ${wrapperClassName}`.trim()}>{inner}</motion.div>;
}
