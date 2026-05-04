import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { CamionService } from './camion.service';

describe('CamionService', () => {
  let service: CamionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(CamionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
