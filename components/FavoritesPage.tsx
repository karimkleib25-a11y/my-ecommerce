import { useState, useEffect } from "react";
import { Layout } from "./Layout";
import { ProductCard } from "./ProductCard";
import { useFavorites } from "../lib/favorites";
import { products as mockProducts } from "../lib/mockData";
import type { Product } from "../types";
import { Heart } from "lucide-react";

export function FavoritesPage() {
  const { ids } = useFavorites();
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  useEffect(() => {
    // Load both mock and seller products
    const loadProducts = () => {
      const sellerProductsRaw = localStorage.getItem("seller_products");
      const sellerProducts: Product[] = sellerProductsRaw 
        ? JSON.parse(sellerProductsRaw) 
        : [];
      
      // Combine mock and seller products
      const combined = [...mockProducts, ...sellerProducts];
      setAllProducts(combined);
    };

    loadProducts();

    // Listen for product updates
    const handleProductUpdate = () => {
      loadProducts();
    };

    window.addEventListener("products-updated", handleProductUpdate);

    return () => {
      window.removeEventListener("products-updated", handleProductUpdate);
    };
  }, []);

  // Filter products by favorite IDs
  const favoriteProducts = allProducts.filter((p) => ids.includes(p.id));

  return (
    <Layout>
      <div className="container px-4 md:px-6 py-8">
        <h1 className="text-3xl font-bold mb-8">My Favorites</h1>
        {favoriteProducts.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-lg">No favorites yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Start adding products to your favorites!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {favoriteProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}