import { expect, Page, test } from '@playwright/test';

interface Slide {
  pseudo: string | null;
  from: string;
  to: string;
}

type NavigationWindow = Window & { pageSlides: Slide[][] };

test.beforeEach(async ({ page }) => {
  await page.route('https://**/*', route => route.abort());
  await page.addInitScript(() => {
    const state = window as unknown as NavigationWindow;
    state.pageSlides = [];
    const start = document.startViewTransition.bind(document);
    document.startViewTransition = (...args) => {
      const transition = start(...args);
      void transition.ready.then(() => {
        state.pageSlides.push(document.getAnimations()
          .filter((animation): animation is CSSAnimation =>
            animation instanceof CSSAnimation && animation.animationName === 'vt-page-strip')
          .map(animation => {
            const effect = animation.effect as KeyframeEffect;
            const frames = effect.getKeyframes();
            return {
              pseudo: effect.pseudoElement,
              from: String(frames[0]['translate']),
              to: String(frames[frames.length - 1]['translate']),
            };
          }));
      });
      return transition;
    };
  });
});

async function expectVerticalSlide(page: Page, sign: 1 | -1, distance = 1): Promise<void> {
  await expect.poll(() => page.evaluate(() =>
    (window as unknown as NavigationWindow).pageSlides.length)).toBeGreaterThan(0);
  const slides = await page.evaluate(() =>
    (window as unknown as NavigationWindow).pageSlides.pop()!);
  const height = page.viewportSize()!.height;
  expect(slides).toContainEqual({
    pseudo: '::view-transition-old(root)', from: '0px', to: `0px ${-sign * distance * height}px`,
  });
  expect(slides).toContainEqual({
    pseudo: '::view-transition-new(root)', from: `0px ${sign * distance * height}px`, to: '0px',
  });
  for (let k = 1; k < distance; k++) {
    expect(slides).toContainEqual({
      pseudo: `::view-transition-new(page-sweep-${k})`,
      from: `0px ${sign * k * height}px`,
      to: `0px ${sign * (k - distance) * height}px`,
    });
  }
  await expect(page.locator('html')).not.toHaveAttribute('data-vt', 'page');
}

async function pull(page: Page, edge: 'top' | 'bottom', mobile: boolean): Promise<void> {
  await page.evaluate(edge => window.scrollTo({
    top: edge === 'top' ? 0 : document.documentElement.scrollHeight, behavior: 'instant',
  }), edge);
  if (mobile) {
    await page.evaluate(edge => {
      const target = document.querySelector('.shell-main')!;
      const touch = (y: number) => new Touch({ identifier: 1, target, clientX: 180, clientY: y });
      target.dispatchEvent(new TouchEvent('touchstart', { bubbles: true, touches: [touch(400)] }));
      target.dispatchEvent(new TouchEvent('touchmove', {
        bubbles: true, touches: [touch(edge === 'bottom' ? 200 : 600)],
      }));
      target.dispatchEvent(new TouchEvent('touchend', { bubbles: true, touches: [] }));
    }, edge);
  } else {
    await page.mouse.move(600, 350);
    await page.mouse.wheel(0, edge === 'bottom' ? 300 : -400);
  }
}

test('scroll gestures move to the next page upward and the previous page downward', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('app-homepage')).toBeVisible();
  const mobile = test.info().project.name === 'mobile';
  await pull(page, 'bottom', mobile);
  await expect(page).toHaveURL(/\/experiences$/);
  await expectVerticalSlide(page, 1);
  await pull(page, 'top', mobile);
  await expect(page).toHaveURL('http://127.0.0.1:4300/');
  await expectVerticalSlide(page, -1);
});

test('menu jumps sweep intermediate pages vertically in both directions', async ({ page }) => {
  await page.goto('/');
  for (const [path, sign] of [['/education', 1], ['/', -1]] as const) {
    if (test.info().project.name === 'mobile') {
      await page.getByRole('button', { name: 'Toggle navigation' }).click();
    }
    await page.locator(`nav a[href="${path}"]`).click();
    await expectVerticalSlide(page, sign, 3);
  }
});
