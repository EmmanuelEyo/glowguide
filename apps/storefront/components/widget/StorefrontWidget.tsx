'use client';

import { useEffect } from 'react';
import { GlowGuideWidget } from '@glowguide/widget-ui';
import type { AddToCartEvent, CheckoutRequestEvent } from '@glowguide/widget-ui';
import { useCart } from '@/contexts/CartContext';

export default function StorefrontWidget() {
  const { addItem, openCart } = useCart();

  const handleAddToCart = (event: AddToCartEvent) => {
    addItem(event.productId, event.quantity || 1);
    openCart();
  };

  const handleCheckoutRequest = (event: CheckoutRequestEvent) => {
    if (event.productIds && event.productIds.length > 0) {
      event.productIds.forEach((id) => {
        addItem(id, 1);
      });
    }
    openCart();
  };

  // Also listen for decoupled DOM CustomEvents so any embedded widget on the page seamlessly syncs
  useEffect(() => {
    const onDomAddToCart = (e: Event) => {
      const customEvent = e as CustomEvent<AddToCartEvent>;
      if (customEvent.detail) {
        addItem(customEvent.detail.productId, customEvent.detail.quantity || 1);
        openCart();
      }
    };

    const onDomCheckout = (e: Event) => {
      const customEvent = e as CustomEvent<CheckoutRequestEvent>;
      if (customEvent.detail && customEvent.detail.productIds) {
        customEvent.detail.productIds.forEach((id) => {
          addItem(id, 1);
        });
      }
      openCart();
    };

    window.addEventListener('glowguide:add-to-cart', onDomAddToCart);
    window.addEventListener('glowguide:checkout-request', onDomCheckout);

    return () => {
      window.removeEventListener('glowguide:add-to-cart', onDomAddToCart);
      window.removeEventListener('glowguide:checkout-request', onDomCheckout);
    };
  }, [addItem, openCart]);

  return (
    <GlowGuideWidget
      config={{
        storeId: 'luma-beauty',
        brandName: 'Luma Beauty',
      }}
      onAddToCart={handleAddToCart}
      onCheckoutRequest={handleCheckoutRequest}
    />
  );
}
