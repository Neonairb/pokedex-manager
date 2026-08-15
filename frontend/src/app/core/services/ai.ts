import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';

import { environment } from '../../../environments/environment';
import { AiImageScanResponse, WildSearchPokemon } from '../models/pokedex.model';

@Service()
export class AiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/ai`;

  scanImage(image: File) {
    const formData = new FormData();
    formData.append('image', image);

    return this.http.post<AiImageScanResponse>(`${this.apiUrl}/scan-image`, formData);
  }

  getWildSearchAdvice(encounter: WildSearchPokemon[]) {
    return this.http.post(`${this.apiUrl}/wild-search-advice`, encounter, {
      responseType: 'text',
    });
  }
}
