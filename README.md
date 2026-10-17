# OnlineCv

[![Netlify Status](https://api.netlify.com/api/v1/badges/ccdc1cca-684f-4ab9-bc77-4b96a4eb94b6/deploy-status)](https://app.netlify.com/sites/paulpera/deploys)
[![Live site](https://img.shields.io/badge/live-paulpera.ch-00C7B7?logo=netlify&logoColor=white)](https://paulpera.ch)
[![Last commit](https://img.shields.io/github/last-commit/polo13410/OnlineCV?color=3b7a85)](https://github.com/polo13410/OnlineCV/commits/master)
[![Angular](https://img.shields.io/badge/Angular-21-DD0031?logo=angular&logoColor=white)](https://angular.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Angular Material](https://img.shields.io/badge/Angular_Material-21-3F51B5?logo=angular&logoColor=white)](https://material.angular.dev)
[![ngx-translate](https://img.shields.io/badge/i18n-FR_%7C_EN-blue)](https://github.com/ngx-translate/core)
[![Netlify Functions](https://img.shields.io/badge/Netlify_Functions-Spotify_API-1DB954?logo=spotify&logoColor=white)](https://docs.netlify.com/functions/overview/)
[![Node.js](https://img.shields.io/badge/Node.js-%E2%89%A524-5FA04E?logo=nodedotjs&logoColor=white)](https://nodejs.org)

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 15.0.0.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `npx playwright install chromium` once, then `npm run build` and `npm run test:e2e`.
Playwright serves the production build and checks desktop and mobile navigation,
language switching and persistence, PDF downloads, and contact form validation/submission.
External HTTPS services are blocked and the contact API response is mocked: these tests
never send email and do not validate the deployed Netlify functions or Spotify service.

## Dependency updates

Use Node 24 (see `.nvmrc`). Before and after an update batch, run:

```sh
npm ci --strict-peer-deps
npx playwright install chromium
npm run verify
```

`verify` runs the production build, headless Karma unit tests, and Playwright smoke tests.
Karma needs Chrome/Chromium; set `CHROME_BIN` if it is not detected automatically.
To use an installed Google Chrome for Playwright, set `PLAYWRIGHT_CHANNEL=chrome`.
The build needs network access to inline Google Fonts.

The `Verify` GitHub Actions workflow runs these checks for every pull request and pushes
to `master`/`main`, using Node 24 and a downloaded Chromium. Failed browser tests retain
screenshots and traces in the uploaded report.

### Activate automatic update proposals (repository owner)

1. Install/enable the [Renovate GitHub app](https://github.com/apps/renovate) for this repository.
2. Merge the configuration and workflow after review, and complete any Renovate onboarding PR.
3. After the first successful CI run, require the
   `Build, unit tests and browser smoke tests` check in the default branch's ruleset/protection.

Renovate checks weekly on Monday before 06:00 Europe/Zurich and waits seven days after
release. It groups non-major npm updates, Angular packages, and Angular runtime/compiler
dependencies separately. It also proposes lockfile maintenance. Automatic merging is
disabled; npm major updates require approval in the Dependency Dashboard before a PR
is created. Dashboard approval only authorizes creating the update PR.

Review Angular major upgrades with the [Angular Update Guide](https://angular.dev/update-guide).
Use `npx ng update @angular/core@<major> @angular/cli@<major>` and
`npx ng update @angular/material@<major>` to run migrations, one major at a time.
A Renovate version bump alone does not replace those migrations. Check Angular's
[Node/TypeScript/RxJS compatibility table](https://angular.dev/reference/versions) before
approving compiler/runtime updates. Stop on peer dependency conflicts rather than using
`--force` or `--legacy-peer-deps`. Keep `package.json` and `package-lock.json` together.

Review passing update PRs and the Netlify preview before merging. The checks cover the
listed flows, not every visual detail or live third-party integration.

The 2026-10-17 update batch stays on Angular 21 and applies advisory fixes within the
declared dependency ranges. `npm audit --omit=dev` reports zero vulnerabilities;
the full audit still reports 13 development-tool advisories (11 high, 2 moderate).
npm proposes breaking downgrades for the remaining findings; review those separately
instead of running `npm audit fix --force`.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
