import { useState, useEffect } from "react";
import { Layout } from "./Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { useAuth } from "./AuthContext";
import { Package } from "lucide-react";

interface Order {
  id: string;
  date: string;
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  items: Array<{
    id: string;
    title: string;
    price: number;
    qty: number;
    image?: string;
  }>;
  customer: {
    name: string;
    email: string;
  };
  userId?: string;
}

export function SellerOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const loadOrders = () => {
      try {
        const allOrdersRaw = localStorage.getItem("orders");
        if (allOrdersRaw) {
          const allOrders: Order[] = JSON.parse(allOrdersRaw);
          
          // Get seller's products
          const sellerProductsRaw = localStorage.getItem("seller_products");
          const sellerProducts = sellerProductsRaw ? JSON.parse(sellerProductsRaw) : [];
          const sellerProductIds = sellerProducts
            .filter((p: any) => p.storeId === user?.storeId)
            .map((p: any) => p.id);
          
          // Filter orders that contain seller's products
          const sellerOrders = allOrders.filter(order => 
            order.items && order.items.some(item => sellerProductIds.includes(item.id))
          );
          
          setOrders(sellerOrders);
        }
      } catch (error) {
        console.error("Error loading orders:", error);
        setOrders([]);
      }
    };

    loadOrders();

    const handleOrderUpdate = () => {
      loadOrders();
    };

    window.addEventListener("orders-updated", handleOrderUpdate);

    return () => {
      window.removeEventListener("orders-updated", handleOrderUpdate);
    };
  }, [user?.storeId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500";
      case "processing":
        return "bg-blue-500";
      case "shipped":
        return "bg-purple-500";
      case "delivered":
        return "bg-green-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const updateOrderStatus = (orderId: string, newStatus: Order["status"]) => {
    try {
      const allOrdersRaw = localStorage.getItem("orders");
      if (allOrdersRaw) {
        const allOrders: Order[] = JSON.parse(allOrdersRaw);
        const updated = allOrders.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        );
        localStorage.setItem("orders", JSON.stringify(updated));
        setOrders(orders.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        ));
        window.dispatchEvent(new Event("orders-updated"));
      }
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  return (
    <Layout>
      <div className="container px-4 md:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Seller Orders</h1>
          <p className="text-muted-foreground">
            Manage orders for products from your store
          </p>
        </div>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Package className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
              <p className="text-muted-foreground text-center">
                Orders for your products will appear here
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                      <CardDescription>
                        {new Date(order.date).toLocaleDateString()} • {order.customer?.name || "Unknown"} ({order.customer?.email || "N/A"})
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Order Items */}
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Items:</h4>
                      {order.items && order.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 p-2 border rounded"
                        >
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-12 h-12 object-cover rounded"
                              onError={(e) => {
                                e.currentTarget.src = "https://via.placeholder.com/48";
                              }}
                            />
                          )}
                          <div className="flex-1">
                            <p className="text-sm font-medium">{item.title || "Unknown Product"}</p>
                            <p className="text-xs text-muted-foreground">
                              Qty: {item.qty || 1} × ${(item.price || 0).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Total */}
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="font-semibold">Total:</span>
                      <span className="text-lg font-bold">
                        ${(order.total || 0).toFixed(2)}
                      </span>
                    </div>

                    {/* Status Update Buttons */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      {order.status === "pending" && (
                        <Button
                          size="sm"
                          onClick={() => updateOrderStatus(order.id, "processing")}
                        >
                          Mark as Processing
                        </Button>
                      )}
                      {order.status === "processing" && (
                        <Button
                          size="sm"
                          onClick={() => updateOrderStatus(order.id, "shipped")}
                        >
                          Mark as Shipped
                        </Button>
                      )}
                      {order.status === "shipped" && (
                        <Button
                          size="sm"
                          onClick={() => updateOrderStatus(order.id, "delivered")}
                        >
                          Mark as Delivered
                        </Button>
                      )}
                      {order.status !== "cancelled" && order.status !== "delivered" && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => updateOrderStatus(order.id, "cancelled")}
                        >
                          Cancel Order
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
