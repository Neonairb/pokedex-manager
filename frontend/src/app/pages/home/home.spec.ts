import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { PokedexService } from '../../core/services/pokedex';
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

  beforeEach(async () => {
    pokedexService.getScanHistory.mockClear();

    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [
        {
          provide: PokedexService,
          useValue: pokedexService,
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
