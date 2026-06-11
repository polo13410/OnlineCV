import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';

import { PassionsComponent } from './passions.component';

describe('PassionsComponent', () => {
  let component: PassionsComponent;
  let fixture: ComponentFixture<PassionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PassionsComponent, TranslateModule.forRoot()],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(PassionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
