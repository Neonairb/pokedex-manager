export interface PokemonSummary {
  pokemonId: number;
  name: string;
  sprite: string | null;
  status: 'SEEN' | 'SCANNED' | null;
}

export interface PokemonDetail extends PokemonSummary {
  description: string | null;
  types: string[];
  height: number;
  weight: number;
}