import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { ScrollRevealDirective } from '../shared/directives/scroll-reveal.directive';
import { catchError, combineLatest, forkJoin, map, Observable, of, startWith, Subject, switchMap, take, takeUntil } from 'rxjs';
import { Project, ProjectLink, ProjectLinkType } from 'src/assets/data/contentInterface';
import { GetJsonService } from '../services/get-json.service';
import { LanguageService, SupportedLanguage } from '../services/language.service';

interface TimelineEntry {
  project: Project;
  links: ProjectLink[];
  created: string;
  updated: string;
}

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss',
  standalone: true,
  imports: [CommonModule, TranslateModule, ScrollRevealDirective],
})
export class ProjectsComponent implements OnInit, OnDestroy {
  entries: TimelineEntry[] = [];
  private readonly json = inject(GetJsonService);
  private readonly http = inject(HttpClient);
  private readonly langService = inject(LanguageService);
  private readonly destroy$ = new Subject<void>();

  readonly linkLabels: Record<ProjectLinkType, string> = {
    live:     'PROJECTS.LINK_LIVE',
    repo:     'PROJECTS.LINK_REPO',
    download: 'PROJECTS.LINK_DOWNLOAD',
  };

  // Code link always comes first on a card
  private readonly linkOrder: Record<ProjectLinkType, number> = { repo: 0, live: 1, download: 2 };

  ngOnInit(): void {
    const projects$ = this.json.getProjects();
    // Static updatedAt is shown first, then replaced by GitHub's last push once it answers
    const pushedAt$ = projects$.pipe(
      take(1),
      switchMap(projects => this.fetchPushedAt(projects)),
      startWith({} as Record<string, string>),
    );

    combineLatest([projects$, pushedAt$, this.langService.currentLanguage$])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([projects, pushedAt, lang]) => {
        this.entries = [...projects]
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
          .map(project => {
            const slug = githubSlug(project);
            return {
              project,
              links: [...project.links].sort((a, b) => this.linkOrder[a.type] - this.linkOrder[b.type]),
              created: formatDate(project.createdAt, lang, { month: 'long', year: 'numeric' }),
              updated: formatDate((slug && pushedAt[slug]) || project.updatedAt, lang, { day: 'numeric', month: 'long', year: 'numeric' }),
            };
          });
      });
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

function formatDate(iso: string, lang: SupportedLanguage, options: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat(lang, { ...options, timeZone: 'UTC' }).format(new Date(iso));
}
