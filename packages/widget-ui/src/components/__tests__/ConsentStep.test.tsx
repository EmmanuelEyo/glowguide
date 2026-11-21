import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { WidgetProvider } from '../../context/WidgetContext';
import { ConsentStep } from '../steps/ConsentStep';

describe('ConsentStep component', () => {
  it('displays validation error if user attempts to continue without consenting', () => {
    render(
      <WidgetProvider>
        <ConsentStep />
      </WidgetProvider>
    );

    const continueButton = screen.getByRole('button', { name: /I Agree & Continue/i });
    fireEvent.click(continueButton);

    expect(
      screen.getByText(/Please consent to local image analysis to proceed/i)
    ).toBeInTheDocument();
  });

  it('allows user to agree to terms and advance without validation error', () => {
    const handleConsentGiven = vi.fn();
    render(
      <WidgetProvider onConsentGiven={handleConsentGiven}>
        <ConsentStep />
      </WidgetProvider>
    );

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();

    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();

    const continueButton = screen.getByRole('button', { name: /I Agree & Continue/i });
    fireEvent.click(continueButton);

    expect(
      screen.queryByText(/Please consent to local image analysis to proceed/i)
    ).not.toBeInTheDocument();
    expect(handleConsentGiven).toHaveBeenCalledTimes(1);
  });
});
