import { Component, inject, Input, signal, ChangeDetectionStrategy } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '@ngx-translate/core';
import { ProjectLink, ProjectLinkType } from 'src/assets/data/contentInterface';
import { SkillId } from 'src/assets/data/skills';
import { LanguageService } from '../../services/language.service';
import { skillLabel } from '../../services/skills.service';

const COLLAPSED_BULLETS = 4;

@Component({
  selector: 'app-experience-card',
  templateUrl: './experience-card.component.html',
  styleUrl: './experience-card.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [TranslatePipe],
})
export class ExperienceCardComponent {
  @Input() variant: 'full' | 'compact' = 'full';
  @Input() icon?: string;
  @Input() iconFill = false;
  @Input() iconDark?: 'invert' | 'plate';
  @Input({ required: true }) title!: string;
  @Input() subtitle?: string;
  @Input() badge?: string;
  @Input() badgeTone: 'blue' | 'orange' = 'blue';
  @Input() period?: string;
  @Input() summary?: string;
  @Input() bullets: string[] = [];
  @Input() skills: SkillId[] = [];
  @Input() highlight: SkillId[] = [];
  @Input() links: ProjectLink[] = [];

  private readonly lang = toSignal(inject(LanguageService).currentLanguage$, { requireSync: true });
  readonly expanded = signal(false);

  readonly linkLabels: Record<ProjectLinkType, string> = {
    live:     'CARD.LINK_LIVE',
    repo:     'CARD.LINK_REPO',
    download: 'CARD.LINK_DOWNLOAD',
  };

  get visibleBullets(): string[] {
    return this.expanded() ? this.bullets : this.bullets.slice(0, COLLAPSED_BULLETS);
  }

  get canExpand(): boolean {
    return this.bullets.length > COLLAPSED_BULLETS;
  }

  label(id: SkillId): string {
    return skillLabel(id, this.lang(), true);
  }
}
