import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { WidgetProgress } from '../WidgetProgress';

describe('WidgetProgress component', () => {
  it('renders progress bar with correct ARIA attributes for step 1 of 5', () => {
    render(<WidgetProgress currentStepIndex={0} totalSteps={5} />);

    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toBeInTheDocument();
    expect(progressbar).toHaveAttribute('aria-valuenow', '20');
    expect(progressbar).toHaveAttribute('aria-label', 'Step 1 of 5');
  });

  it('renders 100% completion for the final step', () => {
    render(<WidgetProgress currentStepIndex={4} totalSteps={5} />);

    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '100');
    expect(progressbar).toHaveAttribute('aria-label', 'Step 5 of 5');
  });
});
