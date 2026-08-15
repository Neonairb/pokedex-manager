import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { WildSearchPokemon } from '../../core/models/pokedex.model';
import { AiService } from '../../core/services/ai';
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
    registerEncounter: vi.fn(),
    scanPokemon: vi.fn(),
  };
  const pokemonService = {
    getWildSearch: vi.fn(() => of<WildSearchPokemon[]>([])),
    getPokemon: vi.fn(),
  };
  const aiService = {
    scanImage: vi.fn(),
  };

  beforeEach(async () => {
    pokedexService.getScanHistory.mockClear();
    pokemonService.getWildSearch.mockClear();
    aiService.scanImage.mockClear();

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
          provide: AiService,
          useValue: aiService,
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

  it('places wild Pokémon using the positions returned by the API', () => {
    pokemonService.getWildSearch.mockReturnValueOnce(
      of([
        {
          pokemonId: 1,
          name: 'bulbasaur',
          sprite: null,
          status: null,
          position: 'right',
        },
        {
          pokemonId: 4,
          name: 'charmander',
          sprite: null,
          status: null,
          position: 'left',
        },
        {
          pokemonId: 7,
          name: 'squirtle',
          sprite: null,
          status: null,
          position: 'center',
        },
      ]),
    );

    component['startWildSearch']();
    fixture.detectChanges();

    const cards = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('.encounter-card'),
    );

    expect(cards[0].classList).toContain('encounter-card--right');
    expect(cards[1].classList).toContain('encounter-card--left');
    expect(cards[2].classList).toContain('encounter-card--center');
  });
});
