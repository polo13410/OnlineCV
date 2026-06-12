import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  HostListener,
  inject,
  input,
  signal,
} from '@angular/core';
import { CommonModule, NgTemplateOutlet } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import {
  ConstellationLayoutService,
  ConstellationSlot,
} from './constellation-layout.service';
import { ConstellationCardDirective } from './constellation-card.directive';
import {
  ConstellationCard,
  ConstellationCategory,
  ConstellationState,
} from './constellation.types';

@Component({
  selector: 'app-constellation',
  templateUrl: './constellation.component.html',
  styleUrl: './constellation.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, NgTemplateOutlet, TranslateModule],
})
export class ConstellationComponent {
  readonly categories = input.required<ConstellationCategory[]>();
  readonly seed = input<string>('constellation');

  private readonly layout = inject(ConstellationLayoutService);
  private readonly cardTemplates = contentChildren(ConstellationCardDirective);

  readonly state = signal<ConstellationState>({ kind: 'rest' });
  readonly isMobile = signal(
    typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches
  );

  readonly previewOffsets = computed(() => this.layout.previewOffsets(3));

  readonly restSlots = computed(() =>
    this.layout.restSlots(
      this.categories().length,
      this.seed(),
      this.isMobile() ? 'mobile' : 'desktop'
    )
  );

  readonly restLines = computed(() => {
    const slots = this.restSlots();
    return slots.slice(1).map((slot, i) => ({
      x1: slots[i].x,
      y1: slots[i].y,
      x2: slot.x,
      y2: slot.y,
    }));
  });

  readonly activeCategory = computed(() => {
    const s = this.state();
    if (s.kind === 'rest') return undefined;
    return this.categories().find((c) => c.id === s.categoryId);
  });

  readonly orbitSlots = computed(() => {
    const active = this.activeCategory();
    return active ? this.layout.orbitSlots(active.cards.length) : [];
  });

  readonly orbitLines = computed(() =>
    this.orbitSlots().map((slot) => ({ x1: 50, y1: 50, x2: slot.x, y2: slot.y }))
  );

  readonly peripherySlots = computed(() =>
    this.layout.peripherySlots(Math.max(this.categories().length - 1, 0))
  );

  readonly maxYears = computed(() => {
    const active = this.activeCategory();
    if (!active) return 0;
    return Math.max(...active.cards.map((c) => c.years ?? 0), 0);
  });

  readonly detailCard = computed(() => {
    const s = this.state();
    if (s.kind !== 'detail') return undefined;
    return this.activeCategory()?.cards.find((c) => c.id === s.cardId);
  });

  categorySlot(index: number): ConstellationSlot {
    const s = this.state();
    const cats = this.categories();
    if (s.kind === 'rest') return this.restSlots()[index];
    const activeIndex = cats.findIndex((c) => c.id === s.categoryId);
    if (activeIndex === -1) return this.restSlots()[index];
    if (index === activeIndex) return { x: 50, y: 50, rotation: 0 };
    const slotIndex = index < activeIndex ? index : index - 1;
    return this.peripherySlots()[slotIndex];
  }

  isActive(categoryId: string): boolean {
    const s = this.state();
    return s.kind !== 'rest' && s.categoryId === categoryId;
  }

  diameterOf(card: ConstellationCard): number {
    return this.layout.bubbleDiameter(card.years, this.maxYears());
  }

  templateFor(templateId: string | undefined) {
    if (!templateId) return null;
    return (
      this.cardTemplates().find((t) => t.templateId === templateId)?.template ?? null
    );
  }

  previewCards(category: ConstellationCategory): ConstellationCard[] {
    return category.cards.slice(0, 3);
  }

  openCategory(categoryId: string): void {
    this.state.set({ kind: 'deployed', categoryId });
  }

  openDetail(card: ConstellationCard): void {
    const s = this.state();
    if (s.kind === 'rest' || !card.detail) return;
    this.state.set({ kind: 'detail', categoryId: s.categoryId, cardId: card.id });
  }

  back(): void {
    const s = this.state();
    if (s.kind === 'detail') {
      this.state.set({ kind: 'deployed', categoryId: s.categoryId });
    } else if (s.kind === 'deployed') {
      this.state.set({ kind: 'rest' });
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.back();
  }
}
