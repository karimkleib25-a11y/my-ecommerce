import  { useEffect, useState } from "react";
import { Layout } from "./Layout";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { useAuth } from "./AuthContext";
import { Package, Star } from "lucide-react";
import { getOrdersByUser, type Order } from "../lib/orders";
import { hasUserReviewedProduct } from "../lib/reviews";
import { ReviewDialog } from "./ReviewDialog";

export function BuyerOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<{
    productId: string;
    orderId: string;
    productName: string;
  } | null>(null);

  useEffect(() => {
    if (user) {
      setOrders(getOrdersByUser(user.id));
    }

    const handleUpdate = () => {
      if (user) {
        setOrders(getOrdersByUser(user.id));
      }
    };

    window.addEventListener("orders-updated", handleUpdate);
    return () => window.removeEventListener("orders-updated", handleUpdate);
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-500";
      case "shipped":
        return "bg-blue-500";
      case "processing":
        return "bg-yellow-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Layout>
      <div className="container px-4 md:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Orders</h1>
          <p className="text-muted-foreground">Track and manage your orders</p>
        </div>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Package className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
              <p className="text-muted-foreground">
                Start shopping to see your orders here
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
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {order.items.map((item) => {
                      const alreadyReviewed = user
                        ? hasUserReviewedProduct(user.id, item.id, order.id)
                        : false;

                      return (
                        <div
                          key={item.id}
                          className="flex items-center gap-4 p-4 border rounded-lg"
                        >
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-16 h-16 object-cover rounded"
                            />
                          )}
                          <div className="flex-1">
                            <p className="font-medium">{item.title}</p>
                            <p className="text-sm text-muted-foreground">
                              Quantity: {item.qty} × ${item.price.toFixed(2)}
                            </p>
                            <p className="text-sm font-semibold mt-1">
                              ${(item.price * item.qty).toFixed(2)}
                            </p>
                          </div>

                          {/* Review button - only show for delivered orders */}
                          {order.status === "delivered" && (
                            <div>
                              {alreadyReviewed ? (
                                <Badge variant="secondary" className="gap-1">
                                  <Star className="h-3 w-3 fill-current" />
                                  Reviewed
                                </Badge>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="gap-2"
                                  onClick={() =>
                                    setSelectedProduct({
                                      productId: item.id,
                                      orderId: order.id,
                                      productName: item.title,
                                    })
                                  }
                                >
                                  <Star className="h-4 w-4" />
                                  Write Review
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    <div className="flex justify-between items-center pt-4 border-t">
                      <span className="font-semibold">Total</span>
                      <span className="text-xl font-bold">
                        ${order.total.toFixed(2)}
                      </span>
                    </div>

                    {order.deliveredAt && (
                      <p className="text-xs text-muted-foreground text-right">
                        Delivered on{" "}
                        {new Date(order.deliveredAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Review Dialog */}
      {selectedProduct && (
        <ReviewDialog
          productId={selectedProduct.productId}
          productName={selectedProduct.productName}
          orderId={selectedProduct.orderId}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </Layout>
  );
}
