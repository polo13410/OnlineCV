import { Component } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { ConstellationComponent } from './constellation.component';
import { ConstellationCardDirective } from './constellation-card.directive';
import { ConstellationCategory } from './constellation.types';

const CATS: ConstellationCategory[] = [
  {
    id: 'langages',
    label: 'Langages',
    cards: [
      { id: 'ts', title: 'TypeScript', years: 6, meta: '6 années', detail: 'niveau avancé', emphasis: 'high', tags: ['utilisé récemment'] },
      { id: 'php', title: 'PHP', years: 1, meta: '1 année', detail: 'bonnes bases', emphasis: 'low' },
      { id: 'sans-detail', title: 'Sans détail' },
    ],
  },
  {
    id: 'musique',
    label: 'Musique',
    cards: [{ id: 'spotify', title: 'Spotify', templateId: 'spotify' }],
  },
];

@Component({
  standalone: true,
  imports: [ConstellationComponent, ConstellationCardDirective],
  template: `
    <app-constellation [categories]="categories" seed="test">
      <ng-template appConstellationCard="spotify">
        <span class="custom-card">CUSTOM</span>
      </ng-template>
    </app-constellation>
  `,
})
class HostComponent {
  categories = CATS;
}

describe('ConstellationComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let component: ConstellationComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent, TranslateModule.forRoot()],
    }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    component = fixture.debugElement.query(
      By.directive(ConstellationComponent)
    ).componentInstance;
  });

  describe('state machine', () => {
    it('starts at rest', () => {
      expect(component.state().kind).toBe('rest');
    });

    it('openCategory moves to deployed', () => {
      component.openCategory('langages');
      expect(component.state()).toEqual({ kind: 'deployed', categoryId: 'langages' });
    });

    it('openDetail requires a deployed category and a detail', () => {
      component.openDetail(CATS[0].cards[0]);
      expect(component.state().kind).toBe('rest');
      component.openCategory('langages');
      component.openDetail(CATS[0].cards[2]); // sans détail → ignoré
      expect(component.state().kind).toBe('deployed');
      component.openDetail(CATS[0].cards[0]);
      expect(component.state()).toEqual({
        kind: 'detail',
        categoryId: 'langages',
        cardId: 'ts',
      });
    });

    it('back unwinds detail → deployed → rest, escape included', () => {
      component.openCategory('langages');
      component.openDetail(CATS[0].cards[0]);
      component.onEscape();
      expect(component.state()).toEqual({ kind: 'deployed', categoryId: 'langages' });
      component.back();
      expect(component.state().kind).toBe('rest');
      component.back(); // no-op au repos
      expect(component.state().kind).toBe('rest');
    });

    it('openCategory switches directly between categories', () => {
      component.openCategory('langages');
      component.openCategory('musique');
      expect(component.state()).toEqual({ kind: 'deployed', categoryId: 'musique' });
    });

    it('categorySlot centers the active category and shifts periphery indices', () => {
      component.openCategory('musique'); // index 1 of 2
      expect(component.categorySlot(1)).toEqual({ x: 50, y: 50, rotation: 0 });
      expect(component.categorySlot(0)).toEqual(component.peripherySlots()[0]);
    });

    it('falls back to rest slots when the active id is not in categories', () => {
      component.openCategory('disparue');
      expect(component.categorySlot(0)).toEqual(component.restSlots()[0]);
    });

    it('collapses to rest when the active category disappears (language switch)', () => {
      component.openCategory('langages');
      fixture.detectChanges();
      fixture.componentInstance.categories = [
        { id: 'languages-en', label: 'Languages', cards: [{ id: 'ts-en', title: 'TypeScript' }] },
      ];
      fixture.detectChanges();
      expect(component.state().kind).toBe('rest');
      expect(fixture.debugElement.query(By.css('.constellation')).classes['is-deployed'])
        .toBeFalsy();
    });
  });

  describe('rest rendering', () => {
    it('renders one tile button per category with its count', () => {
      const tiles = fixture.debugElement.queryAll(By.css('.tile'));
      expect(tiles.length).toBe(2);
      expect(tiles[0].nativeElement.textContent).toContain('Langages');
      expect(tiles[0].nativeElement.textContent).toContain('3');
    });

    it('renders preview ghosts (max 3) for each tile', () => {
      const groups = fixture.debugElement.queryAll(By.css('.tile-group'));
      expect(groups[0].queryAll(By.css('.preview-ghost')).length).toBe(3);
      expect(groups[1].queryAll(By.css('.preview-ghost')).length).toBe(1);
    });

    it('renders connecting lines between consecutive tiles', () => {
      expect(fixture.debugElement.queryAll(By.css('.lines line')).length).toBe(1);
    });

    it('clicking a tile deploys its category', () => {
      fixture.debugElement.queryAll(By.css('.tile'))[0].nativeElement.click();
      fixture.detectChanges();
      expect(component.state()).toEqual({ kind: 'deployed', categoryId: 'langages' });
    });

    it('escape key unwinds the state via the document listener', () => {
      component.openCategory('langages');
      fixture.detectChanges();
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      fixture.detectChanges();
      expect(component.state().kind).toBe('rest');
    });
  });

  describe('deployed rendering', () => {
    beforeEach(() => {
      component.openCategory('langages');
      fixture.detectChanges();
    });

    it('renders one bubble per card of the active category', () => {
      expect(fixture.debugElement.queryAll(By.css('.bubble')).length).toBe(3);
    });

    it('sizes bubbles proportionally to years', () => {
      const bubbles = fixture.debugElement.queryAll(By.css('button.bubble'));
      const sizeOf = (el: { nativeElement: HTMLElement }) =>
        parseFloat(el.nativeElement.style.getPropertyValue('--size'));
      expect(sizeOf(bubbles[0])).toBeGreaterThan(sizeOf(bubbles[1])); // TS 6 ans > PHP 1 an
    });

    it('disables bubbles without detail', () => {
      const bubbles = fixture.debugElement.queryAll(By.css('button.bubble'));
      expect(bubbles[2].nativeElement.disabled).toBeTrue();
    });

    it('marks non-active categories as periphery, still clickable', () => {
      const periphery = fixture.debugElement.queryAll(By.css('.tile-group.is-periphery'));
      expect(periphery.length).toBe(1);
      periphery[0].query(By.css('.tile')).nativeElement.click();
      fixture.detectChanges();
      expect(component.state()).toEqual({ kind: 'deployed', categoryId: 'musique' });
    });

    it('back button returns to rest', () => {
      fixture.debugElement.query(By.css('.back')).nativeElement.click();
      fixture.detectChanges();
      expect(component.state().kind).toBe('rest');
      expect(fixture.debugElement.queryAll(By.css('.bubble')).length).toBe(0);
    });

    it('renders projected templates for templateId cards', () => {
      component.openCategory('musique');
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('.custom-card'))).toBeTruthy();
      expect(fixture.debugElement.query(By.css('.custom-card')).nativeElement.textContent)
        .toBe('CUSTOM');
    });

    it('renders one line from center per bubble', () => {
      expect(fixture.debugElement.queryAll(By.css('.lines line')).length).toBe(3);
    });

    it('restores focus to the active tile when going back to rest', fakeAsync(() => {
      fixture.debugElement.query(By.css('.back')).nativeElement.click();
      fixture.detectChanges();
      tick();
      expect(document.activeElement?.getAttribute('data-category-id')).toBe('langages');
    }));

    it('moves focus into the dialog when a detail opens', fakeAsync(() => {
      fixture.debugElement.queryAll(By.css('button.bubble'))[0].nativeElement.click();
      fixture.detectChanges();
      tick();
      expect(document.activeElement?.classList.contains('detail-panel')).toBeTrue();
    }));

    it('returns focus to the bubble when the detail closes', fakeAsync(() => {
      fixture.debugElement.queryAll(By.css('button.bubble'))[0].nativeElement.click();
      fixture.detectChanges();
      tick();
      fixture.debugElement.query(By.css('.detail-close')).nativeElement.click();
      fixture.detectChanges();
      tick();
      expect(document.activeElement?.getAttribute('data-card-id')).toBe('ts');
    }));
  });

  describe('detail rendering', () => {
    beforeEach(() => {
      component.openCategory('langages');
      fixture.detectChanges();
      fixture.debugElement.queryAll(By.css('button.bubble'))[0].nativeElement.click();
      fixture.detectChanges();
    });

    it('opens the detail panel with title, meta and detail text', () => {
      const panel = fixture.debugElement.query(By.css('.detail-panel'));
      expect(panel).toBeTruthy();
      expect(panel.nativeElement.textContent).toContain('TypeScript');
      expect(panel.nativeElement.textContent).toContain('6 années');
      expect(panel.nativeElement.textContent).toContain('niveau avancé');
    });

    it('dims the other bubbles', () => {
      const dimmed = fixture.debugElement.queryAll(By.css('.bubble.is-dimmed'));
      expect(dimmed.length).toBe(2);
    });

    it('closes on backdrop click', () => {
      fixture.debugElement.query(By.css('.detail-backdrop')).nativeElement.click();
      fixture.detectChanges();
      expect(component.state().kind).toBe('deployed');
      expect(fixture.debugElement.query(By.css('.detail-panel'))).toBeNull();
    });

    it('closes via the close button', () => {
      fixture.debugElement.query(By.css('.detail-close')).nativeElement.click();
      fixture.detectChanges();
      expect(component.state().kind).toBe('deployed');
    });

    it('renders tags in the panel', () => {
      expect(fixture.debugElement.queryAll(By.css('.detail-tag')).length).toBe(1);
    });
  });
});
