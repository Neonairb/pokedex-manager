import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ScanHistoryEntry } from '../../core/models/pokedex.model';
import { PokedexService } from '../../core/services/pokedex';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  private readonly pokedexService = inject(PokedexService);

  protected readonly recentScans = signal<ScanHistoryEntry[]>([]);
  protected readonly emptyHistorySlots = computed(() =>
    Array.from({ length: Math.max(0, 5 - this.recentScans().length) }),
  );
  protected readonly isHistoryLoading = signal(true);
  protected readonly historyError = signal(false);

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
}
