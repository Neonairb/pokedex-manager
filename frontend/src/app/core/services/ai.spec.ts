import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { AiService } from './ai';

describe('AiService', () => {
  let service: AiService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(AiService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('uploads an image using multipart form data', () => {
    const image = new File(['image'], 'pikachu.png', {
      type: 'image/png',
    });

    service.scanImage(image).subscribe();

    const request = httpTesting.expectOne(
      `${environment.apiUrl}/ai/scan-image`,
    );

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toBeInstanceOf(FormData);
    expect((request.request.body as FormData).get('image')).toBe(image);
    request.flush({
      requiresConfirmation: true,
      pokemonId: 25,
      name: 'pikachu',
      sprite: 'pikachu.png',
    });
  });
});
