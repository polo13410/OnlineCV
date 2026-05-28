import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ScrollRevealDirective } from '../shared/directives/scroll-reveal.directive';
import { Subject, takeUntil } from 'rxjs';
import { Experiences } from 'src/assets/data/contentInterface';
import { GetJsonService } from '../services/get-json.service';

@Component({
  selector: 'app-experiences',
  templateUrl: './experiences.component.html',
  styleUrl: './experiences.component.scss',
  standalone: true,
  imports: [CommonModule, TranslateModule, ScrollRevealDirective],
})
export class ExperiencesComponent implements OnInit, OnDestroy {
  experiences?: Experiences;
  openPro = new Set<number>();
  openStage = new Set<number>();
  private readonly json = inject(GetJsonService);
  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.json.getExp().pipe(takeUntil(this.destroy$)).subscribe(data => {
      this.experiences = data;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  togglePro(i: number): void {
    this.openPro.has(i) ? this.openPro.delete(i) : this.openPro.add(i);
  }

  toggleStage(i: number): void {
    this.openStage.has(i) ? this.openStage.delete(i) : this.openStage.add(i);
  }
}
