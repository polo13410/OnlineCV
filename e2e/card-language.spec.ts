import { expect, test } from '@playwright/test';

type TransitionWindow = Window & { cardAnimations?: Animation[] };

for (const { route, theme } of [
  { route: 'education', theme: 'light' },
  { route: 'education', theme: 'dark' },
  { route: 'experiences', theme: 'light' },
  { route: 'projects', theme: 'light' },
]) {
  test(`${route} cards fade text out then in without changing the frame animation (${theme})`, async ({ page, isMobile }) => {
    await page.route('https://**/*', route => route.abort());
    await page.addInitScript(theme => {
      localStorage.setItem('cv-language', 'en');
      localStorage.setItem('cv-theme', theme);
      const start = document.startViewTransition.bind(document);
      document.startViewTransition = (...args) => {
        const transition = start(...args);
        void transition.ready.then(() => {
          if (document.documentElement.dataset['vt'] !== 'lang') return;
          const animations = document.getAnimations().filter(animation => (animation.effect as KeyframeEffect)?.pseudoElement);
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
    await card.evaluate(async el => {
      await Promise.all(el.closest('.timeline-row')!.getAnimations().map(animation => animation.finished));
      (el as HTMLElement).style.viewTransitionName = 'tested-card';
      (el.querySelector('.xp-head') as HTMLElement).style.viewTransitionName = 'tested-copy';
      el.setAttribute('data-original', 'true');
    });
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
          old: Number(getComputedStyle(root, '::view-transition-old(tested-copy)').opacity),
          next: Number(getComputedStyle(root, '::view-transition-new(tested-copy)').opacity),
          frame: Number(getComputedStyle(root, '::view-transition-new(tested-card)').opacity),
        };
      }, progress);
      const early = await sample(0.2);
      expect(early.old).toBeGreaterThan(0);
      expect(early.old).toBeLessThan(1);
      expect(early.next).toBe(0);
      expect(early.frame).toBe(1);
      const middle = await sample(0.4);
      expect(middle.old).toBe(0);
      expect(middle.next).toBe(0);
      const late = await sample(0.7);
      expect(late.old).toBe(0);
      expect(late.next).toBeGreaterThan(0);
      expect(late.next).toBeLessThan(1);
      await page.evaluate(() => (window as TransitionWindow).cardAnimations!.forEach(animation => animation.finish()));
      await expect(page.locator('html')).not.toHaveAttribute('data-vt', 'lang');
      await expect(card).toHaveAttribute('data-original', 'true');
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
  });
}
