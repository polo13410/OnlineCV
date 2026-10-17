import { expect, test as base } from '@playwright/test';

const test = base.extend<{ runtimeErrors: void }>({
  runtimeErrors: [async ({ page }, use) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await use();
    expect(errors, 'Unexpected browser runtime errors').toEqual([]);
  }, { auto: true }],
});

test.beforeEach(async ({ page }) => {
  // External services are outside dependency verification; no live mail is sent.
  await page.route('https://**/*', route => route.abort());
});

test('loads the CV, switches language, persists it and downloads the matching PDF', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Paul.*Pera/i })).toBeVisible();
  // The mobile switch lives in the navigation drawer.
  if (test.info().project.name === 'mobile') {
    await page.getByRole('button', { name: 'Toggle navigation' }).click();
  }
  const language = page.locator('app-lang-toggle:visible').getByRole('switch');
  await expect(language).toHaveAttribute('aria-checked', 'false');
  await language.click();
  await expect(language).toHaveAttribute('aria-checked', 'true');
  const downloadLink = page.getByRole('link', { name: 'Download CV' });
  const downloadPromise = page.waitForEvent('download');
  await downloadLink.click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('CV_PaulPERA_EN.pdf');
  expect(await download.failure()).toBeNull();
  await page.reload();
  await expect(page.locator('a.cv-btn').first()).toHaveAttribute('href', 'assets/data/pdfVersion-en.pdf');
  await expect(page.locator('a.cv-btn').first()).toContainText('Download CV');
  if (test.info().project.name === 'mobile') {
    await page.getByRole('button', { name: 'Toggle navigation' }).click();
  }
  const persistedLanguage = page.locator('app-lang-toggle:visible').getByRole('switch');
  await expect(persistedLanguage).toHaveAttribute('aria-checked', 'true');
  await persistedLanguage.click();
  await expect(persistedLanguage).toHaveAttribute('aria-checked', 'false');
  await expect(page.locator('a.cv-btn').first()).toHaveAttribute('href', 'assets/data/pdfVersion-fr.pdf');
  await expect(page.locator('a.cv-btn').first()).toContainText('Télécharger le CV');
});

test('navigates through CV sections and supports direct route reloads', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('cv-language', 'en'));
  await page.goto('/');
  for (const [path, heading] of [
    ['experiences', 'Professional experiences'],
    ['education', 'Schools'],
    ['skills', 'Technical skills'],
    ['projects', 'My projects'],
    ['passions', 'Sports'],
  ]) {
    if (test.info().project.name === 'mobile') {
      await page.getByRole('button', { name: 'Toggle navigation' }).click();
    }
    await page.locator(`nav a[href="/${path}"]`).click();
    await expect(page).toHaveURL(new RegExp(`/${path}$`));
    await expect(page.locator(`app-${path}`)).toBeVisible();
    await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible();
  }
  await page.reload();
  await expect(page.locator('app-passions')).toBeVisible();
});

test('validates the contact form and handles a successful submission', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('cv-language', 'en'));
  await page.route('**/.netlify/functions/contact', async route => {
    expect(route.request().method()).toBe('POST');
    expect(route.request().postDataJSON()).toMatchObject({
      firstName: 'Test', lastName: 'Visitor', email: 'visitor@example.com',
      message: 'A browser smoke test message.', lang: 'en', topic: 'pro', website: '',
    });
    await route.fulfill({ json: { ok: true } });
  });
  await page.goto('/experiences');
  await page.getByRole('button', { name: 'Contact me', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Send', exact: true }).click();
  await expect(dialog.getByLabel('First name')).toHaveAttribute('aria-invalid', 'true');
  await dialog.getByLabel('First name').fill('Test');
  await dialog.getByLabel('Last name').fill('Visitor');
  await dialog.getByRole('textbox', { name: /^Email/ }).fill('visitor@example.com');
  await dialog.getByRole('textbox', { name: /^Message/ }).fill('A browser smoke test message.');
  await dialog.getByRole('button', { name: 'Send', exact: true }).click();
  await expect(dialog.getByRole('status')).toContainText('Message sent!');
  await dialog.getByRole('button', { name: 'Close', exact: true }).last().click();
  await expect(dialog).toBeHidden();
});
