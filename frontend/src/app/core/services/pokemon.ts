import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';

import { environment } from '../../../environments/environment';
import {
  PokemonDetail,
  PokemonSummary,
  WildSearchPokemon,
} from '../models/pokedex.model';

@Service()
export class PokemonService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/pokemon`;

  getWildSearch() {
    return this.http.get<WildSearchPokemon[]>(`${this.apiUrl}/wild-search`);
  }

  getPokemon(pokemonId: number) {
    return this.http.get<PokemonDetail | PokemonSummary>(
      `${this.apiUrl}/${pokemonId}`,
    );
  }
}
