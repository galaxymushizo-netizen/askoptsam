import { expect, test } from '@playwright/test';

test('library search filters articles and opens one', async ({ page }) => {
  await page.goto('/learn');
  await expect(page.locator('.article-card')).toHaveCount(10);

  await page.locator('#learn-search').fill('contact lens');
  await expect(page.locator('.search-status')).toContainText('article');
  const visibleTitles = await page.locator('.article-card h3').allTextContents();
  expect(visibleTitles.length).toBeGreaterThan(0);
  expect(visibleTitles.length).toBeLessThan(10);
  expect(visibleTitles.join(' ')).toMatch(/contact lens/i);

  await page.locator('.article-card a').first().click();
  await expect(page).toHaveURL(/\/learn\//);
  await expect(page.locator('.article-body, article')).toBeVisible();
  await expect(page.locator('text=/pending/i').first()).toBeVisible();
});

test('mobile article shows the content before the sidebar and does not overflow', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/learn/digital-eye-strain');

  const titleBox = await page.locator('article h1').boundingBox();
  const asideBox = await page.locator('.article-aside').boundingBox();
  expect(titleBox).not.toBeNull();
  expect(asideBox).not.toBeNull();
  expect(titleBox!.y).toBeLessThan(asideBox!.y);

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
});

test('unknown article returns the 404 page', async ({ page }) => {
  const response = await page.goto('/learn/not-a-real-article');
  expect(response?.status()).toBe(404);
  await expect(page.locator('body')).toContainText('Page not found');
});

test('sources page lists the curated registry', async ({ page }) => {
  await page.goto('/sources');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.locator('.source-card, li').first()).toBeVisible();
  const text = await page.locator('main').innerText();
  expect(text).toMatch(/22/);
});
