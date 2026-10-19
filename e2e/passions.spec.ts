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
    // Sample rendered rotation on the next frame while the mouse keeps moving.
    const tilt = card.locator('.passion-tilt');
    for (const x of [30, bounds.width - 30, 40]) {
      await page.mouse.move(bounds.x + x, bounds.y + bounds.height / 2);
      expect(await tilt.evaluate(el => {
        const expected = Math.sin(parseFloat(getComputedStyle(el).getPropertyValue('--tilt-y')) * Math.PI / 180);
        return Math.abs(new DOMMatrixReadOnly(getComputedStyle(el).transform).m31 - expected);
      })).toBeLessThan(0.001);
    }
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

test('changes language without recreating or revealing the passion tiles again', async ({ page, isMobile }) => {
  await page.goto('/passions');
  const slots = page.locator('.passion-slot');
  await expect(slots.first()).toHaveClass(/revealed/);
  await slots.evaluateAll(elements => elements.forEach((el, i) => el.setAttribute('data-original', String(i))));
  if (isMobile) await page.getByRole('button', { name: 'Toggle navigation' }).click();
  const language = page.locator('app-lang-toggle:visible').getByRole('switch');
  for (const name of ['Skiing', 'Ski']) {
    await language.click();
    await expect(page.getByRole('button', { name, exact: true })).toHaveCount(1);
    await expect(page.locator('html')).not.toHaveAttribute('data-vt', 'lang');
    for (let i = 0; i < 10; i++) await expect(slots.nth(i)).toHaveAttribute('data-original', String(i));
    await expect(slots.first()).toHaveClass(/revealed/);
  }
});

test('moves the title up and quickly zooms the description into the expanded tile', async ({ page, isMobile }) => {
  await page.goto('/passions');
  const card = page.getByRole('button', { name: 'Handball', exact: true });
  await expect(card.locator('..')).toHaveClass(/revealed/);
  await card.evaluate(el => {
    const title = el.querySelector<HTMLElement>('.passion-back .passion-name')!;
    const description = el.querySelector<HTMLElement>('.passion-description')!;
    const samples: { titleY: number; descriptionScale: number }[] = [];
    el.addEventListener('transitionrun', event => {
      if (event.target !== el || (event as TransitionEvent).propertyName !== 'height') return;
      const start = performance.now();
      const sample = () => {
        const titleTransform = new DOMMatrixReadOnly(getComputedStyle(title).transform);
        const descriptionTransform = new DOMMatrixReadOnly(getComputedStyle(description).transform);
        samples.push({ titleY: titleTransform.m42, descriptionScale: descriptionTransform.m11 });
        if (performance.now() - start < 500) requestAnimationFrame(sample);
        else el.setAttribute('data-zoom-samples', JSON.stringify(samples));
      };
      requestAnimationFrame(sample);
    });
  });
  if (isMobile) await card.tap();
  else await card.hover();
  await expect(card).toHaveAttribute('data-zoom-samples');
  const samples = JSON.parse((await card.getAttribute('data-zoom-samples'))!) as {
    titleY: number;
    descriptionScale: number;
  }[];
  expect(Math.max(...samples.map(sample => sample.titleY))).toBeGreaterThan(20);
  expect(Math.min(...samples.map(sample => sample.descriptionScale))).toBeLessThan(0.8);
  expect(Math.abs(samples.at(-1)!.titleY)).toBeLessThan(0.1);
  expect(samples.at(-1)!.descriptionScale).toBeCloseTo(1, 2);
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
  await card.evaluate(el => el.querySelector('.passion-description')!.addEventListener('animationstart', () => {
    el.setAttribute('data-animated-description', 'true');
  }));
  if (isMobile) await card.tap();
  else await card.hover();
  await expect(card).toHaveAttribute('data-animated-height', 'true');
  await expect(card).toHaveAttribute('data-animated-description', 'true');
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
