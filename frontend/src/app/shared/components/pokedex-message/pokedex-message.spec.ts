import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PokedexMessage } from './pokedex-message';

describe('PokedexMessage', () => {
  let fixture: ComponentFixture<PokedexMessage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PokedexMessage],
    }).compileComponents();

    fixture = TestBed.createComponent(PokedexMessage);
    fixture.componentRef.setInput('code', 'VISUAL SCAN 404');
    fixture.componentRef.setInput('heading', 'No match detected');
    fixture.componentRef.setInput('message', 'No Pokémon signature found.');
    fixture.componentRef.setInput('tone', 'warning');
    await fixture.whenStable();
  });

  it('renders a reusable Pokédex notice', () => {
    const element = fixture.nativeElement as HTMLElement;

    expect(element.getAttribute('role')).toBe('alert');
    expect(element.getAttribute('data-tone')).toBe('warning');
    expect(element.textContent).toContain('VISUAL SCAN 404');
    expect(element.textContent).toContain('No match detected');
    expect(element.textContent).toContain('No Pokémon signature found.');
  });
});
