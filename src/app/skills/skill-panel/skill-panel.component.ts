import { Component, computed, EventEmitter, inject, input, Output } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SkillId } from 'src/assets/data/skills';
import { LanguageService } from '../../services/language.service';
import { LinkedItem, skillLabel } from '../../services/skills.service';
import { ExperienceCardComponent } from '../../shared/experience-card/experience-card.component';
import { formatMonthYear, formatPeriod } from '../../shared/timeline/format';

interface PanelGroup {
  key: 'pro' | 'perso';
  items: (LinkedItem & { period: string })[];
}

@Component({
  selector: 'app-skill-panel',
  templateUrl: './skill-panel.component.html',
  styleUrl: './skill-panel.component.scss',
  standalone: true,
  imports: [TranslateModule, ExperienceCardComponent],
})
export class SkillPanelComponent {
  readonly selected = input.required<SkillId[]>();
  readonly results = input.required<LinkedItem[]>();
  @Output() toggleSkill = new EventEmitter<SkillId>();
  @Output() closed = new EventEmitter<void>();

  private readonly router = inject(Router);
  private readonly lang = toSignal(inject(LanguageService).currentLanguage$, { requireSync: true });
  private readonly present = toSignal(inject(TranslateService).stream('EXPERIENCES.PRESENT'), { initialValue: '' });

  readonly groups = computed<PanelGroup[]>(() => {
    const lang = this.lang();
    return (['pro', 'perso'] as const)
      .map(key => ({
        key,
        items: this.results()
          .filter(item => item.group === key)
          .sort((a, b) => b.dateFrom.localeCompare(a.dateFrom))
          .map(item => ({
            ...item,
            // side projects have no end date: show when they started
            period: key === 'pro'
              ? formatPeriod(item.dateFrom, item.dateTo, lang, this.present())
              : formatMonthYear(item.dateFrom, lang),
          })),
      }))
      .filter(group => group.items.length);
  });

  label(id: SkillId): string {
    return skillLabel(id, this.lang(), true);
  }

  open(item: LinkedItem): void {
    this.router.navigate([item.route], { fragment: item.id });
  }
}
