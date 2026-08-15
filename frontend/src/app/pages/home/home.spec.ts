import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { PokedexService } from '../../core/services/pokedex';
import { PokemonService } from '../../core/services/pokemon';
import { Auth } from '../../core/services/auth';
import { Home } from './home';

describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;
  const pokedexService = {
    getScanHistory: vi.fn(() =>
      of([
        {
          pokemonId: 25,
          name: 'pikachu',
          sprite: 'pikachu.png',
          scannedAt: '2026-08-14T12:00:00.000Z',
          source: 'WILD_SEARCH' as const,
        },
      ]),
    ),
  };
  const pokemonService = {
    getWildSearch: vi.fn(() => of([])),
  };

  beforeEach(async () => {
    pokedexService.getScanHistory.mockClear();
    pokemonService.getWildSearch.mockClear();

    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [
        {
          provide: PokedexService,
          useValue: pokedexService,
        },
        {
          provide: PokemonService,
          useValue: pokemonService,
        },
        {
          provide: Auth,
          useValue: { logout: vi.fn() },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('displays recent scans from the Pokédex API', () => {
    const element = fixture.nativeElement as HTMLElement;

    expect(pokedexService.getScanHistory).toHaveBeenCalledOnce();
    expect(element.textContent).toContain('#0025');
    expect(element.textContent).toContain('pikachu');
  });
});
