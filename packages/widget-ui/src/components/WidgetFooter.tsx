'use client';

interface WidgetFooterProps {
  primaryLabel?: string;
  onPrimaryClick?: () => void;
  showBack?: boolean;
  onBackClick?: () => void;
  primaryDisabled?: boolean;
}

export function WidgetFooter({
  primaryLabel = 'Continue',
  onPrimaryClick,
  showBack = false,
  onBackClick,
  primaryDisabled = false,
}: WidgetFooterProps) {
  return (
    <footer className="flex items-center justify-between px-6 py-4 border-t border-luma-border bg-luma-surface">
      {showBack ? (
        <button
          type="button"
          onClick={onBackClick}
          className="inline-flex items-center gap-1.5 h-10 px-4 rounded-[3px] border border-luma-border-strong text-luma-ink text-[0.6875rem] font-medium tracking-[0.08em] uppercase hover:bg-luma-subtle transition-colors"
        >
          ← Back
        </button>
      ) : (
        <div aria-hidden="true" />
      )}

      {primaryLabel && (
        <button
          type="button"
          onClick={onPrimaryClick}
          disabled={primaryDisabled}
          className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-[3px] bg-luma-accent hover:bg-luma-accent-dark text-luma-inverse text-[0.6875rem] font-medium tracking-[0.1em] uppercase transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {primaryLabel}
        </button>
      )}
    </footer>
  );
}
