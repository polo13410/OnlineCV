import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideTranslateService } from '@ngx-translate/core';

import { GetJsonService } from './get-json.service';

describe('GetJsonService', () => {
  let service: GetJsonService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideTranslateService(), provideHttpClient(withXhr()), provideHttpClientTesting()],
    });
    service = TestBed.inject(GetJsonService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
