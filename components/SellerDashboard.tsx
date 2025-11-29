import { useState, useEffect } from "react";
import { Layout } from "./Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { useAuth } from "./AuthContext";
import { Package, ShoppingBag, DollarSign, Plus, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { getProductsByStore } from "../lib/products";
import { getReviewsByProduct, type Review } from "../lib/reviews";
import { getOrders } from "../lib/orders";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

export function SellerDashboard() {
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    avgRating: 0,
  });

  useEffect(() => {
    if (!user?.storeId) return;

    loadDashboardData();

    const handleUpdate = () => {
      loadDashboardData();
    };

    window.addEventListener("products-updated", handleUpdate);
    window.addEventListener("reviews-updated", handleUpdate);
    window.addEventListener("orders-updated", handleUpdate);

    return () => {
      window.removeEventListener("products-updated", handleUpdate);
      window.removeEventListener("reviews-updated", handleUpdate);
      window.removeEventListener("orders-updated", handleUpdate);
    };
  }, [user?.storeId]);

  const loadDashboardData = () => {
    if (!user?.storeId) return;

    // Load products
    const storeProducts = getProductsByStore(user.storeId);
    setProducts(storeProducts);

    // Get all product IDs from this store
    const storeProductIds = storeProducts.map(p => p.id);

    // Load reviews for all store products
    const allReviews: Review[] = [];
    storeProducts.forEach(product => {
      const productReviews = getReviewsByProduct(product.id);
      allReviews.push(...productReviews);
    });
    setReviews(allReviews);

    // Calculate orders and revenue for this seller's products
    const allOrders = getOrders();
    let totalOrders = 0;
    let totalRevenue = 0;

    allOrders.forEach(order => {
      // Add safety check for order.items
      if (!order || !order.items || !Array.isArray(order.items)) {
        return; // Skip invalid orders
      }

      // Check if this order contains any products from this seller's store
      const hasSellerProducts = order.items.some(item => 
        item && storeProductIds.includes(item.id)
      );

      if (hasSellerProducts) {
        totalOrders++;
        
        // Calculate revenue only from seller's products in this order
        const sellerRevenue = order.items
          .filter(item => item && storeProductIds.includes(item.id))
          .reduce((sum, item) => sum + (item.price * item.qty), 0);
        
        totalRevenue += sellerRevenue;
      }
    });

    // Calculate average rating
    const avgRating = allReviews.length > 0
      ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
      : 0;

    setStats({
      totalProducts: storeProducts.length,
      totalOrders,
      totalRevenue,
      avgRating: Number(avgRating.toFixed(1)),
    });
  };

  const getProductName = (productId: string) => {
    const product = products.find(p => p.id === productId);
    return product?.name || "Unknown Product";
  };

  return (
    <Layout>
      <div className="container px-4 md:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Seller Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name}! Here's your store overview.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Active products in store
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Orders containing your products
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center gap-2">
                {stats.avgRating > 0 ? (
                  <>
                    <span className="text-yellow-500">★</span>
                    {stats.avgRating.toFixed(1)}
                  </>
                ) : (
                  "No reviews"
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {reviews.length} total review{reviews.length !== 1 && 's'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Revenue from your products
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your store efficiently</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Link to="/seller/add-product">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add New Product
              </Button>
            </Link>
            <Link to="/seller/orders">
              <Button variant="outline">
                <Package className="mr-2 h-4 w-4" />
                View Orders
              </Button>
            </Link>
            <Link to="/seller/products">
              <Button variant="outline">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Manage Products
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Activity Tabs */}
        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="products">Recent Products</TabsTrigger>
            <TabsTrigger value="reviews">Recent Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Products</CardTitle>
                <CardDescription>Your latest added products</CardDescription>
              </CardHeader>
              <CardContent>
                {products.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No products yet. Add your first product to get started!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {products.slice(0, 5).map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center gap-4 p-4 border rounded-lg"
                      >
                        {product.image && (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded"
                            onError={(e) => {
                              e.currentTarget.src = "https://via.placeholder.com/64";
                            }}
                          />
                        )}
                        <div className="flex-1">
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            ${product.price.toFixed(2)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {product.rating && product.rating > 0 && (
                            <Badge variant="secondary" className="gap-1">
                              <Star className="h-3 w-3 fill-current text-yellow-500" />
                              {product.rating.toFixed(1)}
                            </Badge>
                          )}
                          <Badge variant="outline">{product.category}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Reviews</CardTitle>
                <CardDescription>Latest customer feedback on your products</CardDescription>
              </CardHeader>
              <CardContent>
                {reviews.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No reviews yet. Customers will be able to review your products after purchase.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                      .slice(0, 10)
                      .map((review) => (
                        <div
                          key={review.id}
                          className="p-4 border rounded-lg space-y-2"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-medium">{review.userName}</p>
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-4 w-4 ${
                                        i < review.rating
                                          ? "fill-yellow-400 text-yellow-400"
                                          : "text-gray-300"
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {getProductName(review.productId)}
                              </p>
                              <p className="text-sm">{review.comment}</p>
                            </div>
                            <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}