import speciesSlugs from "./pokemonSpeciesSlugs1025.json";

/** National Pokédex order 1–1025; names match PokémonDB `/pokedex/{slug}` and sprite filenames. */
export const POKEMON_DB_SLUGS: readonly string[] = speciesSlugs;

export function pickRandomPokemonDbSlug(): string {
  const i = Math.floor(Math.random() * POKEMON_DB_SLUGS.length);
  return POKEMON_DB_SLUGS[i]!;
}

export function pokemonDbPokedexUrl(slug: string): string {
  return `https://pokemondb.net/pokedex/${slug}`;
}

export function pokemonDbGen5AnimatedSpriteUrl(slug: string): string {
  /** Default overworld sprite; `-f` female-only files exist for a small subset and 404 for most species. */
  return `https://img.pokemondb.net/sprites/black-white/anim/normal/${slug}.gif`;
}
