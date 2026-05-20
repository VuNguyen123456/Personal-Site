import type { EeveelutionPaletteId } from "./eeveePalette";
import { PokeballOpenSpawn } from "./PokeballOpenSpawn";

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
  return (
    <PokeballOpenSpawn
      spawnKey={species}
      species={species}
      dataSpecies={species}
      spriteSrc={spriteSrc}
      size="lg"
      className="spacer-eeveelution-sprite pointer-events-auto relative z-[2] cursor-pointer"
      spriteClassName="spacer-eeveelution-sprite-img"
      ariaLabel={ariaLabel}
      ariaPressed={ariaPressed}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onFocus={onFocus}
      onBlur={onBlur}
    />
  );
}
