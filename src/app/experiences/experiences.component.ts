import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { Experience, MagneticScrollItem } from 'src/assets/data/contentInterface';
import { GetJsonService } from '../services/get-json.service';
import { MagneticScrollComponent } from '../shared/magnetic-scroll/magnetic-scroll.component';

@Component({
  selector: 'app-experiences',
  templateUrl: './experiences.component.html',
  styleUrl: './experiences.component.scss',
  standalone: true,
  imports: [TranslateModule, MagneticScrollComponent],
})
export class ExperiencesComponent implements OnInit, OnDestroy {
  proItems   = signal<MagneticScrollItem[]>([]);
  stageItems = signal<MagneticScrollItem[]>([]);

  private readonly json     = inject(GetJsonService);
  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.json.getExp().pipe(takeUntil(this.destroy$)).subscribe(data => {
      this.proItems.set(data.pro.map((e: Experience) => ({
        title:        e.title,
        organisation: e.company,
        location:     e.location,
        dateFrom:     e.dfrom,
        dateTo:       e.to,
        descriptions: e.descriptions,
      })));
      this.stageItems.set(data.stage.map((e: Experience) => ({
        title:        e.title,
        organisation: e.company,
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
