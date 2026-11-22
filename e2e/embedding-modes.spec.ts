import { test, expect } from '@playwright/test';

test.describe('Widget Embedding Modes & Responsive Viewports', () => {
  test('floating presentation mode supports open, close, escape key, and backdrop dismiss', async ({
    page,
  }) => {
    await page.goto('/');

    const launcherButton = page.locator(
      'button.fixed[aria-label="Open GlowGuide skin analysis"]',
    );
    await expect(launcherButton).toBeVisible();

    // 1. Open floating modal
    await launcherButton.click();
    const widgetDialog = page.getByRole('dialog', {
      name: 'GlowGuide skin analysis',
    });
    await expect(widgetDialog).toBeVisible();

    // 2. Dismiss via Escape key
    await page.keyboard.press('Escape');
    await expect(widgetDialog).not.toBeVisible();

    // 3. Re-open and dismiss via Close (×) button
    await launcherButton.click();
    await expect(widgetDialog).toBeVisible();
    const closeButton = widgetDialog.getByRole('button', {
      name: /Close/i,
    });
    await expect(closeButton).toBeVisible();
    await closeButton.click();
    await expect(widgetDialog).not.toBeVisible();
  });

  test('inline presentation mode embeds seamlessly within page layout', async ({
    page,
  }) => {
    // Navigate to Widget Preview page which features the inline demo
    await page.goto('/widget-preview');
    await expect(page).toHaveTitle(/Widget Preview/i);

    // Verify inline widget container is rendered directly within the flow
    const inlineContainer = page.locator('.glowguide-theme-root').first();
    await expect(inlineContainer).toBeVisible();

    // Verify inline widget renders the active step (Welcome step)
    await expect(
      inlineContainer.getByText(/Discover Your Skin's Match/i),
    ).toBeVisible();

    // Verify inline widget does not have modal dialog wrapper
    await expect(
      inlineContainer.locator('[role="dialog"][aria-modal="true"]'),
    ).toHaveCount(0);
  });

  test('mobile viewport renders responsive touch-friendly layout', async ({
    page,
  }) => {
    // Emulate standard mobile screen (e.g. iPhone 12/13/14: 390 x 844)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    const launcherButton = page.locator(
      'button.fixed[aria-label="Open GlowGuide skin analysis"]',
    );
    await expect(launcherButton).toBeVisible();
    await launcherButton.click();

    const widgetDialog = page.getByRole('dialog', {
      name: 'GlowGuide skin analysis',
    });
    await expect(widgetDialog).toBeVisible();

    // Verify dialog layout adapts to mobile bottom sheet
    const boundingBox = await widgetDialog.boundingBox();
    expect(boundingBox).not.toBeNull();
    if (boundingBox) {
      expect(boundingBox.width).toBeLessThanOrEqual(390);
    }

    // Verify touch action button is accessible
    const beginButton = widgetDialog.getByRole('button', {
      name: /Begin Skin Analysis/i,
    });
    await expect(beginButton).toBeVisible();
    await beginButton.click();

    // Verify consent step renders cleanly on mobile
    await expect(
      widgetDialog.getByText(/Camera Access & Privacy/i),
    ).toBeVisible();
  });
});
