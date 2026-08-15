import { Component, input } from '@angular/core';

export type PokedexMessageTone = 'danger' | 'warning' | 'info';

@Component({
  selector: 'app-pokedex-message',
  templateUrl: './pokedex-message.html',
  styleUrl: './pokedex-message.css',
  host: {
    role: 'alert',
    '[attr.data-tone]': 'tone()',
  },
})
export class PokedexMessage {
  readonly heading = input.required<string>();
  readonly message = input.required<string>();
  readonly code = input('PKDX NOTICE');
  readonly tone = input<PokedexMessageTone>('info');
}
