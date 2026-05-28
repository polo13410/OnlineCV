// src/app/education/education.component.ts
import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { Education, MagneticScrollItem } from 'src/assets/data/contentInterface';
import { GetJsonService } from '../services/get-json.service';
import { MagneticScrollComponent } from '../shared/magnetic-scroll/magnetic-scroll.component';

@Component({
  selector: 'app-education',
  templateUrl: './education.component.html',
  styleUrl: './education.component.scss',
  standalone: true,
  imports: [TranslateModule, MagneticScrollComponent],
})
export class EducationComponent implements OnInit, OnDestroy {
  items = signal<MagneticScrollItem[]>([]);

  private readonly json     = inject(GetJsonService);
  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.json.getEdu().pipe(takeUntil(this.destroy$)).subscribe(data => {
      this.items.set(data.map((e: Education) => ({
        title:        e.title,
        organisation: e.school,
        location:     e.location,
        dateFrom:     e.dfrom,
        dateTo:       e.to,
        descriptions: e.descriptions,
      })));
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
