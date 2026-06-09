import { create } from 'zustand';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  categories?: { name: string; slug: string };
}

export interface CartItem extends Product {
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotals: () => { subtotal: number; itemsCount: number };
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  
  addItem: (product: Product) => set((state) => {
    const existingItem = state.items.find(item => item.id === product.id);
    if (existingItem) {
      return {
        items: state.items.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        )
      };
    }
    return { items: [...state.items, { ...product, quantity: 1 }] };
  }),
  
  removeItem: (productId: string) => set((state) => ({
    items: state.items.filter(item => item.id !== productId)
  })),
  
  updateQuantity: (productId: string, quantity: number) => set((state) => {
    if (quantity <= 0) {
      return { items: state.items.filter(item => item.id !== productId) };
    }
    return {
      items: state.items.map(item => 
        item.id === productId ? { ...item, quantity } : item
      )
    };
  }),
  
  clearCart: () => set({ items: [] }),
  
  getTotals: () => {
    const items = get().items;
    const itemsCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    return { subtotal, itemsCount };
  }
}));
