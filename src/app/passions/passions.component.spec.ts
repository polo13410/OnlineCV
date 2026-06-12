import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { PassionsComponent } from './passions.component';
import { GetJsonService } from '../services/get-json.service';
import { Passion } from 'src/assets/data/contentInterface';

const MOCK_PASSIONS: Passion[] = [
  { name: 'Handball', type: 'sport' },
  { name: 'Ski', type: 'sport' },
  { name: 'Espace', type: 'other' },
];

describe('PassionsComponent', () => {
  let component: PassionsComponent;
  let fixture: ComponentFixture<PassionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PassionsComponent, TranslateModule.forRoot()],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNoopAnimations(),
        {
          provide: GetJsonService,
          useValue: { getPassions: () => of(MOCK_PASSIONS) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PassionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('builds sports, others and music categories', () => {
    expect(component.categories.map((c) => c.id)).toEqual(['sports', 'autres', 'musique']);
    expect(component.categories[0].cards.length).toBe(2);
    expect(component.categories[1].cards.length).toBe(1);
  });

  it('music category holds a single spotify template card', () => {
    const music = component.categories[2];
    expect(music.cards.length).toBe(1);
    expect(music.cards[0].templateId).toBe('spotify');
  });

  it('renders the constellation with 3 tiles', () => {
    expect(fixture.debugElement.queryAll(By.css('.tile')).length).toBe(3);
  });
});
