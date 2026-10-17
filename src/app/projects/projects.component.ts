import { Component, inject, OnDestroy, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ScrollRevealDirective } from '../shared/directives/scroll-reveal.directive';
import { catchError, combineLatest, forkJoin, map, Observable, of, startWith, Subject, switchMap, take, takeUntil } from 'rxjs';
import { Project, ProjectLink, ProjectLinkType } from 'src/assets/data/contentInterface';
import { ContactService } from '../services/contact.service';
import { GetJsonService } from '../services/get-json.service';
import { LanguageService } from '../services/language.service';
import { ExperienceCardComponent } from '../shared/experience-card/experience-card.component';
import { TimelineComponent, TimelineEntry, TimelineInvite } from '../shared/timeline/timeline.component';
import { buildInvite, inviteKeys } from '../shared/timeline/invite';
import { formatDay, formatMonthYear } from '../shared/timeline/format';

interface ProjectCard {
  project: Project;
  links: ProjectLink[];
}

// Code link always comes first on a card
const LINK_ORDER: Record<ProjectLinkType, number> = { repo: 0, live: 1, download: 2 };

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [TranslatePipe, ScrollRevealDirective, TimelineComponent, ExperienceCardComponent],
})
export class ProjectsComponent implements OnInit, OnDestroy {
  readonly entries = signal<TimelineEntry<ProjectCard>[]>([]);
  invite?: TimelineInvite;
  private readonly json = inject(GetJsonService);
  private readonly http = inject(HttpClient);
  private readonly langService = inject(LanguageService);
  private readonly translate = inject(TranslateService);
  private readonly contact = inject(ContactService);
  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    const projects$ = this.json.getProjects();
    // Static updatedAt is shown first, then replaced by GitHub's last push once it answers
    const pushedAt$ = projects$.pipe(
      take(1),
      switchMap(projects => this.fetchPushedAt(projects)),
      startWith({} as Record<string, string>),
    );

    combineLatest([
      projects$,
      pushedAt$,
      this.langService.currentLanguage$,
      this.translate.stream(['PROJECTS.CREATED', 'PROJECTS.UPDATED']),
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([projects, pushedAt, lang, labels]) => {
        this.entries.set([...projects]
          .sort((a, b) => b.dateFrom.localeCompare(a.dateFrom))
          .map(project => {
            const slug = githubSlug(project);
            return {
              id: project.id,
              meta: [
                { label: labels['PROJECTS.CREATED'], value: formatMonthYear(project.dateFrom, lang), emphasis: true },
                { label: labels['PROJECTS.UPDATED'], value: formatDay((slug && pushedAt[slug]) || project.updatedAt, lang) },
              ],
              data: {
                project,
                links: [...project.links].sort((a, b) => LINK_ORDER[a.type] - LINK_ORDER[b.type]),
              },
            };
          }));
      });

    this.translate.stream(inviteKeys('PROJECTS'))
      .pipe(takeUntil(this.destroy$))
      .subscribe((labels: Record<string, string>) => this.invite = buildInvite('PROJECTS', labels, () => this.contact.open('project')));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /** Last push date per GitHub repo slug; repos that fail to load are left out. */
  private fetchPushedAt(projects: Project[]): Observable<Record<string, string>> {
    const slugs = projects.map(githubSlug).filter((s): s is string => !!s);
    if (!slugs.length) return of({});
    return forkJoin(
      slugs.map(slug =>
        this.http.get<{ pushed_at: string }>(`https://api.github.com/repos/${slug}`).pipe(
          map(repo => [slug, repo.pushed_at] as const),
          catchError(() => of(null)),
        ),
      ),
    ).pipe(map(results => Object.fromEntries(results.filter(r => r !== null))));
  }
}

function githubSlug(project: Project): string | null {
  const repo = project.links.find(l => l.type === 'repo');
  return repo?.url.match(/github\.com\/([^/]+\/[^/]+)/)?.[1] ?? null;
}
