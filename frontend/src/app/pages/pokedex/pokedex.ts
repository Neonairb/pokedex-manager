import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { PokedexEntry } from '../../core/models/pokedex.model';
import { PokedexService } from '../../core/services/pokedex';

type PokedexFilter = 'ALL' | 'SCANNED' | 'SEEN';

@Component({
  selector: 'app-pokedex',
  imports: [RouterLink],
  templateUrl: './pokedex.html',
  styleUrl: './pokedex.css',
})
export class Pokedex implements OnInit {
  private readonly pokedexService = inject(PokedexService);

  protected readonly placeholderSlots = Array.from(
    { length: 30 },
    (_, index) => index + 1,
  );
  protected readonly entries = signal<PokedexEntry[]>([]);
  protected readonly activeFilter = signal<PokedexFilter>('ALL');
  protected readonly isLoading = signal(true);
  protected readonly loadError = signal(false);

  protected readonly scannedCount = computed(
    () => this.entries().filter((entry) => entry.status === 'SCANNED').length,
  );

  protected readonly filteredEntries = computed(() => {
    const filter = this.activeFilter();

    if (filter === 'ALL') {
      return this.entries();
    }

    return this.entries().filter((entry) => entry.status === filter);
  });

  ngOnInit(): void {
    this.loadPokedex();
  }

  protected setFilter(filter: PokedexFilter): void {
    this.activeFilter.set(filter);
  }

  protected loadPokedex(): void {
    this.isLoading.set(true);
    this.loadError.set(false);

    this.pokedexService.getPokedex().subscribe({
      next: (entries) => {
        this.entries.set(entries);
        this.isLoading.set(false);
      },
      error: () => {
        this.loadError.set(true);
        this.isLoading.set(false);
      },
    });
  }
}
