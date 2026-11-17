'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { CartContextValue, CartItem } from '@/types/cart';
import {
  addItem,
  calcItemCount,
  calcSubtotal,
  loadCart,
  removeItem,
  saveCart,
  updateQuantity,
} from '@/lib/cart';

const CartContext = createContext<CartContextValue | null>(null);

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return ctx;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const hydrated = useRef(false);

  // Hydrate from localStorage once on mount (client only)
  useEffect(() => {
    if (!hydrated.current) {
      hydrated.current = true;
      setItems(loadCart());
    }
  }, []);

  // Persist to localStorage whenever items change (after hydration)
  useEffect(() => {
    if (hydrated.current) {
      saveCart(items);
    }
  }, [items]);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const handleAddItem = useCallback((productId: string, quantity: number) => {
    setItems((prev) => addItem(prev, productId, quantity));
  }, []);

  const handleRemoveItem = useCallback((productId: string) => {
    setItems((prev) => removeItem(prev, productId));
  }, []);

  const handleUpdateQuantity = useCallback((productId: string, quantity: number) => {
    setItems((prev) => updateQuantity(prev, productId, quantity));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      itemCount: calcItemCount(items),
      subtotal: calcSubtotal(items),
      isOpen,
      openCart,
      closeCart,
      addItem: handleAddItem,
      removeItem: handleRemoveItem,
      updateQuantity: handleUpdateQuantity,
      clearCart,
    }),
    [items, isOpen, openCart, closeCart, handleAddItem, handleRemoveItem, handleUpdateQuantity, clearCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
