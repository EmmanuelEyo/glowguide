import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { WidgetProvider } from '../../context/WidgetContext';
import { WelcomeStep } from '../steps/WelcomeStep';

describe('WelcomeStep component', () => {
  it('renders merchant brand name and welcome copy', () => {
    render(
      <WidgetProvider config={{ brandName: 'Luma Beauty' }}>
        <WelcomeStep />
      </WidgetProvider>
    );

    expect(screen.getByText(/Luma Beauty • Powered by GlowGuide/i)).toBeInTheDocument();
    expect(screen.getByText(/Discover Your Skin's Match/i)).toBeInTheDocument();
  });

  it('triggers onStart callback or advances to next step on CTA click', () => {
    const handleStart = vi.fn();
    render(
      <WidgetProvider config={{ brandName: 'Aura Botanicals' }}>
        <WelcomeStep onStart={handleStart} />
      </WidgetProvider>
    );

    const startButton = screen.getByRole('button', { name: /Begin Skin Analysis/i });
    expect(startButton).toBeInTheDocument();

    fireEvent.click(startButton);
    expect(handleStart).toHaveBeenCalledTimes(1);
  });
});
