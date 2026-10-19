import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('https://**/*', route => route.abort());
});

test('limits the preview by text height and animates opening and closing', async ({ page }) => {
  await page.goto('/experiences');
  const card = page.locator('#quanthome .xp-card');
  const description = card.locator('.xp-description');
  const button = card.getByRole('button', { name: 'Voir plus' });
  await expect(button).toBeVisible();
  await card.scrollIntoViewIfNeeded();
  const initial = await description.evaluate(el => ({
    height: el.getBoundingClientRect().height,
    full: el.firstElementChild!.getBoundingClientRect().height,
    line: parseFloat(getComputedStyle(el.firstElementChild!).lineHeight),
  }));
  expect(initial.height).toBeCloseTo(initial.line * 8, 0);
  expect(initial.full).toBeGreaterThan(initial.height);
  await expect(button).toHaveAttribute('aria-controls', await description.getAttribute('id') as string);
  await expect(button.locator('svg')).toBeVisible();

  // Freeze the transition halfway to prove layout height interpolates in both directions.
  for (const expanded of [true, false]) {
    const sample = await card.evaluate(async el => {
      const body = el.querySelector('.xp-description')!;
      const before = body.getBoundingClientRect().height;
      (el.querySelector('.xp-more') as HTMLButtonElement).click();
      await new Promise(requestAnimationFrame);
      await new Promise(requestAnimationFrame);
      const transition = body.getAnimations()[0];
      if (!transition) throw new Error('Missing height transition');
      transition.pause();
      const duration = Number(transition.effect!.getTiming().duration);
      transition.currentTime = duration / 2;
      const middle = body.getBoundingClientRect().height;
      transition.finish();
      await transition.finished;
      return { before, middle, after: body.getBoundingClientRect().height };
    });
    expect(sample.middle).toBeGreaterThan(Math.min(sample.before, sample.after));
    expect(sample.middle).toBeLessThan(Math.max(sample.before, sample.after));
    await expect(card.locator('.xp-more')).toHaveAttribute('aria-expanded', String(expanded));
  }

  await button.focus();
  await button.press('Enter');
  await expect(card.locator('.xp-more')).toHaveAttribute('aria-expanded', 'true');
  await expect.poll(() => description.evaluate(el =>
    Math.abs(el.getBoundingClientRect().height - el.firstElementChild!.getBoundingClientRect().height)
  )).toBeLessThan(1);
  await card.locator('.xp-more').press('Space');
  await expect(card.locator('.xp-more')).toHaveAttribute('aria-expanded', 'false');
  await expect.poll(() => description.evaluate(el => el.getBoundingClientRect().height))
    .toBeCloseTo(initial.height, 0);
});

test('adapts previews to language and width and keeps the control legible in both themes', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const lang of ['fr', 'en']) {
    for (const theme of ['light', 'dark']) {
      await page.addInitScript(({ lang, theme }) => {
        localStorage.setItem('cv-language', lang);
        localStorage.setItem('cv-theme', theme);
      }, { lang, theme });
      await page.goto('/experiences');
      const card = page.locator('#metafactory .xp-card');
      const button = card.locator('.xp-more');
      await expect(button).toBeVisible();
      await expect(button).toHaveText(lang === 'fr' ? 'Voir plus' : 'Show more');
      const contrast = await button.evaluate(el => {
        const luminance = (rgb: string) => {
          const channels = rgb.match(/\d+/g)!.slice(0, 3).map(v => {
            const x = Number(v) / 255;
            return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
          });
          return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
        };
        const style = getComputedStyle(el);
        const [a, b] = [luminance(style.color), luminance(style.backgroundColor)].sort((a, b) => b - a);
        return (a + 0.05) / (b + 0.05);
      });
      expect(contrast).toBeGreaterThanOrEqual(4.5);
      await button.click();
      await expect.poll(() => card.locator('.xp-description').evaluate(el =>
        Math.abs(el.clientHeight - el.scrollHeight)
      )).toBeLessThanOrEqual(1);
      await button.click();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
  }
  // A wider card must remeasure wrapping rather than keep a stale height.
  await page.setViewportSize({ width: 1100, height: 900 });
  const description = page.locator('#quanthome .xp-description');
  await expect.poll(() => description.evaluate(el => {
    const line = parseFloat(getComputedStyle(el.firstElementChild!).lineHeight);
    return Math.abs(el.getBoundingClientRect().height - line * 8);
  })).toBeLessThan(1);

  await page.goto('/education');
  await expect(page.locator('app-education .xp-card')).toHaveCount(2);
  await expect(page.locator('app-education .xp-more')).toHaveCount(0);
});

test('keeps card animations enabled even when reduced motion is requested', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/experiences');
  const card = page.locator('#quanthome .xp-card');
  await expect(card.locator('.xp-more')).toBeVisible();
  const animated = await card.evaluate(async el => {
    (el.querySelector('.xp-more') as HTMLButtonElement).click();
    await new Promise(requestAnimationFrame);
    await new Promise(requestAnimationFrame);
    return el.querySelector('.xp-description')!.getAnimations().length > 0;
  });
  expect(animated).toBe(true);
  await expect(card.locator('.xp-more')).toHaveAttribute('aria-expanded', 'true');
  await expect(card.locator('.xp-description')).toHaveCSS('transition-duration', '0.28s');
  await expect(card.locator('.xp-more svg')).toHaveCSS('transition-duration', '0.28s');
  await expect.poll(() => card.locator('.xp-description').evaluate(el =>
    Math.abs(el.clientHeight - el.scrollHeight)
  )).toBeLessThanOrEqual(1);
});
