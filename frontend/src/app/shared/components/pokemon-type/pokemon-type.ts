import { Component, computed, input } from '@angular/core';

const supportedTypes = new Set([
  'bug',
  'dark',
  'dragon',
  'electric',
  'fairy',
  'fighting',
  'fire',
  'flying',
  'ghost',
  'grass',
  'ground',
  'ice',
  'normal',
  'poison',
  'psychic',
  'rock',
  'steel',
  'water',
]);

@Component({
  selector: 'app-pokemon-type',
  templateUrl: './pokemon-type.html',
  styleUrl: './pokemon-type.css',
  host: {
    '[attr.data-type]': 'normalizedType()',
  },
})
export class PokemonType {
  readonly type = input.required<string>();

  protected readonly normalizedType = computed(() => {
    const type = this.type().trim().toLowerCase();
    return supportedTypes.has(type) ? type : 'normal';
  });

  protected readonly iconPath = computed(
    () => `/assets/pokemon-types/${this.normalizedType()}.svg`,
  );
}
