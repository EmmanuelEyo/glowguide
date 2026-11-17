export interface CartItem {
  productId: string; // matches Product.id from lib/products
  quantity: number; // >= 1
}

export interface CartContextValue {
  items: CartItem[];
  itemCount: number; // sum of all quantities
  subtotal: number; // sum of price * quantity via PRODUCTS lookup
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (productId: string, quantity: number) => void; // merges if already in cart
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void; // quantity >= 1
  clearCart: () => void;
}
