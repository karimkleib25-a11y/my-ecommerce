import { useState } from "react";
import { Layout } from "./Layout";
import { useNavigate } from "react-router-dom";
import { useCart } from "../lib/cart";
import { useAuth } from "./AuthContext";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge"; // FIXED: Import from ui/badge
import { toast } from "sonner";
import { ShoppingBag } from "lucide-react"; // FIXED: Only ShoppingBag from lucide-react
import { addOrder } from "../lib/orders";

export function CheckoutPage() {
  const { items, clearCart, getTotal } = useCart();
  const total = getTotal(); // CHANGED: compute total
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    fullName: user?.name || "",
    email: user?.email || "",
    address: "",
    city: "",
    postalCode: "",
    phone: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.address || !formData.city || !formData.postalCode || !formData.phone) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!user) {
      toast.error("Please log in to place an order");
      navigate("/login");
      return;
    }

    const order = {
      id: `order_${Date.now()}`,
      userId: user.id,
      items: items.map(item => ({
        id: item.id,
        title: item.title,
        price: item.price,
        qty: item.qty,
        image: item.image,
      })),
      total, // uses computed total
      status: "processing" as const, // Start as processing
      createdAt: new Date().toISOString(),
      shippingAddress: formData,
    };

    addOrder(order);

    clearCart();
    toast.success("Order placed successfully!");
    navigate("/orders");
  };

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container px-4 md:px-6 py-16">
          <div className="text-center">
            <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-4">Add some products to checkout</p>
            <Button onClick={() => navigate("/")}>Continue Shopping</Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container px-4 md:px-6 py-8">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Information</CardTitle>
              <CardDescription>Enter your delivery details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                      id="postalCode"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" size="lg">
                  Place Order
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-16 h-16 object-cover rounded"
                      onError={(e) => {
                        e.currentTarget.src = "https://via.placeholder.com/64";
                      }}
                    />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm font-semibold">${item.price.toFixed(2)}</p>
                      {item.discount && item.discount > 0 && item.originalPrice && (
                        <>
                          <span className="text-xs text-muted-foreground line-through">
                            ${item.originalPrice.toFixed(2)}
                          </span>
                          <Badge variant ="destructive" className="text-xs h-5">
                            -{item.discount}%
                          </Badge>
                        </>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">Qty: {item.qty}</p>
                  </div>
                  <p className="font-semibold">${(item.price * item.qty).toFixed(2)}</p>
                </div>
              ))}
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span data-testid="checkout-total">${total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}