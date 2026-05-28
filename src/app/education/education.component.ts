// src/app/education/education.component.ts
import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subject, combineLatest, takeUntil } from 'rxjs';
import { Education, MagneticScrollItem, MagneticScrollSection } from 'src/assets/data/contentInterface';
import { GetJsonService } from '../services/get-json.service';
import { MagneticScrollComponent } from '../shared/magnetic-scroll/magnetic-scroll.component';

@Component({
  selector: 'app-education',
  templateUrl: './education.component.html',
  styleUrl: './education.component.scss',
  standalone: true,
  imports: [MagneticScrollComponent],
})
export class EducationComponent implements OnInit, OnDestroy {
  sections = signal<MagneticScrollSection[]>([]);

  private readonly json      = inject(GetJsonService);
  private readonly translate = inject(TranslateService);
  private readonly destroy$  = new Subject<void>();

  ngOnInit(): void {
    combineLatest([
      this.json.getEdu(),
      this.translate.stream('EDUCATION.OVERLINE'),
      this.translate.stream('EDUCATION.TITLE'),
    ]).pipe(takeUntil(this.destroy$)).subscribe(([data, overline, title]) => {
      const items = (data as Education[]).map(e => ({
        title:        e.title,
        organisation: e.school,
        location:     e.location,
        dateFrom:     e.dfrom,
        dateTo:       e.to,
        descriptions: e.descriptions,
      } as MagneticScrollItem));
      this.sections.set([{ overline, title, items }]);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
