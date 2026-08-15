import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-pokedex',
  imports: [RouterLink],
  templateUrl: './pokedex.html',
  styleUrl: './pokedex.css',
})
export class Pokedex {
  protected readonly placeholderSlots = Array.from(
    { length: 30 },
    (_, index) => index + 1,
  );
}
