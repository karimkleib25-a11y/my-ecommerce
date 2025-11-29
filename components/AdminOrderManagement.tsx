import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { getOrders, updateOrderStatus, type Order } from "../lib/orders";
import { Truck, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export function AdminOrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    loadOrders();
    const handler = () => loadOrders();
    window.addEventListener("orders-updated", handler);
    return () => window.removeEventListener("orders-updated", handler);
  }, []);

  const loadOrders = () => {
    setOrders(getOrders());
  };

  const handleUpdateStatus = (orderId: string, status: Order["status"]) => {
    updateOrderStatus(orderId, status);
    toast.success(`Order status updated to ${status}`);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Order Management</h2>
      {orders.map((order) => (
        <Card key={order.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <Badge>{order.status}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              {order.status === "processing" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleUpdateStatus(order.id, "shipped")}
                  className="gap-2"
                >
                  <Truck className="h-4 w-4" />
                  Mark Shipped
                </Button>
              )}
              {order.status === "shipped" && (
                <Button
                  size="sm"
                  onClick={() => handleUpdateStatus(order.id, "delivered")}
                  className="gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  Mark Delivered
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}