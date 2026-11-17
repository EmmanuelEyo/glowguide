'use client';

interface WidgetHeaderProps {
  brandName?: string;
  stepTitle?: string;
  showClose?: boolean;
  onClose?: () => void;
}

export function WidgetHeader({
  brandName = 'GlowGuide',
  stepTitle = 'Skin Discovery',
  showClose = false,
  onClose,
}: WidgetHeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-luma-border bg-luma-surface select-none">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-full bg-luma-blush-pale border border-luma-blush flex items-center justify-center text-luma-accent text-sm shrink-0">
          ✦
        </div>
        <div>
          <p className="text-[0.625rem] font-medium tracking-[0.14em] uppercase text-luma-ghost">
            {brandName}
          </p>
          <h2 className="font-display text-base font-light text-luma-ink leading-tight">
            {stepTitle}
          </h2>
        </div>
      </div>

      {showClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close skin analysis"
          className="flex items-center justify-center w-8 h-8 rounded-md text-luma-secondary hover:text-luma-ink hover:bg-luma-subtle transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M2 2l12 12M14 2L2 14"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}
    </header>
  );
}
