import { motion } from "motion/react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

/** closed → semi-open → fully open */
export const POKEBALL_OPEN_FRAMES = [
  "/assets/tech/ball%20open%20(closed).png",
  "/assets/tech/ball%20open%20(semi%20open).png",
  "/assets/tech/ball%20open%20(opened).png",
] as const;

export const POKEBALL_CLOSED_MS = 200;
export const POKEBALL_FRAME_MS = 250;
export const POKEBALL_SHOW_SEMI_MS = POKEBALL_CLOSED_MS;
export const POKEBALL_SHOW_OPEN_MS = POKEBALL_CLOSED_MS + POKEBALL_FRAME_MS;
export const POKEBALL_EMERGE_MS = POKEBALL_CLOSED_MS + POKEBALL_FRAME_MS * 2;
export const POKEBALL_EMERGE_SETTLE_MS = 165;

type BallFrame = 0 | 1 | 2;
export type PokeballSpawnPhase = "opening" | "emerge" | "done";

export type PokeballSpawnSize = "lg" | "bar" | "dex";

const SIZE = {
  lg: {
    root: "relative flex w-full max-w-[min(92%,320px)] items-end justify-center",
    ball: "pointer-events-none absolute bottom-0 z-10 h-[4.5rem] w-auto max-w-full object-contain sm:h-[5.25rem] lg:h-24",
    sprite: "relative z-[1] h-40 w-auto max-w-[min(92%,320px)] object-contain sm:h-48 lg:h-56",
    hiddenY: 28,
    hiddenScale: 0.35,
    restY: 0,
    sylveonRestY: 50,
    sylveonHiddenY: 28 + 50,
  },
  bar: {
    root: "relative flex h-full w-full items-end justify-center",
    ball: "pointer-events-none absolute bottom-0 z-10 h-7 w-7 object-contain sm:h-8 sm:w-8",
    sprite: "relative z-[1] h-full w-auto max-w-[min(100%,6.5rem)] object-contain sm:max-w-[min(100%,7rem)] lg:max-w-[min(100%,7.5rem)]",
    hiddenY: 10,
    hiddenScale: 0.4,
    restY: 0,
    sylveonRestY: 0,
    sylveonHiddenY: 10,
  },
  dex: {
    root: "relative inline-flex h-12 w-12 items-end justify-center sm:h-14 sm:w-14",
    ball: "pointer-events-none absolute bottom-0 z-10 h-7 w-7 object-contain sm:h-8 sm:w-8",
    sprite: "relative z-[1] h-12 w-12 object-contain sm:h-14 sm:w-14",
    hiddenY: 8,
    hiddenScale: 0.38,
    restY: 0,
    sylveonRestY: 0,
    sylveonHiddenY: 8,
  },
} as const;

export function usePokeballSpawn(
  spawnKey: string | number,
  options?: { spawnDelayMs?: number },
) {
  const [ballFrame, setBallFrame] = useState<BallFrame>(0);
  const [phase, setPhase] = useState<PokeballSpawnPhase>("opening");
  const delay = options?.spawnDelayMs ?? 0;

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setBallFrame(2);
      setPhase("done");
      return;
    }

    setBallFrame(0);
    setPhase("opening");
    const tSemi = window.setTimeout(() => setBallFrame(1), delay + POKEBALL_SHOW_SEMI_MS);
    const tOpen = window.setTimeout(() => setBallFrame(2), delay + POKEBALL_SHOW_OPEN_MS);
    const tEmerge = window.setTimeout(() => setPhase("emerge"), delay + POKEBALL_EMERGE_MS);
    const tDone = window.setTimeout(
      () => setPhase("done"),
      delay + POKEBALL_EMERGE_MS + POKEBALL_EMERGE_SETTLE_MS,
    );

    return () => {
      window.clearTimeout(tSemi);
      window.clearTimeout(tOpen);
      window.clearTimeout(tEmerge);
      window.clearTimeout(tDone);
    };
  }, [spawnKey, delay]);

  const showBall = phase !== "done";
  const showPokemon = phase === "emerge" || phase === "done";

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
  });

  const isSylveon = species === "sylveon" && size === "lg";
  const pokemonRestY = isSylveon ? cfg.sylveonRestY : cfg.restY;
  const pokemonHiddenY = isSylveon ? cfg.sylveonHiddenY : cfg.hiddenY;

  const inner = (
    <>
      {showBall ? (
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
      ) : null}
      {children ?? (
        <motion.img
          src={spriteSrc}
          alt={spriteAlt}
          className={`pokeball-spawn-sprite ${cfg.sprite} ${spriteClassName}`.trim()}
          initial={false}
          animate={
            showPokemon
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
      )}
    </>
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
