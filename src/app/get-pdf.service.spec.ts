import { TestBed } from '@angular/core/testing';

import { GetPdfService } from './get-pdf.service';

describe('GetPdfService', () => {
  let service: GetPdfService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GetPdfService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
