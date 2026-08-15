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
import {
  PokedexMessage,
  type PokedexMessageTone,
} from '../../shared/components/pokedex-message/pokedex-message';
import { PokemonType } from '../../shared/components/pokemon-type/pokemon-type';

interface ScannerNotice {
  code: string;
  heading: string;
  message: string;
  tone: PokedexMessageTone;
}

@Component({
  selector: 'app-home',
  imports: [NgTemplateOutlet, PokedexMessage, PokemonType, RouterLink],
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
  protected readonly imageScanError = signal<ScannerNotice | null>(null);

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
    this.imageScanError.set(null);
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
    this.imageScanError.set(null);

    this.pokedexService
      .scanPokemon(suspect.pokemonId)
      .pipe(
        switchMap(() => this.pokemonService.getPokemon(suspect.pokemonId)),
      )
      .subscribe({
        next: (pokemon) => {
          if (!('types' in pokemon)) {
            this.imageScanError.set({
              code: 'DATA LINK 204',
              heading: 'Scan data incomplete',
              message:
                'The Pokémon was registered, but its full Pokédex record could not be loaded.',
              tone: 'warning',
            });
            this.isConfirmingSuspect.set(false);
            return;
          }

          this.imageScannedPokemon.set(pokemon);
          this.suspectedPokemon.set(null);
          this.isConfirmingSuspect.set(false);
          this.loadRecentScans();
        },
        error: () => {
          this.imageScanError.set({
            code: 'REGISTRY ERROR',
            heading: 'Registration interrupted',
            message:
              'The Pokédex could not register this Pokémon. Please try the confirmation again.',
            tone: 'danger',
          });
          this.isConfirmingSuspect.set(false);
        },
      });
  }

  protected chooseAnotherImage(fileInput: HTMLInputElement): void {
    this.suspectedPokemon.set(null);
    this.imageScanError.set(null);
    fileInput.value = '';
    fileInput.click();
  }

  protected resetImageScan(): void {
    this.imageScannedPokemon.set(null);
    this.suspectedPokemon.set(null);
    this.imageScanError.set(null);
  }

  private getImageScanError(error: HttpErrorResponse): ScannerNotice {
    if (error.status === 404) {
      return {
        code: 'VISUAL SCAN 404',
        heading: 'No match detected',
        message:
          'No Pokémon signature could be confirmed. Reframe the subject in good light and try another image.',
        tone: 'warning',
      };
    }

    if (error.status === 503 || error.status === 0) {
      return {
        code: 'VISION MODULE 503',
        heading: 'Recognition system offline',
        message:
          'The Pokédex image recognition module is unavailable right now. Please try again shortly.',
        tone: 'danger',
      };
    }

    if (error.status === 413) {
      return {
        code: 'IMAGE CAPACITY',
        heading: 'Image data too large',
        message: 'Choose an image under 10 MB and restart the visual scan.',
        tone: 'warning',
      };
    }

    if (error.status === 400) {
      return {
        code: 'FORMAT CHECK',
        heading: 'Unreadable image data',
        message: 'Load a valid JPEG, PNG, or WebP image into the scanner.',
        tone: 'warning',
      };
    }

    return {
      code: 'SCAN INTERRUPTED',
      heading: 'Visual scan failed',
      message: 'The image scan was interrupted. Reset the scanner and try again.',
      tone: 'danger',
    };
  }

  protected logout(): void {
    this.auth.logout();
    void this.router.navigate(['/login']);
  }
}
