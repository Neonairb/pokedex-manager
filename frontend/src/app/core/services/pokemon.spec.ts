import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { PokemonService } from './pokemon';

describe('PokemonService', () => {
  let service: PokemonService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(PokemonService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('loads a wild search encounter', () => {
    service.getWildSearch().subscribe();

    const request = httpTesting.expectOne(
      `${environment.apiUrl}/pokemon/wild-search`,
    );
    expect(request.request.method).toBe('GET');
    request.flush([]);
  });

  it('loads a discovered Pokémon by ID', () => {
    service.getPokemon(25).subscribe();

    const request = httpTesting.expectOne(
      `${environment.apiUrl}/pokemon/25`,
    );
    expect(request.request.method).toBe('GET');
    request.flush({
      pokemonId: 25,
      name: 'pikachu',
      sprite: null,
      status: 'SEEN',
    });
  });
});
