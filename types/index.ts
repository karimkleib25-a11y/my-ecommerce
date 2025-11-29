export interface User {
  id: string;
  email: string;
  name: string;
  role: "buyer" | "seller" | "admin";
  storeId?: string;
  storeName?: string;
}

export interface Product {
  id: string;
  name?: string;
  title?: string;
  price: number;
  category: string;
  description?: string;
  image?: string;
  images?: string[];
  storeId?: string;
  storeName?: string;
  rating?: number; // Average rating
  reviewCount?: number; // Total reviews
  inStock?: boolean;
  quantity?: number;
  discount?: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'dispatched' | 'delivered' | 'unsuccessful' | 'canceled';
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  storeId: string;
  storeName: string;
}

export interface Review {
  id: string;
  productId: string;
  productName: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  image?: string;
  createdAt: Date;
}