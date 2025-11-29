import { useState, useEffect } from "react";
import { Layout } from "./Layout";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";
import { Trash2, Search, ShieldCheck } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { AdminOrderManagement } from "./AdminOrderManagement";

export function AdminDashboard() {
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadProducts();

    const handleUpdate = () => {
      loadProducts();
    };

    window.addEventListener("products-updated", handleUpdate);
    return () => {
      window.removeEventListener("products-updated", handleUpdate);
    };
  }, []);

  const loadProducts = () => {
    const sellerProducts = JSON.parse(localStorage.getItem("seller_products") || "[]");
    setProducts(sellerProducts);
  };

  const handleDeleteProduct = (productId: string) => {
    const updatedProducts = products.filter((p) => p.id !== productId);
    localStorage.setItem("seller_products", JSON.stringify(updatedProducts));
    setProducts(updatedProducts);
    window.dispatchEvent(new Event("products-updated"));
    toast.success("Product deleted successfully");
  };

  const filteredProducts = products.filter((p) =>
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.storeName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (user?.role !== "admin") {
    return (
      <Layout>
        <div className="container px-4 md:px-6 py-8">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <ShieldCheck className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
              <p className="text-muted-foreground">
                You don't have permission to access this page
              </p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container px-4 md:px-6 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          </div>
          <p className="text-muted-foreground">
            Manage all products across the platform
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products or stores..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{products.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Stores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(products.map(p => p.storeId)).size}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Filtered Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredProducts.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="products" className="w-full">
          <TabsList>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            {/* Products List */}
            {filteredProducts.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <p className="text-muted-foreground">No products found</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredProducts.map((product) => (
                  <Card key={product.id}>
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        {product.image && (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-20 h-20 object-cover rounded"
                            onError={(e) => {
                              e.currentTarget.src = "https://via.placeholder.com/80";
                            }}
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-lg">{product.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                Store: {product.storeName || "Unknown"}
                              </p>
                              <div className="flex gap-2 mt-2">
                                <Badge variant="secondary">{product.category}</Badge>
                                <Badge variant="outline">${product.price.toFixed(2)}</Badge>
                                {product.discount > 0 && (
                                  <Badge className="bg-red-500">-{product.discount}%</Badge>
                                )}
                              </div>
                            </div>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="icon">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Product</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{product.name}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteProduct(product.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                            {product.description}
                          </p>
                          <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                            <span>Stock: {product.quantity || 0}</span>
                            <span>ID: {product.id}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="orders">
            <AdminOrderManagement />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}