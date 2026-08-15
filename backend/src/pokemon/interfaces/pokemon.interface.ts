export interface PokemonSummary {
  pokemonId: number;
  name: string;
  sprite: string | null;
  status: 'SEEN' | 'SCANNED' | null;
}

export type WildSearchPosition = 'left' | 'center' | 'right';

export interface WildSearchPokemon extends PokemonSummary {
  position: WildSearchPosition;
}

export interface PokemonDetail extends PokemonSummary {
  description: string | null;
  types: string[];
  height: number;
  weight: number;
}

export interface PokedexEntry {
  pokemonId: number;
  name: string | null;
  sprite: string | null;
  status: 'SEEN' | 'SCANNED' | null;
}
