import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';

import { GetJsonService } from './get-json.service';

describe('GetJsonService', () => {
  let service: GetJsonService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(GetJsonService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
