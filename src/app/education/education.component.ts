import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { GetJsonService } from '../services/get-json.service';
import { Education } from 'src/assets/data/contentInterface';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-education',
  templateUrl: './education.component.html',
  styleUrl: './education.component.scss',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatDividerModule, MatIconModule],
})
export class EducationComponent implements OnInit, OnDestroy {
  education?: Education[] = [];
  private destroy$ = new Subject<void>();

  constructor(private readonly json: GetJsonService) {}

  ngOnInit(): void {
    this.json.getEdu(0)?.pipe(
      takeUntil(this.destroy$)
    ).subscribe((data) => {
      this.education = data;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
