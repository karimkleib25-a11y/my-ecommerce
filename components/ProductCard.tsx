import React, { useState } from "react";
import { Heart, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useCart } from "../lib/cart";
import { useFavorites } from "../lib/favorites";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import type { Product } from "../types";
import { toast } from "sonner";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addItem } = useCart();
  const { toggle: toggleFavorite, isFavorite } = useFavorites();

  // Carousel state
  const images =
    (product.images?.length ? product.images : [product.image]).filter(Boolean) as string[];
  const [index, setIndex] = useState(0);
  const hasMultiple = images.length > 1;

  const goPrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIndex((prev) => (prev + 1) % images.length);
  };

  const originalPrice = product.price;
  const discount = product.discount || 0;
  const finalPrice =
    discount > 0 ? Number((originalPrice * (1 - discount / 100)).toFixed(2)) : originalPrice;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

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
      image: images[0] || "",
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
      {/* Carousel Section */}
      <div className="relative">
        <img
          key={index}
          src={images[index] || "https://via.placeholder.com/300"}
          alt={(product.name || product.title || "Product") + ` image ${index + 1}`}
          className="h-48 w-full object-cover"
          onError={(e) => {
            e.currentTarget.src = "https://via.placeholder.com/300";
          }}
        />

        {/* Discount Badge */}
        {discount > 0 && (
          <Badge className="absolute top-2 left-2 bg-red-600 text-white pointer-events-none">
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
              isFavorite(product.id) ? "fill-red-500 text-red-500" : "text-gray-600"
            }`}
          />
        </button>

        {/* Carousel Arrows */}
        {hasMultiple && (
          <>
            <button
              aria-label="Previous image"
              onClick={goPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/60"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              aria-label="Next image"
              onClick={goNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/60"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 w-1.5 rounded-full ${
                    i === index ? "bg-white" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4 flex-1 flex flex-col gap-2">
        <h3 className="font-semibold text-sm line-clamp-2">
          {product.name || product.title || "Product"}
        </h3>

        {product.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {product.description}
          </p>
        )}

        {product.category && (
          <Badge variant="outline" className="text-xs w-fit">
            {product.category}
          </Badge>
        )}

        {product.rating && product.rating > 0 && (
          <div className="flex items-center gap-1 text-xs">
            <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
            <span className="font-medium">{product.rating.toFixed(1)}</span>
            {product.reviewCount && product.reviewCount > 0 && (
              <span className="text-muted-foreground">({product.reviewCount})</span>
            )}
          </div>
        )}

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

        {product.inStock === false && (
          <p className="text-xs text-red-600 font-semibold">Out of Stock</p>
        )}

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

