import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import React, { useEffect } from 'react';
import { WidgetProvider, useWidget } from '../../context/WidgetContext';
import { SkinReportStep } from '../steps/SkinReportStep';

vi.mock('../../services/skinAnalysis', () => ({
  analyzeSkin: vi.fn().mockResolvedValue({
    scenarioId: 'balanced-glow',
    scenarioName: 'Balanced Radiance',
    summary: 'Optimal cellular turnover and healthy barrier resilience.',
    primaryFocus: 'Antioxidant Protection & Daily Radiance Preservation',
    observations: [
      {
        label: 'Hydration',
        value: 'Optimal (82%)',
        note: 'Surface moisture is well balanced.',
        score: 82,
        level: 'optimal',
      },
    ],
    generatedAt: new Date().toISOString(),
  }),
}));

function TriggerAnalysisHelper({ children }: { children: React.ReactNode }) {
  const { startAnalysis } = useWidget();

  useEffect(() => {
    startAnalysis('balanced-glow');
  }, [startAnalysis]);

  return <>{children}</>;
}

describe('SkinReportStep component', () => {
  it('renders fallback prompt when no analysis result is loaded', () => {
    render(
      <WidgetProvider>
        <SkinReportStep />
      </WidgetProvider>
    );

    expect(screen.getByText(/Profile Pending/i)).toBeInTheDocument();
    expect(screen.getByText(/No Report Available/i)).toBeInTheDocument();
  });

  it('renders skin insights observations and recommendations when analysis is present', async () => {
    await act(async () => {
      render(
        <WidgetProvider>
          <TriggerAnalysisHelper>
            <SkinReportStep />
          </TriggerAnalysisHelper>
        </WidgetProvider>
      );
    });

    expect(await screen.findByText(/Your Skin Insights/i)).toBeInTheDocument();
    expect(screen.getByText(/Balanced Radiance/i)).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: /Hydration Score/i })).toBeInTheDocument();
    expect(screen.getByText(/Optimal \(82%\)/i)).toBeInTheDocument();
  });
});
