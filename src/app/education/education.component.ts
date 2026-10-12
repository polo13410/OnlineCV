// src/app/education/education.component.ts
import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject, combineLatest, takeUntil } from 'rxjs';
import { Education } from 'src/assets/data/contentInterface';
import { GetJsonService } from '../services/get-json.service';
import { LanguageService, SupportedLanguage } from '../services/language.service';
import { ScrollRevealDirective } from '../shared/directives/scroll-reveal.directive';
import { ExperienceCardComponent } from '../shared/experience-card/experience-card.component';
import { TimelineComponent, TimelineEntry } from '../shared/timeline/timeline.component';
import { periodMeta } from '../shared/timeline/format';

@Component({
  selector: 'app-education',
  templateUrl: './education.component.html',
  styleUrl: './education.component.scss',
  standalone: true,
  imports: [TranslateModule, ScrollRevealDirective, TimelineComponent, ExperienceCardComponent],
})
export class EducationComponent implements OnInit, OnDestroy {
  entries = signal<TimelineEntry<Education>[]>([]);

  private readonly json        = inject(GetJsonService);
  private readonly langService = inject(LanguageService);
  private readonly translate   = inject(TranslateService);
  private readonly destroy$    = new Subject<void>();

  ngOnInit(): void {
    combineLatest([
      this.json.getEdu(),
      this.langService.currentLanguage$,
      this.translate.stream('EXPERIENCES.PRESENT'),
    ]).pipe(takeUntil(this.destroy$)).subscribe(([data, lang, present]: [Education[], SupportedLanguage, string]) => {
      this.entries.set([...data]
        .sort((a, b) => b.dateFrom.localeCompare(a.dateFrom))
        .map(e => ({ id: e.id, meta: periodMeta(e.dateFrom, e.dateTo, lang, present), data: e })));
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
