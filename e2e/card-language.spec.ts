import { expect, test } from '@playwright/test';

type TransitionWindow = Window & { cardAnimations?: Animation[] };

interface CardCase {
  route: 'education' | 'experiences' | 'projects';
  changed: string;
  stable: string;
  theme: 'light' | 'dark';
}

const cases: CardCase[] = [
  { route: 'education', changed: '.xp-title', stable: '.xp-tags', theme: 'light' },
  { route: 'education', changed: '.xp-description', stable: '.xp-head', theme: 'dark' },
  { route: 'experiences', changed: '.xp-description', stable: '.xp-tags', theme: 'light' },
  { route: 'projects', changed: '.xp-summary', stable: '.xp-title', theme: 'light' },
];

for (const { route, changed, stable, theme } of cases) {
  test(`${route} fades translated text while stable card content remains visible (${theme})`, async ({ page, isMobile }) => {
    await page.route('https://**/*', route => route.abort());
    await page.addInitScript(theme => {
      localStorage.setItem('cv-language', 'en');
      localStorage.setItem('cv-theme', theme);
      const start = document.startViewTransition.bind(document);
      document.startViewTransition = (...args) => {
        const transition = start(...args);
        void transition.ready.then(() => {
          if (document.documentElement.dataset['vt'] !== 'lang') return;
          const animations = document.getAnimations().filter(animation =>
            (animation.effect as KeyframeEffect)?.pseudoElement);
          for (const animation of animations) {
            animation.pause();
            animation.currentTime = 0;
          }
          (window as TransitionWindow).cardAnimations = animations;
        });
        return transition;
      };
    }, theme);
    await page.goto(`/${route}`);
    const card = page.locator('.xp-card').first();
    await card.scrollIntoViewIfNeeded();
    await card.evaluate(async (el, { changed, stable }) => {
      await Promise.all(el.closest('.timeline-row')!.getAnimations().map(animation => animation.finished));
      (el as HTMLElement).style.viewTransitionName = 'tested-card';
      (el.querySelector(changed) as HTMLElement).style.viewTransitionName = 'tested-change';
      (el.querySelector(stable) as HTMLElement).style.viewTransitionName = 'tested-stable';
      el.setAttribute('data-original', 'true');
    }, { changed, stable });
    if (isMobile) await page.getByRole('button', { name: 'Toggle navigation' }).click();
    const language = page.locator('app-lang-toggle:visible').getByRole('switch');

    for (const checked of ['false', 'true']) {
      await page.evaluate(() => { delete (window as TransitionWindow).cardAnimations; });
      await language.click();
      await expect(language).toHaveAttribute('aria-checked', checked);
      await page.waitForFunction(() => (window as TransitionWindow).cardAnimations?.length);
      const sample = async (progress: number) => page.evaluate(progress => {
        for (const animation of (window as TransitionWindow).cardAnimations!) {
          animation.currentTime = Number(animation.effect!.getTiming().duration) * progress;
        }
        const root = document.documentElement;
        return {
          changedOld: Number(getComputedStyle(root, '::view-transition-old(tested-change)').opacity),
          changedNew: Number(getComputedStyle(root, '::view-transition-new(tested-change)').opacity),
          stableOld: Number(getComputedStyle(root, '::view-transition-old(tested-stable)').opacity),
          stableNew: Number(getComputedStyle(root, '::view-transition-new(tested-stable)').opacity),
          frame: Number(getComputedStyle(root, '::view-transition-new(tested-card)').opacity),
        };
      }, progress);

      const early = await sample(0.2);
      expect(early.changedOld).toBeGreaterThan(0);
      expect(early.changedOld).toBeLessThan(1);
      expect(early.changedNew).toBe(0);
      expect(early.frame).toBe(1);

      const middle = await sample(0.4);
      expect(middle.changedOld).toBe(0);
      expect(middle.changedNew).toBe(0);
      expect(middle.stableOld + middle.stableNew).toBeGreaterThan(0.9);

      const late = await sample(0.7);
      expect(late.changedOld).toBe(0);
      expect(late.changedNew).toBeGreaterThan(0);
      expect(late.changedNew).toBeLessThan(1);
      expect(late.stableOld + late.stableNew).toBeGreaterThan(0.9);

      await page.evaluate(() =>
        (window as TransitionWindow).cardAnimations!.forEach(animation => animation.finish()));
      await expect(page.locator('html')).not.toHaveAttribute('data-vt', 'lang');
      await expect(card).toHaveAttribute('data-original', 'true');
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
  });
}
