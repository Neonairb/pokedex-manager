import { NgTemplateOutlet } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { switchMap } from 'rxjs';

import {
  AiScanSuspect,
  PokemonDetail,
  PokemonSummary,
  ScanHistoryEntry,
} from '../../core/models/pokedex.model';
import { AiService } from '../../core/services/ai';
import { PokedexService } from '../../core/services/pokedex';
import { PokemonService } from '../../core/services/pokemon';
import { Auth } from '../../core/services/auth';
import { PokemonType } from '../../shared/components/pokemon-type/pokemon-type';

@Component({
  selector: 'app-home',
  imports: [NgTemplateOutlet, PokemonType, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  private readonly pokedexService = inject(PokedexService);
  private readonly pokemonService = inject(PokemonService);
  private readonly aiService = inject(AiService);
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);

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
  protected readonly scannerMode = signal<'wild' | 'image'>('wild');
  protected readonly imageScannedPokemon = signal<PokemonDetail | null>(null);
  protected readonly suspectedPokemon = signal<AiScanSuspect | null>(null);
  protected readonly isImageScanning = signal(false);
  protected readonly isConfirmingSuspect = signal(false);
  protected readonly imageScanError = signal('');

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

  protected setScannerMode(mode: 'wild' | 'image'): void {
    this.scannerMode.set(mode);
  }

  protected uploadPokemonImage(fileInput: HTMLInputElement): void {
    const image = fileInput.files?.[0];

    if (!image || this.isImageScanning()) {
      return;
    }

    this.isImageScanning.set(true);
    this.imageScanError.set('');
    this.suspectedPokemon.set(null);
    this.imageScannedPokemon.set(null);

    this.aiService.scanImage(image).subscribe({
      next: (result) => {
        if (result.requiresConfirmation) {
          this.suspectedPokemon.set(result);
        } else {
          this.imageScannedPokemon.set(result);
          this.loadRecentScans();
        }

        this.isImageScanning.set(false);
        fileInput.value = '';
      },
      error: (error: HttpErrorResponse) => {
        this.imageScanError.set(this.getImageScanError(error));
        this.isImageScanning.set(false);
        fileInput.value = '';
      },
    });
  }

  protected confirmSuspectedPokemon(): void {
    const suspect = this.suspectedPokemon();

    if (!suspect || this.isConfirmingSuspect()) {
      return;
    }

    this.isConfirmingSuspect.set(true);
    this.imageScanError.set('');

    this.pokedexService
      .scanPokemon(suspect.pokemonId)
      .pipe(
        switchMap(() => this.pokemonService.getPokemon(suspect.pokemonId)),
      )
      .subscribe({
        next: (pokemon) => {
          if (!('types' in pokemon)) {
            this.imageScanError.set('Full scan data is unavailable.');
            this.isConfirmingSuspect.set(false);
            return;
          }

          this.imageScannedPokemon.set(pokemon);
          this.suspectedPokemon.set(null);
          this.isConfirmingSuspect.set(false);
          this.loadRecentScans();
        },
        error: () => {
          this.imageScanError.set(
            'The Pokédex could not register this Pokémon. Please try again.',
          );
          this.isConfirmingSuspect.set(false);
        },
      });
  }

  protected chooseAnotherImage(fileInput: HTMLInputElement): void {
    this.suspectedPokemon.set(null);
    this.imageScanError.set('');
    fileInput.value = '';
    fileInput.click();
  }

  protected resetImageScan(): void {
    this.imageScannedPokemon.set(null);
    this.suspectedPokemon.set(null);
    this.imageScanError.set('');
  }

  private getImageScanError(error: HttpErrorResponse): string {
    if (error.status === 404) {
      return 'No Pokémon signal was found in that image. Try another photo.';
    }

    if (error.status === 503 || error.status === 0) {
      return 'It seems the image recognition is not available right now.';
    }

    if (error.status === 413) {
      return 'That image is too large for the Pokédex. Choose one under 10 MB.';
    }

    if (error.status === 400) {
      return 'The Pokédex could not read that image. Use a JPEG, PNG, or WebP file.';
    }

    return 'The image scan was interrupted. Please try again.';
  }

  protected logout(): void {
    this.auth.logout();
    void this.router.navigate(['/login']);
  }
}
