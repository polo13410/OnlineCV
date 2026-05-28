import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ScrollRevealDirective } from '../shared/directives/scroll-reveal.directive';
import { Subject, takeUntil } from 'rxjs';
import { Education } from 'src/assets/data/contentInterface';
import { GetJsonService } from '../services/get-json.service';

@Component({
  selector: 'app-education',
  templateUrl: './education.component.html',
  styleUrl: './education.component.scss',
  standalone: true,
  imports: [CommonModule, TranslateModule, ScrollRevealDirective],
})
export class EducationComponent implements OnInit, OnDestroy {
  education?: Education[];
  openItems = new Set<number>();
  private readonly json = inject(GetJsonService);
  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.json.getEdu().pipe(takeUntil(this.destroy$)).subscribe(data => {
      this.education = data;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggle(i: number): void {
    this.openItems.has(i) ? this.openItems.delete(i) : this.openItems.add(i);
  }
}
