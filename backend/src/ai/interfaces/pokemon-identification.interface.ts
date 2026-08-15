export interface PokemonIdentification {
  identified: boolean;
  pokemonName: string | null;
  confidence: number;
}

export interface PokemonImageScanResult extends PokemonIdentification {
  pokemonId: number;
  status: 'SCANNED';
}

export interface UploadedImage {
  buffer: Buffer;
  mimetype: string;
}
