import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PokemonType } from './pokemon-type';

describe('PokemonType', () => {
  let fixture: ComponentFixture<PokemonType>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PokemonType],
    }).compileComponents();

    fixture = TestBed.createComponent(PokemonType);
  });

  it('renders the local asset and label for a supported type', () => {
    fixture.componentRef.setInput('type', 'Fire');
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const icon = element.querySelector('img');

    expect(element.dataset['type']).toBe('fire');
    expect(element.textContent).toContain('fire');
    expect(icon?.getAttribute('src')).toBe('/assets/pokemon-types/fire.svg');
  });

  it('uses the normal type for unsupported API values', () => {
    fixture.componentRef.setInput('type', 'unknown');
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.dataset['type']).toBe('normal');
  });
});
