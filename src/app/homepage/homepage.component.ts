import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ScrollRevealDirective } from '../shared/directives/scroll-reveal.directive';
import { Subject, takeUntil } from 'rxjs';
import { Header } from 'src/assets/data/contentInterface';
import { GetJsonService } from '../services/get-json.service';
import { PageNavigationService } from '../services/page-navigation.service';
import { TypewriterService } from '../services/typewriter.service';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.scss',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, ScrollRevealDirective],
})
export class HomepageComponent implements OnInit, OnDestroy {
  readonly pageNav = inject(PageNavigationService);
  header = signal<Header | null>(null);
  profile = signal<string>('');
  displayedTitle = signal('');
  isTypingDone = signal(false);

  private readonly json = inject(GetJsonService);
  private readonly typewriter = inject(TypewriterService);
  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.json.getHeader().pipe(takeUntil(this.destroy$)).subscribe(data => {
      this.header.set(data);
      this.isTypingDone.set(false);
      this.typewriter.type(data.title, 55).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: v => this.displayedTitle.set(v),
        complete: () => this.isTypingDone.set(true),
      });
    });

    this.json.getProfile().pipe(takeUntil(this.destroy$)).subscribe(data => {
      this.profile.set(data);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
