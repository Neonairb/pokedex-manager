import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { switchMap } from 'rxjs';

import {
  PokemonDetail,
  PokemonSummary,
  ScanHistoryEntry,
} from '../../core/models/pokedex.model';
import { PokedexService } from '../../core/services/pokedex';
import { PokemonService } from '../../core/services/pokemon';
import { PokemonType } from '../../shared/components/pokemon-type/pokemon-type';

@Component({
  selector: 'app-home',
  imports: [PokemonType, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  private readonly pokedexService = inject(PokedexService);
  private readonly pokemonService = inject(PokemonService);

  protected readonly recentScans = signal<ScanHistoryEntry[]>([]);
  protected readonly emptyHistorySlots = computed(() =>
    Array.from({ length: Math.max(0, 5 - this.recentScans().length) }),
  );
  protected readonly isHistoryLoading = signal(true);
  protected readonly historyError = signal(false);
  protected readonly encounter = signal<PokemonSummary[]>([]);
  protected readonly scannedPokemon = signal<PokemonDetail | null>(null);
  protected readonly isSearching = signal(false);
  protected readonly isScanning = signal(false);
  protected readonly wildSearchError = signal('');

  ngOnInit(): void {
    this.loadRecentScans();
  }

  protected loadRecentScans(): void {
    this.isHistoryLoading.set(true);
    this.historyError.set(false);

    this.pokedexService.getScanHistory().subscribe({
      next: (history) => {
        this.recentScans.set(history);
        this.isHistoryLoading.set(false);
      },
      error: () => {
        this.historyError.set(true);
        this.isHistoryLoading.set(false);
      },
    });
  }

  protected startWildSearch(): void {
    this.isSearching.set(true);
    this.wildSearchError.set('');
    this.scannedPokemon.set(null);

    this.pokemonService.getWildSearch().subscribe({
      next: (pokemon) => {
        this.encounter.set(pokemon);
        this.isSearching.set(false);
      },
      error: () => {
        this.wildSearchError.set(
          'The habitat scanner could not find a signal. Please try again.',
        );
        this.isSearching.set(false);
      },
    });
  }

  protected scanPokemon(selectedPokemon: PokemonSummary): void {
    if (this.isScanning()) {
      return;
    }

    const seenPokemonIds = this.encounter()
      .filter((pokemon) => pokemon.pokemonId !== selectedPokemon.pokemonId)
      .map((pokemon) => pokemon.pokemonId);

    this.isScanning.set(true);
    this.wildSearchError.set('');

    this.pokedexService
      .registerEncounter({
        scannedPokemonId: selectedPokemon.pokemonId,
        seenPokemonIds,
      })
      .pipe(
        switchMap(() =>
          this.pokemonService.getPokemon(selectedPokemon.pokemonId),
        ),
      )
      .subscribe({
        next: (pokemon) => {
          if (!('types' in pokemon)) {
            this.wildSearchError.set('Full scan data is unavailable.');
            this.isScanning.set(false);
            return;
          }

          this.scannedPokemon.set(pokemon);
          this.encounter.set([]);
          this.isScanning.set(false);
          this.loadRecentScans();
        },
        error: () => {
          this.wildSearchError.set(
            'The Pokémon scan could not be registered. Please try again.',
          );
          this.isScanning.set(false);
        },
      });
  }
}
