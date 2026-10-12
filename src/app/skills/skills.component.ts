import { Component, computed, HostListener, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { SkillId, SkillLevel } from 'src/assets/data/skills';
import { GetJsonService } from '../services/get-json.service';
import { SkillsService } from '../services/skills.service';
import { ScrollRevealDirective } from '../shared/directives/scroll-reveal.directive';
import { matching, selectable, toggle } from './skill-selection';
import { SkillPanelComponent } from './skill-panel/skill-panel.component';

@Component({
  selector: 'app-skills',
  templateUrl: './skills.component.html',
  styleUrl: './skills.component.scss',
  standalone: true,
  imports: [TranslateModule, ScrollRevealDirective, SkillPanelComponent],
  host: { '[class.panel-open]': 'selected().length > 0' },
})
export class SkillsComponent implements OnInit, OnDestroy {
  softs?: string[];
  private readonly json = inject(GetJsonService);
  private readonly skillsService = inject(SkillsService);
  private readonly destroy$ = new Subject<void>();

  readonly categories = toSignal(this.skillsService.getCategories(), { initialValue: [] });
  private readonly items = toSignal(this.skillsService.getLinkedItems(), { initialValue: [] });

  readonly selected = signal<SkillId[]>([]);
  readonly results = computed(() => matching(this.items(), this.selected()));
  private readonly allowed = computed(() => selectable(this.items(), this.selected()));

  ngOnInit(): void {
    this.json.getSoftSkills().pipe(takeUntil(this.destroy$)).subscribe(data => {
      this.softs = data;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('document:keydown.escape')
  clear(): void {
    this.selected.set([]);
  }

  onSkill(id: SkillId): void {
    this.selected.set(toggle(this.items(), this.selected(), id));
  }

  isSelected(id: SkillId): boolean {
    return this.selected().includes(id);
  }

  isGreyed(id: SkillId): boolean {
    const allowed = this.allowed();
    return !!allowed && !allowed.has(id) && !this.isSelected(id);
  }

  // Hover accent colour only distinguishes the two top levels
  getLevelClass(level: SkillLevel): 'advanced' | 'intermediate' | 'beginner' {
    if (level === 'advanced') return 'advanced';
    if (level === 'intermediate') return 'intermediate';
    return 'beginner';
  }
}
