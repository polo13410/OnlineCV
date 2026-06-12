import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
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
      { id: 'ts', title: 'TypeScript', years: 6, meta: '6 années', detail: 'niveau avancé', emphasis: 'high' },
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
  });
});
