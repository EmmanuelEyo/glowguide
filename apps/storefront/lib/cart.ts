import type { CartItem } from '@/types/cart';
import { PRODUCTS } from '@/lib/products';

const STORAGE_KEY = 'luma-cart';

export function loadCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is CartItem =>
        typeof item === 'object' &&
        item !== null &&
        typeof item.productId === 'string' &&
        typeof item.quantity === 'number' &&
        item.quantity >= 1,
    );
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Silently ignore storage quota errors
  }
}

export function addItem(items: CartItem[], productId: string, quantity: number): CartItem[] {
  const existing = items.find((i) => i.productId === productId);
  if (existing) {
    return items.map((i) =>
      i.productId === productId ? { ...i, quantity: i.quantity + quantity } : i,
    );
  }
  return [...items, { productId, quantity: Math.max(1, quantity) }];
}

export function removeItem(items: CartItem[], productId: string): CartItem[] {
  return items.filter((i) => i.productId !== productId);
}

export function updateQuantity(items: CartItem[], productId: string, quantity: number): CartItem[] {
  if (quantity < 1) return removeItem(items, productId);
  return items.map((i) => (i.productId === productId ? { ...i, quantity } : i));
}

export function calcItemCount(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}

export function calcSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => {
    const product = PRODUCTS.find((p) => p.id === item.productId);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);
}
