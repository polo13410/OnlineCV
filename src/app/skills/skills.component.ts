import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ScrollRevealDirective } from '../shared/directives/scroll-reveal.directive';
import { Subject, takeUntil } from 'rxjs';
import { SkillCategory } from 'src/assets/data/contentInterface';
import { GetJsonService } from '../services/get-json.service';

@Component({
  selector: 'app-skills',
  templateUrl: './skills.component.html',
  styleUrl: './skills.component.scss',
  standalone: true,
  imports: [CommonModule, TranslateModule, ScrollRevealDirective],
})
export class SkillsComponent implements OnInit, OnDestroy {
  skillCategories?: SkillCategory[];
  softs?: string[];
  private readonly json = inject(GetJsonService);
  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.json.getSkills().pipe(takeUntil(this.destroy$)).subscribe(data => {
      this.skillCategories = data;
    });
    this.json.getSoftSkills().pipe(takeUntil(this.destroy$)).subscribe(data => {
      this.softs = data;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getLevelClass(level: string): 'advanced' | 'intermediate' | 'beginner' {
    const l = level.toLowerCase();
    if (l.includes('avancé') || l.includes('advanced') || l.includes('expert')) return 'advanced';
    if (l.includes('intermédiaire') || l.includes('intermediate') || l.includes('confirmé')) return 'intermediate';
    return 'beginner';
  }
}
