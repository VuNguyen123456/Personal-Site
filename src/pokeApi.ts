const POKEAPI_BASE = "https://pokeapi.co/api/v2";

const BASE_STAT_ORDER = [
  "hp",
  "attack",
  "defense",
  "special-attack",
  "special-defense",
  "speed",
] as const;

type BaseStatName = (typeof BASE_STAT_ORDER)[number];

const STAT_SHORT_LABEL: Record<BaseStatName, string> = {
  hp: "HP",
  attack: "Atk",
  defense: "Def",
  "special-attack": "SpA",
  "special-defense": "SpD",
  speed: "Spe",
};

type PokeApiLocalizedName = {
  language: { name: string };
  name: string;
};

type PokeApiNamedResource = {
  name: string;
  url: string;
};

type PokeApiType = {
  name: string;
  names: PokeApiLocalizedName[];
};

type PokeApiAbility = {
  name: string;
  names: PokeApiLocalizedName[];
};

type PokeApiEggGroup = {
  name: string;
  names: PokeApiLocalizedName[];
};

type PokeApiItem = {
  name: string;
  names: PokeApiLocalizedName[];
};

type PokeApiCharacteristic = {
  gene_modulo: number;
  highest_stat: PokeApiNamedResource;
  descriptions: { description: string; language: { name: string } }[];
};

/** Primary resource: GET /pokemon/{name} */
type PokeApiPokemon = {
  id: number;
  name: string;
  base_experience: number;
  height: number;
  weight: number;
  is_default: boolean;
  order: number;
  species: PokeApiNamedResource;
  types: { slot: number; type: PokeApiNamedResource }[];
  stats: { base_stat: number; effort: number; stat: PokeApiNamedResource }[];
  abilities: { ability: PokeApiNamedResource; is_hidden: boolean; slot: number }[];
  moves: unknown[];
  forms: PokeApiNamedResource[];
  held_items: { item: PokeApiNamedResource }[];
};

/** Linked from pokemon.species — habitat, egg groups, gender, etc. */
type PokeApiPokemonSpecies = {
  habitat: PokeApiNamedResource | null;
  shape: PokeApiNamedResource;
  egg_groups: PokeApiNamedResource[];
  gender_rate: number;
  capture_rate: number;
  base_happiness: number;
  genera: { genus: string; language: { name: string } }[];
};

type PokeApiHabitat = {
  name: string;
  names: PokeApiLocalizedName[];
};

type PokeApiShape = {
  name: string;
  names: PokeApiLocalizedName[];
};

export type SpacerPokemonStatLine = {
  label: string;
  base: number;
};

export type SpacerPokemonAbilityLine = {
  name: string;
  isHidden: boolean;
};

export type SpacerCharacteristicInfo = {
  statLabel: string;
  descriptions: string[];
};

/** Aggregated readout data — pokemon endpoint first, then species + label lookups. */
export type SpacerPokemonDetails = {
  id: number;
  characteristic: SpacerCharacteristicInfo | null;
  types: string[];
  abilities: SpacerPokemonAbilityLine[];
  height: string;
  weight: string;
  baseExperience: number;
  evYield: SpacerPokemonStatLine[];
  stats: SpacerPokemonStatLine[];
  gender: string;
  genus: string | null;
  captureRate: number;
  baseHappiness: number;
  habitat: string | null;
  shape: string;
  eggGroups: string[];
  moveCount: number;
  formCount: number;
  heldItems: string[];
};

const speciesDetailsCache = new Map<string, SpacerPokemonDetails>();
const typeDetailCache = new Map<string, PokeApiType>();
const abilityDetailCache = new Map<string, PokeApiAbility>();
const habitatDetailCache = new Map<string, PokeApiHabitat>();
const shapeDetailCache = new Map<string, PokeApiShape>();
const eggGroupDetailCache = new Map<string, PokeApiEggGroup>();
const itemDetailCache = new Map<string, PokeApiItem>();

let characteristicsByStatPromise: Promise<Map<string, string[]>> | null = null;

function isBaseStatName(name: string): name is BaseStatName {
  return (BASE_STAT_ORDER as readonly string[]).includes(name);
}

function statShortLabel(statName: string): string {
  return isBaseStatName(statName) ? STAT_SHORT_LABEL[statName] : statName;
}

function englishLocalizedName(names: PokeApiLocalizedName[], fallbackSlug: string): string {
  const en = names.find((entry) => entry.language.name === "en");
  if (en?.name) return en.name;
  return fallbackSlug.charAt(0).toUpperCase() + fallbackSlug.slice(1);
}

function englishDescription(
  entries: { description: string; language: { name: string } }[],
): string | null {
  const en = entries.find((entry) => entry.language.name === "en");
  return en?.description ?? null;
}

function englishGenus(entries: PokeApiPokemonSpecies["genera"]): string | null {
  const en = entries.find((entry) => entry.language.name === "en");
  return en?.genus ?? null;
}

function formatHeight(decimetres: number): string {
  return `${(decimetres / 10).toFixed(1)} m`;
}

function formatWeight(hectograms: number): string {
  return `${(hectograms / 10).toFixed(1)} kg`;
}

function formatGenderRate(rate: number): string {
  if (rate === -1) return "Genderless";
  if (rate === 0) return "100% male";
  if (rate === 8) return "100% female";
  const femalePct = (rate / 8) * 100;
  const malePct = 100 - femalePct;
  const femaleText = Number.isInteger(femalePct) ? `${femalePct}%` : `${femalePct.toFixed(1)}%`;
  const maleText = Number.isInteger(malePct) ? `${malePct}%` : `${malePct.toFixed(1)}%`;
  return `${femaleText} female, ${maleText} male`;
}

function highestBaseStatName(pokemon: PokeApiPokemon): string {
  const ranked = [...pokemon.stats]
    .filter((row) => isBaseStatName(row.stat.name))
    .sort((a, b) => b.base_stat - a.base_stat);
  return ranked[0]?.stat.name ?? "hp";
}

async function fetchJson<T>(url: string, label: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`PokeAPI ${label} request failed`);
  }
  return (await response.json()) as T;
}

async function fetchPokemon(species: string): Promise<PokeApiPokemon> {
  return fetchJson<PokeApiPokemon>(`${POKEAPI_BASE}/pokemon/${species}`, `pokemon/${species}`);
}

async function fetchCached<T extends { name: string }>(
  cache: Map<string, T>,
  url: string,
  label: string,
): Promise<T> {
  const parts = url.split("/").filter(Boolean);
  const slug = parts[parts.length - 1] ?? url;
  const cached = cache.get(slug);
  if (cached) return cached;
  const detail = await fetchJson<T>(url, label);
  cache.set(detail.name, detail);
  return detail;
}

async function fetchTypeLabel(typeName: string): Promise<string> {
  const detail = await fetchCached(typeDetailCache, `${POKEAPI_BASE}/type/${typeName}`, "type");
  return englishLocalizedName(detail.names, detail.name);
}

async function fetchAbilityLabel(abilityName: string): Promise<string> {
  const detail = await fetchCached(
    abilityDetailCache,
    `${POKEAPI_BASE}/ability/${abilityName}`,
    "ability",
  );
  return englishLocalizedName(detail.names, detail.name);
}

async function fetchEggGroupLabel(groupName: string): Promise<string> {
  const detail = await fetchCached(
    eggGroupDetailCache,
    `${POKEAPI_BASE}/egg-group/${groupName}`,
    "egg-group",
  );
  return englishLocalizedName(detail.names, detail.name);
}

async function fetchItemLabel(itemName: string): Promise<string> {
  const detail = await fetchCached(itemDetailCache, `${POKEAPI_BASE}/item/${itemName}`, "item");
  return englishLocalizedName(detail.names, detail.name);
}

async function fetchHabitatLabel(habitatName: string): Promise<string> {
  const detail = await fetchCached(
    habitatDetailCache,
    `${POKEAPI_BASE}/pokemon-habitat/${habitatName}`,
    "habitat",
  );
  return englishLocalizedName(detail.names, detail.name);
}

async function fetchShapeLabel(shapeName: string): Promise<string> {
  const detail = await fetchCached(
    shapeDetailCache,
    `${POKEAPI_BASE}/pokemon-shape/${shapeName}`,
    "shape",
  );
  return englishLocalizedName(detail.names, detail.name);
}

async function loadCharacteristicsByStat(): Promise<Map<string, string[]>> {
  const list = await fetchJson<{ results: PokeApiNamedResource[] }>(
    `${POKEAPI_BASE}/characteristic?limit=100`,
    "characteristic list",
  );

  const byStat = new Map<string, { geneModulo: number; description: string }[]>();
  await Promise.all(
    list.results.map(async (entry) => {
      const detail = await fetchJson<PokeApiCharacteristic>(entry.url, "characteristic");
      const statName = detail.highest_stat.name;
      const description = englishDescription(detail.descriptions);
      if (!description) return;
      const existing = byStat.get(statName) ?? [];
      existing.push({ geneModulo: detail.gene_modulo, description });
      byStat.set(statName, existing);
    }),
  );

  const sorted = new Map<string, string[]>();
  for (const [statName, rows] of byStat) {
    sorted.set(
      statName,
      rows.sort((a, b) => a.geneModulo - b.geneModulo).map((row) => row.description),
    );
  }
  return sorted;
}

function getCharacteristicsByStat(): Promise<Map<string, string[]>> {
  if (!characteristicsByStatPromise) {
    characteristicsByStatPromise = loadCharacteristicsByStat();
  }
  return characteristicsByStatPromise;
}

function pokemonBaseStats(pokemon: PokeApiPokemon): SpacerPokemonStatLine[] {
  return BASE_STAT_ORDER.flatMap((statName) => {
    const entry = pokemon.stats.find((row) => row.stat.name === statName);
    if (!entry) return [];
    return [{ label: STAT_SHORT_LABEL[statName], base: entry.base_stat }];
  });
}

function pokemonEvYield(pokemon: PokeApiPokemon): SpacerPokemonStatLine[] {
  return BASE_STAT_ORDER.flatMap((statName) => {
    const entry = pokemon.stats.find((row) => row.stat.name === statName);
    if (!entry || entry.effort <= 0) return [];
    return [{ label: STAT_SHORT_LABEL[statName], base: entry.effort }];
  });
}

async function pokemonTypeLabels(pokemon: PokeApiPokemon): Promise<string[]> {
  const sorted = [...pokemon.types].sort((a, b) => a.slot - b.slot);
  return Promise.all(sorted.map(({ type }) => fetchTypeLabel(type.name)));
}

async function pokemonAbilityLines(pokemon: PokeApiPokemon): Promise<SpacerPokemonAbilityLine[]> {
  const sorted = [...pokemon.abilities].sort((a, b) => a.slot - b.slot);
  return Promise.all(
    sorted.map(async ({ ability, is_hidden: isHidden }) => ({
      name: await fetchAbilityLabel(ability.name),
      isHidden,
    })),
  );
}

async function pokemonHeldItemLabels(pokemon: PokeApiPokemon): Promise<string[]> {
  const uniqueNames = [...new Set(pokemon.held_items.map((row) => row.item.name))].slice(0, 3);
  return Promise.all(uniqueNames.map((name) => fetchItemLabel(name)));
}

async function speciesCharacteristic(pokemon: PokeApiPokemon): Promise<SpacerCharacteristicInfo | null> {
  const statName = highestBaseStatName(pokemon);
  const byStat = await getCharacteristicsByStat();
  const descriptions = byStat.get(statName);
  if (!descriptions?.length) return null;
  return {
    statLabel: statShortLabel(statName),
    descriptions,
  };
}

/** Pokémon-first fetch, then species + localized labels for the spacer readout. */
export async function fetchSpacerPokemonDetails(species: string): Promise<SpacerPokemonDetails> {
  const cached = speciesDetailsCache.get(species);
  if (cached) return cached;

  const pokemon = await fetchPokemon(species);
  const speciesData = await fetchJson<PokeApiPokemonSpecies>(pokemon.species.url, "pokemon-species");

  const [
    types,
    abilities,
    eggGroups,
    habitat,
    shape,
    characteristic,
    heldItems,
  ] = await Promise.all([
    pokemonTypeLabels(pokemon),
    pokemonAbilityLines(pokemon),
    Promise.all(speciesData.egg_groups.map((group) => fetchEggGroupLabel(group.name))),
    speciesData.habitat ? fetchHabitatLabel(speciesData.habitat.name) : Promise.resolve(null),
    fetchShapeLabel(speciesData.shape.name),
    speciesCharacteristic(pokemon),
    pokemonHeldItemLabels(pokemon),
  ]);

  const stats = pokemonBaseStats(pokemon);
  const evYield = pokemonEvYield(pokemon);

  const details: SpacerPokemonDetails = {
    id: pokemon.id,
    characteristic,
    types,
    abilities,
    height: formatHeight(pokemon.height),
    weight: formatWeight(pokemon.weight),
    baseExperience: pokemon.base_experience,
    evYield,
    stats,
    gender: formatGenderRate(speciesData.gender_rate),
    genus: englishGenus(speciesData.genera),
    captureRate: speciesData.capture_rate,
    baseHappiness: speciesData.base_happiness,
    habitat,
    shape,
    eggGroups,
    moveCount: pokemon.moves.length,
    formCount: pokemon.forms.length,
    heldItems,
  };

  speciesDetailsCache.set(species, details);
  return details;
}
