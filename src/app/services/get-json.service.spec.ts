import { TestBed } from '@angular/core/testing';

import { GetJsonService } from './get-json.service';

describe('GetJsonService', () => {
  let service: GetJsonService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GetJsonService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
