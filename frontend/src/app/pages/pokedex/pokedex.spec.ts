import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { PokedexService } from '../../core/services/pokedex';
import { PokemonService } from '../../core/services/pokemon';
import { Pokedex } from './pokedex';

describe('Pokedex', () => {
  let component: Pokedex;
  let fixture: ComponentFixture<Pokedex>;
  const pokedexService = {
    getPokedex: vi.fn(() =>
      of([
        { pokemonId: 1, name: null, sprite: null, status: null },
        {
          pokemonId: 4,
          name: 'charmander',
          sprite: 'charmander.png',
          status: 'SEEN' as const,
        },
        {
          pokemonId: 7,
          name: 'squirtle',
          sprite: 'squirtle.png',
          status: 'SCANNED' as const,
        },
      ]),
    ),
  };
  const pokemonService = {
    getPokemon: vi.fn(() =>
      of({
        pokemonId: 7,
        name: 'squirtle',
        sprite: 'squirtle.png',
        status: 'SCANNED' as const,
        description: 'A tiny turtle Pokémon.',
        types: ['water'],
        height: 5,
        weight: 90,
      }),
    ),
  };

  beforeEach(async () => {
    pokedexService.getPokedex.mockClear();
    pokemonService.getPokemon.mockClear();

    await TestBed.configureTestingModule({
      imports: [Pokedex],
      providers: [
        {
          provide: PokedexService,
          useValue: pokedexService,
        },
        {
          provide: PokemonService,
          useValue: pokemonService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Pokedex);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders entries according to their discovery state', () => {
    const element = fixture.nativeElement as HTMLElement;

    expect(pokedexService.getPokedex).toHaveBeenCalledOnce();
    expect(element.querySelectorAll('.pokedex-entry')).toHaveLength(3);
    expect(element.querySelectorAll('.pokedex-entry--seen')).toHaveLength(1);
    expect(element.querySelectorAll('.pokedex-entry--scanned')).toHaveLength(1);
    expect(element.textContent).toContain('squirtle');
  });

  it('filters the list to scanned Pokémon', () => {
    const element = fixture.nativeElement as HTMLElement;
    const scannedFilter = element.querySelectorAll<HTMLButtonElement>(
      '.filter-button',
    )[1];

    scannedFilter.click();
    fixture.detectChanges();

    expect(element.querySelectorAll('.pokedex-entry')).toHaveLength(1);
    expect(element.textContent).toContain('squirtle');
    expect(element.textContent).not.toContain('charmander');
  });

  it('opens the full record for a scanned Pokémon', () => {
    const element = fixture.nativeElement as HTMLElement;
    const scannedEntry = element.querySelector<HTMLElement>(
      '.pokedex-entry--scanned',
    );

    scannedEntry?.click();
    fixture.detectChanges();

    expect(pokemonService.getPokemon).toHaveBeenCalledWith(7);
    expect(element.querySelector('.pokedex-detail')).toBeTruthy();
    expect(element.textContent).toContain('A tiny turtle Pokémon.');
    expect(element.textContent).toContain('water');
  });
});
