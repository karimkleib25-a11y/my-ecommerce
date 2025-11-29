import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  qty: number;
  image?: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "qty">) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
  getTotal: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const items = get().items;
        const existing = items.find((i) => i.id === item.id);
        if (existing) {
          set({
            items: items.map((i) =>
              i.id === item.id ? { ...i, qty: i.qty + 1 } : i
            ),
          });
        } else {
          set({ items: [...items, { ...item, qty: 1 }] });
        }
      },

      removeItem: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) });
      },

      updateQty: (id, qty) => {
        if (qty <= 0) {
          get().removeItem(id);
          return;
        }
        set({
          items: get().items.map((i) => (i.id === id ? { ...i, qty } : i)),
        });
      },

      clearCart: () => {
        set({ items: [] });
      },

      getTotal: () => {
        const items = get().items;
        return items.reduce((sum, item) => sum + item.price * item.qty, 0);
      },
    }),
    { name: "cart" }
  )
);
export const products = [
  {
    id: "p1",
    name: "Wireless Headphones",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop",
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop",
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop",
    ],
    price: 129.99,
    storeId: "store1",
    storeName: "E-Shop",
    category: "Electronics",
    rating: 4.5,
    reviewCount: 120,
    inStock: true,
    description: "Great sound.",
  },
  {
    id: "p2",
    name: "Smartphone",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop",
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop",
    ],
    price: 699.0,
    storeId: "store1",
    storeName: "E-Shop",
    category: "Electronics",
    rating: 4.7,
    reviewCount: 210,
    inStock: true,
    description: "Latest model.",
  },
  {
    id: '3',
    name: 'Leather Backpack',
    title: 'Leather Backpack',
    price: 89.99,
    originalPrice: 129.99,
    discount: 31,
    discountExpiry: new Date('2025-11-30'),
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop',
    storeId: 'store2',
    storeName: 'Urban Style',
    category: 'Fashion',
    rating: 4.3,
    reviewCount: 87,
    inStock: true,
    quantity: 25,
    description: 'Stylish leather backpack for everyday use'
  },
  {
    id: '4',
    name: 'Running Shoes',
    title: 'Running Shoes',
    price: 119.99,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop',
    storeId: 'store2',
    storeName: 'Urban Style',
    category: 'Fashion',
    rating: 4.6,
    reviewCount: 215,
    inStock: true,
    quantity: 40,
    description: 'Comfortable running shoes for peak performance'
  },
  {
    id: '5',
    name: 'Coffee Maker',
    title: 'Coffee Maker',
    price: 149.99,
    originalPrice: 199.99,
    discount: 25,
    discountExpiry: new Date('2025-12-15'),
    image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=500&h=500&fit=crop',
    storeId: 'store3',
    storeName: 'Home Essentials',
    category: 'Home',
    rating: 4.7,
    reviewCount: 156,
    inStock: true,
    quantity: 15,
    description: 'Programmable coffee maker with thermal carafe'
  },
  {
    id: '6',
    name: 'Desk Lamp',
    title: 'Desk Lamp',
    price: 49.99,
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&h=500&fit=crop',
    storeId: 'store3',
    storeName: 'Home Essentials',
    category: 'Home',
    rating: 4.4,
    reviewCount: 93,
    inStock: true,
    quantity: 60,
    description: 'Adjustable LED desk lamp with USB charging'
  },
  {
    id: '7',
    name: 'Yoga Mat',
    title: 'Yoga Mat',
    price: 34.99,
    image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500&h=500&fit=crop',
    storeId: 'store4',
    storeName: 'Fitness Pro',
    category: 'Sports',
    rating: 4.2,
    reviewCount: 67,
    inStock: true,
    quantity: 100,
    description: 'Non-slip yoga mat with carrying strap'
  },
  {
    id: '8',
    name: 'Bluetooth Speaker',
    title: 'Bluetooth Speaker',
    price: 59.99,
    originalPrice: 79.99,
    discount: 25,
    discountExpiry: new Date('2025-12-01'),
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&h=500&fit=crop',
    storeId: 'store1',
    storeName: 'Tech Haven',
    category: 'Electronics',
    rating: 4.5,
    reviewCount: 189,
    inStock: true,
    quantity: 45,
    description: 'Portable waterproof Bluetooth speaker'
  }
];

