import React, { useState } from "react";
import { Heart, ShoppingCart, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { useCart } from "../lib/cart";
import { useFavorites } from "../lib/favorites";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import type { Product } from "../types";
import { toast } from "sonner";
import { cn } from "./ui/utils";
import { Link } from "react-router-dom";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addItem } = useCart();
  const { toggle: toggleFavorite, isFavorite } = useFavorites();

  const originalPrice = product.price;
  const discount = product.discount || 0;
  const finalPrice =
    discount > 0 ? Number((originalPrice * (1 - discount / 100)).toFixed(2)) : originalPrice;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // CHECK IF USER IS LOGGED IN
    if (!user) {
      toast.error("Please login to add items to cart");
      navigate("/auth");
      return;
    }

    if (product.inStock === false) {
      toast.error("Product is out of stock");
      return;
    }

    addItem({
      id: product.id,
      title: product.name || product.title || "Product",
      price: finalPrice,
      originalPrice,
      discount,
      image: product.image || (product.images && product.images[0]) || "",
    });

    toast.success("Added to cart");
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error("Login to favorite products");
      navigate("/auth");
      return;
    }

    toggleFavorite(product.id);
  };

  return (
    <div
      data-testid="product-card"
      className="group border rounded-lg overflow-hidden bg-card hover:shadow-lg transition flex flex-col h-full"
    >
      {/* Image Section */}
      <div className="relative">
        <img
          src={
            product.image ||
            (product.images && product.images[0]) ||
            "https://via.placeholder.com/300"
          }
          alt={product.name || product.title || "Product"}
          className="h-48 w-full object-cover"
          onError={(e) => {
            e.currentTarget.src = "https://via.placeholder.com/300";
          }}
        />

        {/* Discount Badge */}
        {discount > 0 && (
          <Badge className="absolute top-2 left-2 bg-red-600 text-white">
            -{discount}%
          </Badge>
        )}

        {/* Favorite Button */}
        <button
          onClick={handleFavorite}
          aria-label="Toggle favorite"
          className="absolute top-2 right-2 p-2 rounded-full bg-white/80 backdrop-blur hover:bg-white transition"
        >
          <Heart
            className={`h-4 w-4 ${
              isFavorite(product.id)
                ? "fill-red-500 text-red-500"
                : "text-gray-600"
            }`}
          />
        </button>
      </div>

      {/* Content Section */}
      <div className="p-4 flex-1 flex flex-col gap-2">
        {/* Title */}
        <h3 className="font-semibold text-sm line-clamp-2">
          {product.name || product.title || "Product"}
        </h3>

        {/* Description */}
        {product.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Category */}
        {product.category && (
          <Badge variant="outline" className="text-xs w-fit">
            {product.category}
          </Badge>
        )}

        {/* Rating */}
        {product.rating && product.rating > 0 && (
          <div className="flex items-center gap-1 text-xs">
            <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
            <span className="font-medium">{product.rating.toFixed(1)}</span>
            {product.reviewCount && product.reviewCount > 0 && (
              <span className="text-muted-foreground">
                ({product.reviewCount})
              </span>
            )}
          </div>
        )}

        {/* Price Section */}
        <div className="flex items-center gap-2 mt-auto">
          <span data-testid="final-price" className="text-xl font-bold text-primary">
            ${finalPrice.toFixed(2)}
          </span>
          {discount > 0 && (
            <span
              data-testid="original-price"
              className="text-sm text-muted-foreground line-through"
            >
              ${originalPrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Stock Status */}
        {product.inStock === false && (
          <p className="text-xs text-red-600 font-semibold">
            Out of Stock
          </p>
        )}

        {/* Add to Cart Button */}
        <Button
          onClick={handleAddToCart}
          data-testid="add-to-cart-btn"
          className="w-full mt-2"
          variant="default"
          disabled={product.inStock === false}
        >
          Add to Cart
        </Button>
      </div>
    </div>
  );
}

