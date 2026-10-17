import { HttpClient } from '@angular/common/http';
import { Component, computed, inject, VERSION, ChangeDetectionStrategy } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '@ngx-translate/core';
import { catchError, of } from 'rxjs';
import { LanguageService } from '../../services/language.service';
import { formatDay } from '../../shared/timeline/format';

interface BuildInfo {
  node: string;
  builtAt: string;
  commit: string | null;
}

const REPO_URL = 'https://github.com/polo13410/OnlineCV';

/** "Angular 22.2 · Node 26.x · updated on … · a1b2c3d" — build-info.json only exists in built sites. */
@Component({
  selector: 'app-build-info',
  template: `
    <p>
      <span class="runtime" [title]="'Angular ' + angular">
        <img src="assets/icons/angular.svg" alt="Angular" width="14" height="14" />
        {{ angular }}
      </span>
      @if (info(); as info) {
        <span class="runtime" [title]="'Node.js ' + info.node">
          <img src="assets/icons/nodejs.svg" alt="Node.js" width="14" height="14" />
          {{ info.node }}
        </span>
      }
    </p>
    @if (info(); as info) {
      <p>
        <span>{{ 'BUILD.UPDATED' | translate }} {{ builtAt() }}</span>
        @if (info.commit) {
          <a [href]="repo + '/commit/' + info.commit" target="_blank" rel="noopener noreferrer">{{ info.commit }}</a>
        }
      </p>
    }
  `,
  styleUrl: './build-info.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [TranslatePipe],
})
export class BuildInfoComponent {
  readonly angular = `${VERSION.major}.${VERSION.minor}`;
  readonly repo = REPO_URL;
  readonly info = toSignal(
    inject(HttpClient).get<BuildInfo>('assets/build-info.json').pipe(catchError(() => of(null))),
    { initialValue: null },
  );
  private readonly lang = toSignal(inject(LanguageService).currentLanguage$, { requireSync: true });
  readonly builtAt = computed(() => {
    const info = this.info();
    return info ? formatDay(info.builtAt, this.lang()) : '';
  });
}
