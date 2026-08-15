import { Component } from '@angular/core';

import { PokedexShell } from './layout/pokedex-shell/pokedex-shell';

@Component({
  selector: 'app-root',
  imports: [PokedexShell],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {}
