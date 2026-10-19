import { expect, test } from '@playwright/test';

test('demo chat answers with a clear label, citations, and follow-ups', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });

  await page.goto('/chat');
  await expect(page.locator('.consent-card')).toBeVisible();
  await expect(page.locator('#chat-input')).toHaveCount(0);

  await page.getByRole('checkbox').first().check();
  await page.getByRole('button', { name: /I understand/i }).click();
  await expect(page.locator('#chat-input')).toBeVisible();

  await page.locator('#chat-input').fill('My eyes are dry when I use a computer');
  await page.getByRole('button', { name: 'Send' }).click();

  const assistant = page.locator('.message--assistant').first();
  await expect(assistant.locator('.demo-label')).toContainText('Demo content');
  await expect(assistant.locator('.message-text')).toContainText(/dry|screen/i);
  await expect(assistant.locator('.citation').first()).toBeVisible();
  await expect(assistant.locator('.followups')).toBeVisible();

  await expect(page.locator('.message--user').first()).toContainText(
    'My eyes are dry when I use a computer',
  );
  expect(errors).toEqual([]);
});

test('red-flag symptoms get deterministic emergency guidance, not demo text', async ({ page }) => {
  await page.goto('/chat?q=I%20got%20bleach%20in%20my%20eye');
  await page.getByRole('checkbox').first().check();
  // The initial question is sent automatically once consent is accepted.
  await page.getByRole('button', { name: /I understand/i }).click();

  const triage = page.locator('.triage-card').first();
  await expect(triage).toBeVisible();
  await expect(triage).toContainText(/rinse/i);
  await expect(triage).toContainText(/emergency/i);
  await expect(page.locator('.message--assistant .demo-label')).toHaveCount(0);
});

test('chat keeps working in Kiswahili', async ({ page }) => {
  await page.goto('/api/lang?lang=sw&next=%2Fchat');
  await page.getByRole('checkbox').first().check();
  await page.getByRole('button', { name: /Naelewa/i }).click();
  await page.locator('#chat-input').fill('Macho yangu yanawasha na mwanga');
  await page.getByRole('button', { name: 'Tuma' }).click();

  const assistant = page.locator('.message--assistant').first();
  await expect(assistant).toBeVisible();
  await expect(page.locator('.chat-shell')).toContainText('Hali ya demo');
});

test('temporary chat is not saved and offers a new chat reset', async ({ page }) => {
  await page.goto('/chat');
  await expect(page.locator('.chat-head-actions')).toContainText('Temporary chat');
  await page.getByRole('checkbox').first().check();
  await page.getByRole('button', { name: /I understand/i }).click();
  await page.locator('#chat-input').fill('My eyes are red');
  await page.getByRole('button', { name: 'Send' }).click();
  await expect(page.locator('.message--assistant').first()).toBeVisible();

  page.once('dialog', (dialog) => void dialog.accept());
  await page.getByRole('button', { name: /New chat/i }).click();
  await expect(page.locator('.chat-empty')).toBeVisible();
});
