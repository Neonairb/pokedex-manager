import type { PokemonDetail } from '../../pokemon/interfaces/pokemon.interface';

export interface PokemonIdentification {
  identified: boolean;
  pokemonName: string | null;
  confidence: number;
}

export interface SuspectedPokemon {
  requiresConfirmation: true;
  pokemonId: number;
  name: string;
  sprite: string | null;
}

export type PokemonImageScanResult =
  | (PokemonDetail & { requiresConfirmation: false })
  | SuspectedPokemon;

export interface UploadedImage {
  buffer: Buffer;
  mimetype: string;
}
