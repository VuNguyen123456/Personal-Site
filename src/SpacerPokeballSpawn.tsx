import { motion } from "motion/react";
import { useEffect, useState } from "react";
import type { EeveelutionPaletteId } from "./eeveePalette";

/** closed → semi-open → fully open (all three assets in public/assets/tech/) */
const POKEBALL_OPEN_FRAMES = [
  "/assets/tech/ball%20open%20(closed).png",
  "/assets/tech/ball%20open%20(semi%20open).png",
  "/assets/tech/ball%20open%20(opened).png",
] as const;

/** How long each ball frame is shown (closed is shorter). */
const CLOSED_FRAME_MS = 200;
const BALL_FRAME_MS = 250;

/** When each of the 3 ball frames appears (ms from spawn start). */
const SHOW_SEMI_MS = CLOSED_FRAME_MS;
const SHOW_OPEN_MS = CLOSED_FRAME_MS + BALL_FRAME_MS;
/** Pokémon emerges after all 3 frames have been shown. */
const POKEMON_EMERGE_MS = CLOSED_FRAME_MS + BALL_FRAME_MS * 2;
const EMERGE_SETTLE_MS = 165;

/** Sylveon's gif has extra transparent padding — sit lower after pop-out. */
const SYLVEON_REST_Y = 50;

type BallFrame = 0 | 1 | 2;
type SpawnPhase = "opening" | "emerge" | "done";

type SpacerPokeballSpawnProps = {
  species: EeveelutionPaletteId;
  spriteSrc: string;
  ariaLabel: string;
  ariaPressed: boolean;
  onMouseEnter: () => void;
  onFocus: () => void;
  onBlur: () => void;
  onClick: () => void;
};

export function SpacerPokeballSpawn({
  species,
  spriteSrc,
  ariaLabel,
  ariaPressed,
  onMouseEnter,
  onFocus,
  onBlur,
  onClick,
}: SpacerPokeballSpawnProps) {
  const [ballFrame, setBallFrame] = useState<BallFrame>(0);
  const [phase, setPhase] = useState<SpawnPhase>("opening");

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setBallFrame(2);
      setPhase("done");
      return;
    }

    setBallFrame(0);
    setPhase("opening");
    const tSemi = window.setTimeout(() => setBallFrame(1), SHOW_SEMI_MS);
    const tOpen = window.setTimeout(() => setBallFrame(2), SHOW_OPEN_MS);
    const tEmerge = window.setTimeout(() => setPhase("emerge"), POKEMON_EMERGE_MS);
    const tDone = window.setTimeout(() => setPhase("done"), POKEMON_EMERGE_MS + EMERGE_SETTLE_MS);

    return () => {
      window.clearTimeout(tSemi);
      window.clearTimeout(tOpen);
      window.clearTimeout(tEmerge);
      window.clearTimeout(tDone);
    };
  }, [species]);

  const showBall = phase !== "done";
  const showPokemon = phase === "emerge" || phase === "done";
  const isSylveon = species === "sylveon";
  const pokemonRestY = isSylveon ? SYLVEON_REST_Y : 0;
  const pokemonHiddenY = isSylveon ? 28 + SYLVEON_REST_Y : 28;

  return (
    <button
      type="button"
      data-species={species}
      data-typewriter-accelerate
      className="spacer-eeveelution-sprite pointer-events-auto relative z-[2] flex h-40 w-full max-w-[min(92%,320px)] cursor-pointer items-end justify-center border-0 bg-transparent p-0 sm:h-48 lg:h-56"
      aria-label={ariaLabel}
      aria-pressed={ariaPressed}
      onMouseEnter={onMouseEnter}
      onFocus={onFocus}
      onBlur={onBlur}
      onClick={onClick}
    >
      {showBall ? (
        <motion.img
          key={POKEBALL_OPEN_FRAMES[ballFrame]}
          src={POKEBALL_OPEN_FRAMES[ballFrame]}
          alt=""
          className="spacer-pokeball-open-frame pointer-events-none absolute bottom-0 z-10 h-[4.5rem] w-auto max-w-full object-contain sm:h-[5.25rem] lg:h-24"
          initial={false}
          animate={{
            opacity: phase === "emerge" ? 0 : 1,
            scale: phase === "emerge" ? 1.05 : 1,
          }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          draggable={false}
        />
      ) : null}
      <motion.img
        src={spriteSrc}
        alt=""
        className="spacer-eeveelution-sprite-img relative z-[1] h-40 w-auto max-w-[min(92%,320px)] object-contain sm:h-48 lg:h-56"
        initial={false}
        animate={
          showPokemon
            ? { opacity: 1, scale: 1, y: pokemonRestY }
            : { opacity: 0, scale: 0.35, y: pokemonHiddenY }
        }
        transition={
          showPokemon
            ? { type: "spring", stiffness: 340, damping: 26, mass: 0.9 }
            : { duration: 0.01 }
        }
        draggable={false}
      />
    </button>
  );
}
