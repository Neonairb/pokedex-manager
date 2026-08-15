import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { PokedexService } from './pokedex';

describe('PokedexService', () => {
  let service: PokedexService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(PokedexService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('loads the authenticated trainer scan history', () => {
    const history = [
      {
        pokemonId: 25,
        name: 'pikachu',
        sprite: 'pikachu.png',
        scannedAt: '2026-08-14T12:00:00.000Z',
        source: 'WILD_SEARCH' as const,
      },
    ];

    service.getScanHistory().subscribe((response) => {
      expect(response).toEqual(history);
    });

    const request = httpTesting.expectOne(
      `${environment.apiUrl}/pokedex/history`,
    );

    expect(request.request.method).toBe('GET');
    request.flush(history);
  });

  it('loads the trainer Pokédex', () => {
    service.getPokedex().subscribe();

    const request = httpTesting.expectOne(`${environment.apiUrl}/pokedex`);
    expect(request.request.method).toBe('GET');
    request.flush([]);
  });

  it('registers a wild encounter', () => {
    const encounter = {
      scannedPokemonId: 25,
      seenPokemonIds: [1, 4],
    };

    service.registerEncounter(encounter).subscribe();

    const request = httpTesting.expectOne(
      `${environment.apiUrl}/pokedex/encounter`,
    );
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(encounter);
    request.flush(encounter);
  });

  it('registers a direct Pokémon scan', () => {
    service.scanPokemon(25).subscribe();

    const request = httpTesting.expectOne(
      `${environment.apiUrl}/pokedex/scan/25`,
    );
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({});
    request.flush({ pokemonId: 25, status: 'SCANNED' });
  });
});
