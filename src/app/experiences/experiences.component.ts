// src/app/experiences/experiences.component.ts
import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject, combineLatest, takeUntil } from 'rxjs';
import { Experience, Experiences } from 'src/assets/data/contentInterface';
import { ContactService } from '../services/contact.service';
import { GetJsonService } from '../services/get-json.service';
import { LanguageService, SupportedLanguage } from '../services/language.service';
import { ScrollRevealDirective } from '../shared/directives/scroll-reveal.directive';
import { ExperienceCardComponent } from '../shared/experience-card/experience-card.component';
import { TimelineComponent, TimelineEntry, TimelineInvite } from '../shared/timeline/timeline.component';
import { buildInvite, inviteKeys } from '../shared/timeline/invite';
import { periodMeta } from '../shared/timeline/format';

@Component({
  selector: 'app-experiences',
  templateUrl: './experiences.component.html',
  styleUrl: './experiences.component.scss',
  standalone: true,
  imports: [TranslateModule, ScrollRevealDirective, TimelineComponent, ExperienceCardComponent],
})
export class ExperiencesComponent implements OnInit, OnDestroy {
  pro = signal<TimelineEntry<Experience>[]>([]);
  internships = signal<TimelineEntry<Experience>[]>([]);
  invite = signal<TimelineInvite | undefined>(undefined);

  private readonly json        = inject(GetJsonService);
  private readonly langService = inject(LanguageService);
  private readonly translate   = inject(TranslateService);
  private readonly contact     = inject(ContactService);
  private readonly destroy$    = new Subject<void>();

  ngOnInit(): void {
    combineLatest([
      this.json.getExp(),
      this.langService.currentLanguage$,
      this.translate.stream('EXPERIENCES.PRESENT'),
    ]).pipe(takeUntil(this.destroy$)).subscribe(([data, lang, present]: [Experiences, SupportedLanguage, string]) => {
      const toEntries = (items: Experience[]) => [...items]
        .sort((a, b) => b.dateFrom.localeCompare(a.dateFrom))
        .map(e => ({ id: e.id, meta: periodMeta(e.dateFrom, e.dateTo, lang, present), data: e }));
      this.pro.set(toEntries(data.pro));
      this.internships.set(toEntries(data.stage));
    });

    this.translate.stream(inviteKeys('EXPERIENCES'))
      .pipe(takeUntil(this.destroy$))
      .subscribe((labels: Record<string, string>) => this.invite.set(buildInvite('EXPERIENCES', labels, () => this.contact.open('pro'))));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
