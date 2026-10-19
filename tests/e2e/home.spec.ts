import { expect, test } from '@playwright/test';

test('home page renders, hydrates, and switches to Kiswahili', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });

  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.locator('.site-header')).toContainText('AskOptsam');
  await expect(page.locator('.hero-quick')).toContainText('Ask AskOptsam');

  await page.locator('a[hreflang="sw"]').first().click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'sw');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('macho');

  expect(errors).toEqual([]);
});

test('home quick question lands in the chat with the question prefilled', async ({ page }) => {
  await page.goto('/');
  await page.locator('#home-question').fill('Why do my eyes feel itchy?');
  await page.getByRole('button', { name: /^Ask AskOptsam$/ }).click();

  await page.waitForURL(/\/chat\?q=/);
  await expect(page.locator('.consent-card')).toBeVisible();
  await expect(page.locator('.consent-card')).toContainText('Before you start');
  await expect(page.locator('.notice--info')).toContainText('Why do my eyes feel itchy?');
});

test('warning signs page is reachable from the header', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: /Urgent signs/i }).first().click();
  await expect(page).toHaveURL(/\/warning-signs/);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('mobile layout does not overflow horizontally', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
});
