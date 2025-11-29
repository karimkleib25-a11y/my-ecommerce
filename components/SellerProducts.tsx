import { useState, useEffect } from "react";
import { Layout } from "./Layout";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { useAuth } from "./AuthContext";
import { Link } from "react-router-dom";
import { Package, Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface SellerProduct {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  inStock: boolean;
  quantity: number;
}

export function SellerProducts() {
  const { user } = useAuth();
  const [products, setProducts] = useState<SellerProduct[]>([]);

  useEffect(() => {
    const loadProducts = () => {
      const saved = localStorage.getItem("seller_products");
      if (saved) {
        const allProducts = JSON.parse(saved);
        const myProducts = allProducts.filter((p: any) => p.storeId === user?.storeId);
        setProducts(myProducts);
      }
    };
    loadProducts();
  }, [user?.storeId]);

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      const saved = localStorage.getItem("seller_products");
      if (saved) {
        const allProducts = JSON.parse(saved);
        const filtered = allProducts.filter((p: any) => p.id !== id);
        localStorage.setItem("seller_products", JSON.stringify(filtered));
        setProducts(products.filter(p => p.id !== id));
        
        // Trigger event to update StorePage
        window.dispatchEvent(new Event("products-updated"));
        
        toast.success("Product deleted successfully");
      }
    }
  };

  return (
    <Layout>
      <div className="container px-4 md:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Products</h1>
            <p className="text-muted-foreground">Manage your product inventory</p>
          </div>
          <Link to="/seller/add-product">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </Link>
        </div>

        {products.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Package className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No products yet</h3>
              <p className="text-muted-foreground mb-4">Start by adding your first product</p>
              <Link to="/seller/add-product">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Product
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {products.map((product) => (
              <Card key={product.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-20 h-20 object-cover rounded"
                        onError={(e) => {
                          e.currentTarget.src = "https://dummyimage.com/600x600/cccccc/000000&text=No+Image";
                        }}
                      />
                      <div>
                        <CardTitle className="text-xl">{product.name}</CardTitle>
                        <CardDescription className="mt-1">
                          <Badge variant="outline">{product.category}</Badge>
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold">${product.price.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">
                        Stock: {product.quantity}
                      </p>
                    </div>
                    <Badge variant={product.inStock ? "default" : "secondary"}>
                      {product.inStock ? "In Stock" : "Out of Stock"}
                    </Badge>
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