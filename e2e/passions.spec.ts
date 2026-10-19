import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('https://**/*', route => route.abort());
});

for (const theme of ['light', 'dark']) {
  for (const language of ['fr', 'en']) {
    test(`passion descriptions fit in ${theme}, ${language}`, async ({ page, isMobile }) => {
      await page.addInitScript(({ theme, language }) => {
        localStorage.setItem('cv-theme', theme);
        localStorage.setItem('cv-language', language);
      }, { theme, language });
      await page.goto('/passions');
      const cards = page.locator('.passion-tile');
      await expect(cards).toHaveCount(10);
      await expect(page.getByRole('button', { name: 'Drones', exact: true })).toHaveCount(0);
      await expect(page.getByRole('button', { name: language === 'fr' ? 'Jeux vidéo' : 'Video games', exact: true })).toBeVisible();
      for (const card of await cards.all()) {
        if (isMobile) await card.tap();
        else await card.hover();
        await expect(card).toHaveAttribute('aria-expanded', 'true');
        await expect(card).toHaveCSS('height', '300px');
        const description = card.locator('.passion-description');
        await expect(description).not.toHaveText(/\?/);
        expect(await card.locator('.passion-back').evaluate(face => {
          const children = Array.from(face.children).map(child => child.getBoundingClientRect());
          const bounds = face.getBoundingClientRect();
          return face.scrollHeight <= face.clientHeight + 1 && children.every(child =>
            child.top >= bounds.top - 1 && child.bottom <= bounds.bottom + 1);
        })).toBe(true);
        if (isMobile) await card.tap();
        else await page.mouse.move(0, 0);
        await expect(card).toHaveCSS('height', '116px');
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    });
  }
}

test('inspection follows the mouse and resets on leave; touch flips twice', async ({ page, isMobile }) => {
  await page.goto('/passions');
  const card = page.getByRole('button', { name: 'Handball', exact: true });
  const slot = card.locator('..');
  const back = card.locator('.passion-back');
  await expect(card).toHaveAttribute('aria-expanded', 'false');
  if (isMobile) {
    await card.tap();
    await expect(card).toHaveAttribute('aria-expanded', 'true');
    await expect(slot).not.toHaveClass(/is-inspecting/);
    await expect(back).toHaveAttribute('aria-hidden', 'false');
    await expect.poll(() => card.evaluate(el => new DOMMatrixReadOnly(getComputedStyle(el).transform).m11)).toBeCloseTo(-1, 3);
    await card.tap();
    await expect(card).toHaveAttribute('aria-expanded', 'false');
    await expect(card).toHaveCSS('transform', 'none');
  } else {
    await slot.hover({ position: { x: 20, y: 20 } });
    await expect(card).toHaveAttribute('aria-expanded', 'true');
    const first = await slot.evaluate(el => el.style.getPropertyValue('--tilt-y'));
    const bounds = (await slot.boundingBox())!;
    await page.mouse.move(bounds.x + bounds.width - 20, bounds.y + bounds.height - 20);
    expect(await slot.evaluate(el => el.style.getPropertyValue('--tilt-y'))).not.toBe(first);
    await page.mouse.move(0, 0);
    await expect(card).toHaveAttribute('aria-expanded', 'false');
    await expect(card).toHaveCSS('transform', 'none');
    await card.focus();
    await card.press('Enter');
    await expect(card).toHaveAttribute('aria-expanded', 'true');
    await card.press('Escape');
    await expect(card).toHaveAttribute('aria-expanded', 'false');
  }
});

test('keeps the inspection animation enabled with reduced motion and the grid compact', async ({ page, isMobile }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/passions');
  const card = page.getByRole('button', { name: 'Handball', exact: true });
  const slots = page.locator('.passion-slot');
  await expect(slots.first()).toHaveClass(/revealed/);
  await slots.evaluateAll(elements => Promise.all(elements.flatMap(el => el.getAnimations().map(animation => animation.finished))));
  await expect(card).toHaveCSS('height', '116px');
  const before = await slots.evaluateAll(elements => elements.map(el => {
    const { x, y, width, height } = el.getBoundingClientRect();
    return { x, y, width, height };
  }));
  const compactWidth = await card.evaluate(el => el.getBoundingClientRect().width);
  await card.evaluate(el => el.addEventListener('transitionrun', event => {
    if (event.target === el && (event as TransitionEvent).propertyName === 'height') {
      el.setAttribute('data-animated-height', 'true');
    }
  }));
  if (isMobile) await card.tap();
  else await card.hover();
  await expect(card).toHaveAttribute('data-animated-height', 'true');
  await expect(card).toHaveAttribute('aria-expanded', 'true');
  await expect(card).toHaveCSS('height', '300px');
  expect(await card.evaluate(el => el.getBoundingClientRect().width)).toBeGreaterThan(compactWidth * 1.3);
  const after = await slots.evaluateAll(elements => elements.map(el => {
    const { x, y, width, height } = el.getBoundingClientRect();
    return { x, y, width, height };
  }));
  expect(after).toEqual(before);
  await expect(card).not.toHaveCSS('transform', 'none');
  await expect(card.locator('..')).toHaveCSS('z-index', '10');
  if (isMobile) await card.tap();
  else await page.mouse.move(0, 0);
  await expect(card).toHaveCSS('height', '116px');
  await expect(card).toHaveCSS('transform', 'none');
});
