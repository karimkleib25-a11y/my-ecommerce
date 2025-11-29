export interface OrderItem {
  id: string;
  title: string;
  price: number;
  qty: number;
  image?: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  createdAt: string;
  deliveredAt?: string;
  shippingAddress?: {
    fullName?: string;
    name?: string;
    email?: string;
    address: string;
    city: string;
    postalCode: string;
    phone?: string;
  };
}

const STORAGE_KEY = "orders";

export function getOrders(): Order[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function getOrdersByUser(userId: string): Order[] {
  return getOrders().filter(o => o.userId === userId);
}

export function getOrderById(orderId: string): Order | undefined {
  return getOrders().find(o => o.id === orderId);
}

export function addOrder(order: Order) {
  const orders = getOrders();
  orders.push(order);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  window.dispatchEvent(new Event("orders-updated"));
}

export function updateOrderStatus(orderId: string, status: Order["status"]) {
  const orders = getOrders();
  const order = orders.find(o => o.id === orderId);
  if (order) {
    order.status = status;
    if (status === "delivered") {
      order.deliveredAt = new Date().toISOString();
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    window.dispatchEvent(new Event("orders-updated"));
  }
}

export function deleteOrder(orderId: string) {
  const orders = getOrders().filter(o => o.id !== orderId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  window.dispatchEvent(new Event("orders-updated"));
}