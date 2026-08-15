import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';

import { environment } from '../../../environments/environment';
import {
  PokedexEntry,
  RegisterEncounterRequest,
  RegisterEncounterResponse,
  ScanHistoryEntry,
  ScanPokemonResponse,
} from '../models/pokedex.model';

@Service()
export class PokedexService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/pokedex`;

  getScanHistory() {
    return this.http.get<ScanHistoryEntry[]>(`${this.apiUrl}/history`);
  }

  getPokedex() {
    return this.http.get<PokedexEntry[]>(this.apiUrl);
  }

  registerEncounter(encounter: RegisterEncounterRequest) {
    return this.http.post<RegisterEncounterResponse>(
      `${this.apiUrl}/encounter`,
      encounter,
    );
  }

  scanPokemon(pokemonId: number) {
    return this.http.post<ScanPokemonResponse>(
      `${this.apiUrl}/scan/${pokemonId}`,
      {},
    );
  }
}
