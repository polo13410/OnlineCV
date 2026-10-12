import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { Header } from 'src/assets/data/contentInterface';
import { GetJsonService } from '../../services/get-json.service';
import { PAGES } from '../../services/page-navigation.service';
import { BuildInfoComponent } from '../build-info/build-info.component';
import { HeaderLinksComponent } from '../header-links/header-links.component';
import { LangToggleComponent } from '../lang-toggle/lang-toggle.component';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.scss',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, BuildInfoComponent, HeaderLinksComponent, LangToggleComponent],
})
export class NavComponent implements OnInit, OnDestroy {
  @Input() isMobile = false;
  @Input() isOpen = true;
  @Output() navToggle = new EventEmitter<void>();

  header = signal<Header | null>(null);

  private readonly json = inject(GetJsonService);
  private readonly destroy$ = new Subject<void>();

  navLinks = PAGES;

  ngOnInit(): void {
    this.json.getHeader().pipe(takeUntil(this.destroy$)).subscribe(h => this.header.set(h));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
