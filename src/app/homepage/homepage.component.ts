import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { Header } from 'src/assets/data/contentInterface';
import { PageStepComponent } from '../layout/page-step/page-step.component';
import { GetJsonService } from '../services/get-json.service';
import { TypewriterService } from '../services/typewriter.service';
import { ScrollRevealDirective } from '../shared/directives/scroll-reveal.directive';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    CommonModule,
    ScrollRevealDirective,
    PageStepComponent,
  ],
})
export class HomepageComponent implements OnInit, OnDestroy {
  header = signal<Header | null>(null);
  profile = signal<string>('');
  displayedTitle = signal('');
  isTypingDone = signal(false);

  private readonly json = inject(GetJsonService);
  private readonly typewriter = inject(TypewriterService);
  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.json
      .getHeader()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.header.set(data);
        this.isTypingDone.set(false);
        this.typewriter
          .type(data.title, 25)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (v) => this.displayedTitle.set(v),
            complete: () => this.isTypingDone.set(true),
          });
      });

    this.json
      .getProfile()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.profile.set(data);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
