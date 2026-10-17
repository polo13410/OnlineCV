import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';

import { ProjectsComponent } from './projects.component';
import { of } from 'rxjs';
import { Project } from '../../assets/data/contentInterface';
import { GetJsonService } from '../services/get-json.service';
import { LanguageService } from '../services/language.service';
import { formatDay } from '../shared/timeline/format';

const projects: Project[] = ['first', 'second'].map(id => ({
  id,
  name: id,
  kind: 'github',
  status: 'released',
  dateFrom: '2022-10-01',
  updatedAt: '2026-06-30',
  summary: '',
  skills: [],
  links: [{ type: 'repo', url: `https://github.com/example/${id}` }],
}));

describe('ProjectsComponent', () => {
  let component: ProjectsComponent;
  let fixture: ComponentFixture<ProjectsComponent>;
  let http: HttpTestingController;

  const displayedDate = (id: string): string =>
    fixture.nativeElement.querySelector(`#${id} .meta-value:last-child`).textContent.trim();
  const formattedDate = (date: string): string =>
    formatDay(date, TestBed.inject(LanguageService).getCurrentLanguage());

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectsComponent],
      providers: [
        provideTranslateService(), provideHttpClient(withXhr()), provideHttpClientTesting(), provideRouter([]),
        { provide: GetJsonService, useValue: { getProjects: () => of(projects) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should create', () => {
    expect(component).toBeTruthy();
    http.match(request => request.url.startsWith('https://api.github.com/repos/'))
      .forEach(request => request.flush({ pushed_at: '2026-10-17T12:00:00Z' }));
  });

  it('renders delayed GitHub push dates without a user interaction or forced change detection', async () => {
    await fixture.whenStable();
    expect(displayedDate('first')).toBe(formattedDate('2026-06-30'));

    http.expectOne('https://api.github.com/repos/example/first')
      .flush({ pushed_at: '2026-10-17T12:00:00Z' });
    http.expectOne('https://api.github.com/repos/example/second')
      .flush({ pushed_at: '2026-10-16T12:00:00Z' });

    await fixture.whenStable();
    expect(displayedDate('first')).toBe(formattedDate('2026-10-17'));
    expect(displayedDate('second')).toBe(formattedDate('2026-10-16'));
  });

  it('keeps the fallback for a failed repository while rendering successful push dates', async () => {
    await fixture.whenStable();
    http.expectOne('https://api.github.com/repos/example/first')
      .flush({ pushed_at: '2026-10-17T12:00:00Z' });
    http.expectOne('https://api.github.com/repos/example/second')
      .flush({}, { status: 403, statusText: 'Forbidden' });

    await fixture.whenStable();
    expect(displayedDate('first')).toBe(formattedDate('2026-10-17'));
    expect(displayedDate('second')).toBe(formattedDate('2026-06-30'));
  });
});
