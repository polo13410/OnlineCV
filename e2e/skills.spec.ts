import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('https://**/*', route => route.abort());
});

// Playwright hides scrollbars by default, masking the layout change under test.
test.use({ launchOptions: { ignoreDefaultArgs: ['--hide-scrollbars'] } });

test('shows skill filter actions without changing the tile width', async ({ page, isMobile }) => {
  await page.goto('/skills');
  const tag = page.locator('.skill-tags').getByRole('button', { name: /^TypeScript\b/ });
  const action = tag.locator('.tag-action');
  await expect(action).toHaveText('+');
  const width = await tag.evaluate(el => el.getBoundingClientRect().width);
  if (!isMobile) {
    await expect(action).toHaveCSS('opacity', '0');
    await tag.hover();
  }
  await expect(action).toHaveCSS('opacity', '1');
  expect(await tag.evaluate(el => el.getBoundingClientRect().width)).toBe(width);
  await tag.press('Space');
  await expect(tag).toHaveAttribute('aria-pressed', 'true');
  await expect(action).toHaveText('x');
  await expect(action).toHaveCSS('opacity', '1');
  expect(await tag.evaluate(el => el.getBoundingClientRect().width)).toBe(width);
});

test('keeps retained cards the same size when filtering removes the scrollbar', async ({ page }) => {
  test.skip(test.info().project.name === 'mobile', 'Classic desktop scrollbar layout');
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/skills');
  await page.locator('.skill-tags').getByRole('button', { name: /^TypeScript\b/ }).click();
  const panel = page.locator('app-skill-panel');
  await expect(panel).toBeVisible();
  await panel.evaluate(el => Promise.all(el.getAnimations().map(animation => animation.finished)));
  const body = panel.locator('.panel-body');
  expect(await body.evaluate(el => el.scrollHeight > el.clientHeight)).toBe(true);
  const before = await panel.locator('.panel-item').evaluateAll(elements => elements.map(el => {
    const { width, height } = el.getBoundingClientRect();
    return { title: el.querySelector('.xp-title')!.textContent, width, height };
  }));

  await page.locator('.skill-tags').getByRole('button', { name: /^Python\b/ }).click();
  await expect(panel.locator('.panel-item')).toHaveCount(2);
  expect(await body.evaluate(el => el.scrollHeight > el.clientHeight)).toBe(false);
  const after = await panel.locator('.panel-item').evaluateAll(elements => elements.map(el => {
    const { width, height } = el.getBoundingClientRect();
    return { title: el.querySelector('.xp-title')!.textContent, width, height };
  }));
  for (const card of after) {
    expect(card).toEqual(before.find(previous => previous.title === card.title));
  }
  // Adding the removed results back must not narrow the retained cards either.
  await expect(page.locator('html')).not.toHaveAttribute('data-vt', 'skills');
  await page.locator('.skill-tags').getByRole('button', { name: /^Python\b/ }).click();
  await expect(panel.locator('.panel-item')).toHaveCount(before.length);
  expect(await body.evaluate(el => el.scrollHeight > el.clientHeight)).toBe(true);
  expect(await panel.locator('.panel-item').first().evaluate(el => el.getBoundingClientRect().width))
    .toBe(before[0].width);
});
