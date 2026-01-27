import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Header } from 'src/assets/data/contentInterface';
import { GetJsonService } from '../services/get-json.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.scss',
  standalone: true,
  imports: [CommonModule, MatIconModule],
})
export class HomepageComponent implements OnInit, OnDestroy {
  profile?: string | undefined;
  header: Header | undefined;
  private destroy$ = new Subject<void>();

  constructor(private readonly json: GetJsonService) {}

  ngOnInit(): void {
    this.json.getProfile(0)?.pipe(
      takeUntil(this.destroy$)
    ).subscribe((data) => {
      this.profile = data;
    });
    this.json.getHeader(0)?.pipe(
      takeUntil(this.destroy$)
    ).subscribe((data) => {
      this.header = data;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
