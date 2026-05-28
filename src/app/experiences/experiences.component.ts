// src/app/experiences/experiences.component.ts
import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subject, combineLatest, takeUntil } from 'rxjs';
import { Experience, MagneticScrollItem, MagneticScrollSection } from 'src/assets/data/contentInterface';
import { GetJsonService } from '../services/get-json.service';
import { MagneticScrollComponent } from '../shared/magnetic-scroll/magnetic-scroll.component';

@Component({
  selector: 'app-experiences',
  templateUrl: './experiences.component.html',
  styleUrl: './experiences.component.scss',
  standalone: true,
  imports: [MagneticScrollComponent],
})
export class ExperiencesComponent implements OnInit, OnDestroy {
  sections = signal<MagneticScrollSection[]>([]);

  private readonly json      = inject(GetJsonService);
  private readonly translate = inject(TranslateService);
  private readonly destroy$  = new Subject<void>();

  ngOnInit(): void {
    combineLatest([
      this.json.getExp(),
      this.translate.stream('EXPERIENCES.OVERLINE'),
      this.translate.stream('EXPERIENCES.TITLE'),
      this.translate.stream('EXPERIENCES.STAGES_OVERLINE'),
      this.translate.stream('EXPERIENCES.INTERNSHIPS'),
    ]).pipe(takeUntil(this.destroy$)).subscribe(([data, proOverline, proTitle, stageOverline, stageTitle]) => {
      const proItems   = (data.pro   as Experience[]).map(this.toItem);
      const stageItems = (data.stage as Experience[]).map(this.toItem);
      this.sections.set([
        { overline: proOverline,   title: proTitle,   items: proItems   },
        { overline: stageOverline, title: stageTitle, items: stageItems },
      ]);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private toItem(e: Experience): MagneticScrollItem {
    return {
      title:        e.title,
      organisation: e.company,
      location:     e.location,
      dateFrom:     e.dfrom,
      dateTo:       e.to,
      descriptions: e.descriptions,
    };
  }
}
