import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ScrollRevealDirective } from '../shared/directives/scroll-reveal.directive';
import { combineLatest, Subject, takeUntil } from 'rxjs';
import { Skill, SkillCategory } from 'src/assets/data/contentInterface';
import { GetJsonService } from '../services/get-json.service';
import { ConstellationComponent } from '../shared/constellation/constellation.component';
import {
  ConstellationCard,
  ConstellationCategory,
} from '../shared/constellation/constellation.types';
import { slugify } from '../shared/constellation/constellation-layout.service';

const EMPHASIS: Record<Skill['levelKey'], ConstellationCard['emphasis']> = {
  advanced: 'high',
  intermediate: 'medium',
  beginner: 'low',
};

@Component({
  selector: 'app-skills',
  templateUrl: './skills.component.html',
  styleUrl: './skills.component.scss',
  standalone: true,
  imports: [CommonModule, TranslateModule, ScrollRevealDirective, ConstellationComponent],
})
export class SkillsComponent implements OnInit, OnDestroy {
  categories: ConstellationCategory[] = [];
  private readonly json = inject(GetJsonService);
  private readonly translate = inject(TranslateService);
  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    combineLatest([
      this.json.getSkills(),
      this.json.getSoftSkills(),
      this.translate.stream('SKILLS.SOFT'),
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([skillCategories, softs, softLabel]) => {
        this.categories = this.toCategories(skillCategories, softs, softLabel);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private toCategories(
    skillCategories: SkillCategory[],
    softs: string[],
    softLabel: string
  ): ConstellationCategory[] {
    const categories: ConstellationCategory[] = skillCategories.map((category) => ({
      id: slugify(category.name),
      label: category.name,
      cards: category.skills.map((skill) => ({
        id: slugify(skill.lang),
        title: skill.lang,
        years: skill.years,
        meta: skill.time,
        detail: skill.level,
        tags: [],
        emphasis: EMPHASIS[skill.levelKey],
      })),
    }));
    categories.push({
      id: 'soft-skills',
      label: softLabel,
      cards: softs.map((soft) => ({ id: slugify(soft), title: soft })),
    });
    return categories;
  }
}
