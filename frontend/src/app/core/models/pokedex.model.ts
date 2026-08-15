export type ScanSource = 'WILD_SEARCH' | 'AI_IMAGE';
export type DiscoveryStatus = 'SEEN' | 'SCANNED' | null;

export interface PokemonSummary {
  pokemonId: number;
  name: string;
  sprite: string | null;
  status: DiscoveryStatus;
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
  status: DiscoveryStatus;
}

export interface ScanHistoryEntry {
  pokemonId: number;
  name: string;
  sprite: string | null;
  scannedAt: string;
  source: ScanSource;
}

export interface RegisterEncounterRequest {
  scannedPokemonId: number;
  seenPokemonIds: number[];
}

export type RegisterEncounterResponse = RegisterEncounterRequest;

export interface ScanPokemonResponse {
  pokemonId: number;
  status: 'SCANNED';
}

export interface AiScanSuspect {
  requiresConfirmation: true;
  pokemonId: number;
  name: string;
  sprite: string | null;
}

export type AiScanSuccess = PokemonDetail & {
  requiresConfirmation: false;
};

export type AiImageScanResponse = AiScanSuccess | AiScanSuspect;
