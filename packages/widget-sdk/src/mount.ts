import React, { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import type { Root } from 'react-dom/client';
import { GlowGuideWidget, useWidget } from '@glowguide/widget-ui';
import type { MountHandle, MountOptions } from './types';

function resolveContainer(target: HTMLElement | string): HTMLElement {
  if (typeof target === 'string') {
    const el = document.querySelector<HTMLElement>(target);
    if (!el) {
      throw new Error(
        `GlowGuide SDK Error: Target container "${target}" was not found in document.`,
      );
    }
    return el;
  }
  if (target instanceof HTMLElement) {
    return target;
  }
  throw new Error(
    'GlowGuide SDK Error: Target container must be a CSS selector string or an HTMLElement.',
  );
}

interface ControllerRef {
  open: () => void;
  close: () => void;
  toggle: () => void;
}

interface WidgetMountedBridgeProps {
  onEvent?: MountOptions['onEvent'];
  onControllerReady?: (controller: ControllerRef) => void;
  onOpenStateChange?: (isOpen: boolean) => void;
}

function WidgetMountedBridge({
  onEvent,
  onControllerReady,
  onOpenStateChange,
}: WidgetMountedBridgeProps) {
  const { openWidget, closeWidget, toggleWidget, isOpen } = useWidget();

  useEffect(() => {
    onOpenStateChange?.(isOpen);
  }, [isOpen, onOpenStateChange]);

  useEffect(() => {
    const controller: ControllerRef = {
      open: openWidget,
      close: closeWidget,
      toggle: toggleWidget,
    };
    onControllerReady?.(controller);

    const handleOpen = () => openWidget();
    const handleClose = () => closeWidget();
    const handleToggle = () => toggleWidget();

    window.addEventListener('glowguide:open', handleOpen);
    window.addEventListener('glowguide:close', handleClose);
    window.addEventListener('glowguide:toggle', handleToggle);

    return () => {
      window.removeEventListener('glowguide:open', handleOpen);
      window.removeEventListener('glowguide:close', handleClose);
      window.removeEventListener('glowguide:toggle', handleToggle);
    };
  }, [openWidget, closeWidget, toggleWidget, onControllerReady]);

  return null;
}

export function mountWidget(options: MountOptions): MountHandle {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    throw new Error('GlowGuide SDK Error: Cannot mount widget outside a browser DOM environment.');
  }

  const { config, target, onEvent } = options;
  const isInline = config.mode === 'inline';

  let container: HTMLElement;
  let createdElement = false;

  if (isInline) {
    const targetCandidate = target || config.container;
    if (!targetCandidate) {
      throw new Error(
        'GlowGuide SDK Error: Target container is required when mode is "inline". Provide a CSS selector or HTMLElement via config.container or sdk.mount(target).',
      );
    }
    container = resolveContainer(targetCandidate);
  } else {
    if (target) {
      container = resolveContainer(target);
    } else {
      const existing = document.getElementById('glowguide-widget-floating-root');
      if (existing) {
        container = existing;
      } else {
        container = document.createElement('div');
        container.id = 'glowguide-widget-floating-root';
        container.setAttribute('data-glowguide-floating', 'true');
        document.body.appendChild(container);
        createdElement = true;
      }
    }
  }

  let controller: ControllerRef | null = null;
  const root: Root = createRoot(container);

  root.render(
    React.createElement(
      GlowGuideWidget,
      {
        config,
        mode: config.mode,
        onAddToCart: (e) => onEvent?.('add-to-cart', e),
        onCheckoutRequest: (e) => onEvent?.('checkout-request', e),
        onConsentGiven: (e) => onEvent?.('consent-given', e),
        onScanComplete: (e) => onEvent?.('scan-complete', e),
        onCameraError: (e) => onEvent?.('camera-error', e),
      },
      React.createElement(WidgetMountedBridge, {
        onEvent,
        onControllerReady: (c) => {
          controller = c;
        },
        onOpenStateChange: (open) => {
          if (open) {
            onEvent?.('opened', { timestamp: new Date().toISOString() });
          } else {
            onEvent?.('closed', { timestamp: new Date().toISOString() });
          }
        },
      }),
    ),
  );

  return {
    container,
    unmount: () => {
      try {
        root.unmount();
      } catch (err) {
        console.error('GlowGuide SDK: Error unmounting React root:', err);
      }
      if (createdElement && container.parentNode) {
        container.parentNode.removeChild(container);
      }
    },
    open: () => {
      if (controller) {
        controller.open();
      } else {
        window.dispatchEvent(new CustomEvent('glowguide:open'));
      }
    },
    close: () => {
      if (controller) {
        controller.close();
      } else {
        window.dispatchEvent(new CustomEvent('glowguide:close'));
      }
    },
    toggle: () => {
      if (controller) {
        controller.toggle();
      } else {
        window.dispatchEvent(new CustomEvent('glowguide:toggle'));
      }
    },
  };
}
