import { expect, test } from '@playwright/test';

test('account and history pages require sign-in', async ({ page }) => {
  await page.goto('/account');
  await expect(page).toHaveURL(/\/signin\?next=%2Faccount/);
  await expect(page.locator('.auth-card')).toContainText(
    'Accounts are not configured in this deployment',
  );

  await page.goto('/history');
  await expect(page).toHaveURL(/\/signin\?next=%2Fhistory/);
  await expect(page.locator('.auth-card')).toBeVisible();
});

test('sign-in gracefully explains that accounts are unavailable in demo mode', async ({ page }) => {
  await page.goto('/signin');
  await expect(page.locator('.auth-card')).toContainText(
    'Accounts are not configured in this deployment',
  );
  await expect(page.locator('#signin-email')).toHaveCount(0);
  await page.getByRole('link', { name: /Continue without an account/i }).first().click();
  await expect(page).toHaveURL(/\/chat/);
});

test('image explanation endpoint refuses requests', async ({ request }) => {
  const getResponse = await request.get('/api/image');
  expect(getResponse.status()).toBe(503);
  const payload = (await getResponse.json()) as { error: { code: string } };
  expect(payload.error.code).toBe('image_disabled');

  const postResponse = await request.post('/api/image', {
    data: { image: 'not-a-real-file' },
  });
  expect(postResponse.status()).toBe(503);
});

test('saving a conversation without an account is refused', async ({ request }) => {
  const response = await request.post('/api/chat', {
    data: { message: 'My eyes itch', lang: 'en', consent: true, save: true },
  });
  expect(response.status()).toBe(401);
});

test('privacy, terms, and disclaimer pages describe the limits', async ({ page }) => {
  for (const path of ['/privacy', '/terms', '/medical-disclaimer']) {
    await page.goto(path);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  }
  await page.goto('/medical-disclaimer');
  const text = await page.locator('main').innerText();
  expect(text.toLowerCase()).toMatch(/not a diagnosis|not a substitute|emergency/);
});
