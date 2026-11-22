import { test, expect } from '@playwright/test';

test.describe('Host Integration & Command Bus', () => {
  test('React integration showcase provides programmatic SDK controls with live state telemetry', async ({
    page,
  }) => {
    await page.goto('/react-integration');
    await expect(page).toHaveTitle(/React & Next.js Integration/i);

    // 1. Verify client hydration status
    await expect(page.getByText('Hydrated (Client)')).toBeVisible({
      timeout: 10000,
    });

    // 2. Programmatic open() and close() controls
    const openButton = page.getByRole('button', { name: '✦ open()' });
    await openButton.click();
    await expect(page.getByText('Open (Active)')).toBeVisible();

    const closeButton = page.getByRole('button', { name: 'close()' });
    await closeButton.click({ force: true });
    await expect(
      page.getByText('Widget Visibility').locator('..').getByText('Closed', { exact: true }),
    ).toBeVisible();

    // 3. Programmatic setStep('consent') control
    const consentStepButton = page.getByRole('button', {
      name: /^consent$/i,
    });
    await consentStepButton.click();

    // Verify current step telemetry card updates to consent
    await expect(
      page.getByText('Current Step').locator('..').getByText('consent'),
    ).toBeVisible();

    // Verify the embedded inline component reflects the consent step
    await expect(
      page.getByRole('heading', { name: 'Camera Access & Privacy' }),
    ).toBeVisible();

    // 4. Programmatic setStep('report') control
    const reportStepButton = page.getByRole('button', { name: /^report$/i });
    await reportStepButton.click();
    await expect(
      page.getByText('Current Step').locator('..').getByText('report'),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'No Report Available' }),
    ).toBeVisible();

    // 5. Programmatic Reset Session control
    const resetButton = page.getByRole('button', { name: 'Reset Session' });
    await resetButton.click();
    await expect(
      page.getByText('Current Step').locator('..').getByText('welcome'),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: "Discover Your Skin's Match" }),
    ).toBeVisible();
  });

  test('Developer Playground allows live customization and captures telemetry events', async ({
    page,
  }) => {
    await page.goto('/playground');
    await expect(page).toHaveTitle(/Developer Integration Playground/i);

    // 1. Customize brand name in configurator
    const brandInput = page.locator('#cfg-brand-name');
    await expect(brandInput).toBeVisible();
    await brandInput.fill('Aura Botanicals');

    // Verify preview canvas updates brand name immediately
    const previewCanvas = page.locator('.glowguide-theme-root').first();
    await expect(previewCanvas).toBeVisible();
    await expect(
      previewCanvas.getByText(/Aura Botanicals • Powered by GlowGuide/i),
    ).toBeVisible();

    // 2. Select a theme color preset (e.g. Forest Sage)
    const forestPresetButton = page.getByRole('button', { name: /Forest/i });
    await expect(forestPresetButton).toBeVisible();
    await forestPresetButton.click();

    // 3. Jump steps using preview diagnostics bar
    const consentDiagnosticsButton = page.getByRole('button', {
      name: 'consent',
      exact: true,
    });
    await consentDiagnosticsButton.click();

    // Verify preview canvas renders consent step
    await expect(
      previewCanvas.getByText(/Camera Access & Privacy/i),
    ).toBeVisible();

    // 4. Switch to Event Stream Inspector tab
    const eventInspectorTab = page.getByRole('button', {
      name: /Event Stream Inspector/i,
    });
    await expect(eventInspectorTab).toBeVisible();
    await eventInspectorTab.click();

    // 5. Verify Event Stream Inspector header and recorded event
    await expect(
      page.getByRole('heading', { name: /Event Stream Inspector/i }),
    ).toBeVisible();
    await expect(
      page.getByText(/glowguide:step-change/i).first(),
    ).toBeVisible();
  });
});
