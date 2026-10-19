import { afterRenderEffect, Component, computed, ElementRef, inject, Input, signal, viewChild, ChangeDetectionStrategy } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '@ngx-translate/core';
import { ProjectLink, ProjectLinkType } from 'src/assets/data/contentInterface';
import { SkillId } from 'src/assets/data/skills';
import { LanguageService } from '../../services/language.service';
import { skillLabel } from '../../services/skills.service';

const COLLAPSED_LINES = 8;
let nextDescriptionId = 0;

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
  @Input() iconDarkSrc?: string;
  @Input() iconFill = false;
  @Input() iconDark?: 'invert' | 'plate';
  @Input({ required: true }) title!: string;
  @Input() translateTitle = false;
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
  readonly descriptionId = `xp-description-${nextDescriptionId++}`;
  private readonly descriptionBody = viewChild<ElementRef<HTMLElement>>('descriptionBody');
  private readonly fullHeight = signal(0);
  private readonly previewHeight = signal(0);
  readonly canExpand = computed(() => this.fullHeight() > this.previewHeight() + 1);
  readonly descriptionHeight = computed(() => this.fullHeight()
    ? (this.expanded() ? this.fullHeight() : Math.min(this.fullHeight(), this.previewHeight()))
    : null);

  constructor() {
    afterRenderEffect(onCleanup => {
      const body = this.descriptionBody()?.nativeElement;
      if (!body) return;
      // Measure the complete text, so wrapping, language and font changes all update the preview.
      const measure = () => {
        this.fullHeight.set(body.getBoundingClientRect().height);
        this.previewHeight.set(parseFloat(getComputedStyle(body).lineHeight) * COLLAPSED_LINES);
      };
      const observer = new ResizeObserver(measure);
      observer.observe(body);
      measure();
      onCleanup(() => observer.disconnect());
    });
  }

  readonly linkLabels: Record<ProjectLinkType, string> = {
    live:     'CARD.LINK_LIVE',
    repo:     'CARD.LINK_REPO',
    download: 'CARD.LINK_DOWNLOAD',
  };

  label(id: SkillId): string {
    return skillLabel(id, this.lang(), true);
  }
}
