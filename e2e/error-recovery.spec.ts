import { test, expect } from '@playwright/test';

test.describe('Browser Failure & Error Recovery', () => {
  test('handles camera permission denial gracefully and recovers via photo upload', async ({
    page,
  }) => {
    // 1. Mock getUserMedia rejection to emulate permission denial
    await page.addInitScript(() => {
      if (navigator.mediaDevices) {
        navigator.mediaDevices.getUserMedia = () =>
          Promise.reject(
            new DOMException('Camera permission denied by user', 'NotAllowedError'),
          );
      }
    });

    await page.goto('/');

    // 2. Open floating widget
    const launcherButton = page.locator(
      'button.fixed[aria-label="Open GlowGuide skin analysis"]',
    );
    await expect(launcherButton).toBeVisible();
    await launcherButton.click();

    const widgetDialog = page.getByRole('dialog', {
      name: 'GlowGuide skin analysis',
    });
    await expect(widgetDialog).toBeVisible();

    // 3. Advance through Welcome & Consent
    const beginButton = widgetDialog.getByRole('button', {
      name: /Begin Skin Analysis/i,
    });
    await beginButton.click();

    const consentCheckbox = widgetDialog.locator('#camera-consent');
    await consentCheckbox.check();

    const continueButton = widgetDialog.getByRole('button', {
      name: /I Agree & Continue/i,
    });
    await continueButton.click();

    // 4. Verify CameraErrorRecovery is displayed with fallback guidance
    await expect(
      widgetDialog.getByRole('heading', { name: 'Enable Camera Access' }),
    ).toBeVisible({ timeout: 10000 });

    // 5. Recover using 'Upload a Photo Instead'
    const uploadButton = widgetDialog.getByRole('button', {
      name: /Upload a Photo Instead/i,
    });
    await expect(uploadButton).toBeVisible();

    const fileChooserPromise = page.waitForEvent('filechooser');
    await uploadButton.click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles({
      name: 'sample-recovery-photo.png',
      mimeType: 'image/png',
      buffer: Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        'base64',
      ),
    });

    // 6. Verify transition to Photo Review mode
    const usePhotoButton = widgetDialog.getByRole('button', {
      name: /Use This Photo/i,
    });
    await expect(usePhotoButton).toBeVisible({ timeout: 6000 });
    await usePhotoButton.click();

    // 7. Verify analysis completes and displays report
    await expect(
      widgetDialog.getByRole('heading', { name: /Your Skin Insights/i }),
    ).toBeVisible({ timeout: 10000 });
  });

  test('Developer Playground diagnostic controls simulate error states and recovery options', async ({
    page,
  }) => {
    await page.goto('/playground');
    await expect(page).toHaveTitle(/Developer Integration Playground/i);

    const previewCanvas = page.locator('.glowguide-theme-root').first();
    await expect(previewCanvas).toBeVisible();

    // 1. Simulate Camera Denied via diagnostics bar
    const cameraDeniedButton = page.getByRole('button', {
      name: 'Camera Denied',
    });
    await expect(cameraDeniedButton).toBeVisible();
    await cameraDeniedButton.click();

    // Verify recovery view rendered in preview canvas
    await expect(
      previewCanvas.getByRole('heading', { name: 'Enable Camera Access' }),
    ).toBeVisible();
    await expect(
      previewCanvas.getByRole('button', { name: /Upload a Photo Instead/i }),
    ).toBeVisible();

    // 2. Simulate No Camera Found via diagnostics bar
    const noCameraButton = page.getByRole('button', { name: 'No Camera' });
    await expect(noCameraButton).toBeVisible();
    await noCameraButton.click();

    // Verify 'No Camera Detected'
    await expect(
      previewCanvas.getByRole('heading', { name: 'No Camera Detected' }),
    ).toBeVisible();
    await expect(
      previewCanvas.getByRole('button', { name: /Upload a Photo Instead/i }),
    ).toBeVisible();
  });
});
