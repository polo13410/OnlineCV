import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { GetJsonService } from '../services/get-json.service';
import { SkillCategory } from 'src/assets/data/contentInterface';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-skills',
  templateUrl: './skills.component.html',
  styleUrl: './skills.component.scss',
  standalone: true,
  imports: [CommonModule, MatGridListModule, MatCardModule, MatDividerModule, MatIconModule],
})
export class SkillsComponent implements OnInit, OnDestroy {
  skillCategories?: SkillCategory[];
  softs?: string[];
  title = 'SkillComponent';
  gridColumns = 3;
  private destroy$ = new Subject<void>();

  constructor(private readonly json: GetJsonService) { }

  ngOnInit(): void {
    this.json.getSkills(0)?.pipe(
      takeUntil(this.destroy$)
    ).subscribe((data) => {
      this.skillCategories = data;
    });
    this.json.getSoftSkills(0)?.pipe(
      takeUntil(this.destroy$)
    ).subscribe((data) => {
      this.softs = data;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
