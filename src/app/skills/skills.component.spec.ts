import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { SkillsComponent } from './skills.component';
import { GetJsonService } from '../services/get-json.service';
import { SkillCategory } from 'src/assets/data/contentInterface';

const MOCK_SKILLS: SkillCategory[] = [
  {
    name: 'Langages de programmation & scripting',
    skills: [
      {
        lang: 'TypeScript (& JavaScript)',
        time: '6 années',
        level: 'projets professionnels & personnels : niveau avancé',
        years: 6,
        levelKey: 'advanced',
      },
      {
        lang: 'PHP',
        time: '1 année',
        level: 'projets professionnels : bonnes bases',
        years: 1,
        levelKey: 'beginner',
      },
    ],
  },
];

describe('SkillsComponent', () => {
  let component: SkillsComponent;
  let fixture: ComponentFixture<SkillsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkillsComponent, TranslateModule.forRoot()],
      providers: [
        {
          provide: GetJsonService,
          useValue: {
            getSkills: () => of(MOCK_SKILLS),
            getSoftSkills: () => of(['Autonomie', 'Rigueur']),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SkillsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('maps skill categories plus a soft-skills category', () => {
    expect(component.categories.length).toBe(2);
    expect(component.categories[0].id).toBe('langages-de-programmation-scripting');
    expect(component.categories[1].id).toBe('soft-skills');
  });

  it('maps skills to cards with years, meta, detail and emphasis', () => {
    const ts = component.categories[0].cards[0];
    expect(ts.title).toBe('TypeScript (& JavaScript)');
    expect(ts.years).toBe(6);
    expect(ts.meta).toBe('6 années');
    expect(ts.detail).toContain('niveau avancé');
    expect(ts.emphasis).toBe('high');
    expect(component.categories[0].cards[1].emphasis).toBe('low');
  });

  it('soft skill cards have no years and no detail', () => {
    const soft = component.categories[1].cards[0];
    expect(soft.years).toBeUndefined();
    expect(soft.detail).toBeUndefined();
  });

  it('renders the constellation', () => {
    expect(fixture.debugElement.query(By.css('app-constellation'))).toBeTruthy();
    expect(fixture.debugElement.queryAll(By.css('.tile')).length).toBe(2);
  });
});
