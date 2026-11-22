import { test, expect } from '@playwright/test';

test.describe('Shopper Journey & Skin Discovery Flow', () => {
  test('completes full flow from homepage, skin analysis, to shopping cart drawer', async ({
    page,
  }) => {
    // 1. Navigate to Storefront Homepage and start with fresh cart state
    await page.goto('/');
    await page.evaluate(() => window.localStorage.clear());
    await page.reload();
    await expect(page).toHaveTitle(/Luma Beauty/i);

    // 2. Locate and click floating widget launcher button
    const launcherButton = page.locator(
      'button.fixed[aria-label="Open GlowGuide skin analysis"]',
    );
    await expect(launcherButton).toBeVisible();
    await launcherButton.click();

    // 3. Verify widget modal opened to Welcome step
    const widgetDialog = page.getByRole('dialog', {
      name: 'GlowGuide skin analysis',
    });
    await expect(widgetDialog).toBeVisible();
    await expect(
      widgetDialog.getByText(/Discover Your Skin's Match/i),
    ).toBeVisible();

    // 4. Click 'Begin Skin Analysis' to advance to Consent step
    const beginButton = widgetDialog.getByRole('button', {
      name: /Begin Skin Analysis/i,
    });
    await beginButton.click();

    // 5. Verify Consent step
    await expect(
      widgetDialog.getByText(/Camera Access & Privacy/i),
    ).toBeVisible();
    const consentCheckbox = widgetDialog.locator('#camera-consent');
    await expect(consentCheckbox).toBeVisible();
    await consentCheckbox.check();

    // 6. Click 'I Agree & Continue' to advance to Camera capture
    const continueConsentButton = widgetDialog.getByRole('button', {
      name: /I Agree & Continue/i,
    });
    await continueConsentButton.click();

    // 7. Viewfinder or Upload: Wait for capture button or upload instead
    const captureButton = widgetDialog.getByRole('button', {
      name: /Capture Photo/i,
    });
    const uploadInsteadButton = widgetDialog.getByRole('button', {
      name: /Upload Instead/i,
    });

    // In Chromium with fake media stream flags, capture button will become enabled
    // If camera device needs time to init, fallback can upload directly
    try {
      await expect(captureButton).toBeEnabled({ timeout: 5000 });
      await captureButton.click();
    } catch {
      // Fallback: upload a test image buffer directly
      const fileChooserPromise = page.waitForEvent('filechooser');
      await uploadInsteadButton.click();
      const fileChooser = await fileChooserPromise;
      await fileChooser.setFiles({
        name: 'test-skin.png',
        mimeType: 'image/png',
        buffer: Buffer.from(
          'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
          'base64',
        ),
      });
    }

    // 8. Photo Review step
    const usePhotoButton = widgetDialog.getByRole('button', {
      name: /Use This Photo/i,
    });
    await expect(usePhotoButton).toBeVisible({ timeout: 6000 });
    await usePhotoButton.click();

    // 9. Processing / Analysis state
    await expect(
      widgetDialog.getByRole('heading', { name: /Analyzing Your Skin/i }),
    ).toBeVisible({ timeout: 5000 });

    // 10. Skin Report step
    await expect(
      widgetDialog.getByRole('heading', { name: /Your Skin Insights/i }),
    ).toBeVisible({ timeout: 10000 });

    // Observations should be visible
    await expect(widgetDialog.getByText(/Hydration/i).first()).toBeVisible();
    await expect(
      widgetDialog.getByRole('heading', { name: /Recommended Products/i }),
    ).toBeVisible();

    // 11. Add a recommended product to shopping bag
    const addToBagButtons = widgetDialog.getByRole('button', {
      name: /Add .* to shopping bag/i,
    });
    await expect(addToBagButtons.first()).toBeVisible();
    await addToBagButtons.first().click();

    // 12. Host cart drawer should open with the added product
    const cartDrawer = page.getByRole('dialog', { name: 'Shopping bag' });
    await expect(cartDrawer).toBeVisible({ timeout: 5000 });
    await expect(
      cartDrawer.getByRole('heading', { name: /Your Bag/i }),
    ).toBeVisible();
    await expect(cartDrawer.getByRole('listitem').first()).toBeVisible();
  });
});
