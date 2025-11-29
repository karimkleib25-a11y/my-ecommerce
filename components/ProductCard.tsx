import React, { useState } from "react";
import { Heart, ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react";
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
  const { user } = useAuth();
  const { addItem } = useCart();
  const { ids, toggle } = useFavorites();
  const navigate = useNavigate();
  const isFav = ids.includes(product.id);

  // Get all images for the product
  const images =
    product.images && product.images.length > 0
      ? product.images
      : product.image
      ? [product.image]
      : ["https://via.placeholder.com/400x400?text=No+Image"];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const hasMultipleImages = images.length > 1;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // CHECK IF USER IS LOGGED IN
    if (!user) {
      toast.error("Please login to add items to cart");
      navigate("/auth");
      return;
    }

    if (!product.inStock) {
      toast.error("Product is out of stock");
      return;
    }

    // Calculate discounted price
    const originalPrice = product.price;
    const discount = product.discount || 0;
    const finalPrice =
      discount > 0 ? Number((originalPrice * (1 - discount / 100)).toFixed(2)) : originalPrice;

    addItem({
      id: product.id,
      title: product.name || product.title || "Product",
      price: finalPrice,
      originalPrice,
      discount,
      image: product.image || (product.images && product.images[0]),
    });

    toast.success(`${product.name || product.title} added to cart!`);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error("Please login to add favorites");
      navigate("/auth");
      return;
    }

    toggle(product.id);
    toast.success(isFav ? "Removed from favorites" : "Added to favorites");
  };

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div>
        <CardHeader className="p-0 relative group">
          <div className="relative aspect-square overflow-hidden bg-muted">
            <img
              src={images[currentImageIndex]}
              alt={product.name || product.title}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
              onError={(e) => {
                e.currentTarget.src = "https://via.placeholder.com/400x400?text=No+Image";
              }}
            />

            {/* Previous/Next Buttons */}
            {hasMultipleImages && (
              <>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 rounded-full"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 rounded-full"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}

            {/* Favorite Button */}
            <Button
              variant="secondary"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 rounded-full"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleToggleFavorite(e);
              }}
            >
              <Heart
                className={cn(
                  "h-4 w-4",
                  isFav && user && "fill-red-500 text-red-500"
                )}
              />
            </Button>

            {/* Discount Badge */}
            {product.discount && product.discount > 0 && (
              <Badge className="absolute top-2 left-2 bg-red-500">
                -{product.discount}%
              </Badge>
            )}

            {/* Image Indicators */}
            {hasMultipleImages && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      goToImage(index);
                    }}
                    className={cn(
                      "h-1.5 rounded-full transition-all",
                      index === currentImageIndex
                        ? "w-6 bg-white"
                        : "w-1.5 bg-white/50 hover:bg-white/75"
                    )}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </CardHeader>
      </div>

      <CardContent className="p-4 flex flex-col">
        <Link to={`/product/${product.id}`}>
          <CardTitle className="text-lg sm:text-xl line-clamp-1 hover:underline">
            {product.name || product.title}
          </CardTitle>
        </Link>

        {/* Fixed-height description area */}
        <div
          className="
            mt-1
            text-xs sm:text-sm md:text-base
            leading-snug
            break-words
            whitespace-pre-line
            overflow-hidden
            line-clamp-3
            h-14 sm:h-16
          "
        >
          <CardDescription className="m-0">
            {product.description || "No description available."}
          </CardDescription>
        </div>

        {/* Spacer pushes price block down uniformly */}
        <div className="mt-3 flex items-baseline gap-2">
          {product.discount && product.discount > 0 ? (
            <>
              <span className="text-2xl font-bold text-primary">
                ${(product.price * (1 - product.discount / 100)).toFixed(2)}
              </span>
              <span className="text-sm text-muted-foreground line-through">
                ${product.price.toFixed(2)}
              </span>
            </>
          ) : (
            <span className="text-2xl font-bold text-primary">
              ${product.price.toFixed(2)}
            </span>
          )}
        </div>

        {/* Rating section - should already be there */}
        {product.rating && product.rating > 0 && (
          <div className="mt-2 flex items-center gap-1">
            <span className="text-yellow-500">★</span>
            <span className="text-sm font-medium">{product.rating.toFixed(1)}</span>
            {product.reviewCount && product.reviewCount > 0 && (
              <span className="text-sm text-muted-foreground">
                ({product.reviewCount} {product.reviewCount === 1 ? "review" : "reviews"})
              </span>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full gap-2"
          onClick={(e) => {
            e.preventDefault();
            handleAddToCart(e);
          }}
          disabled={!product.inStock}
        >
          <ShoppingCart className="h-4 w-4" />
          {product.inStock ? "Add to Cart" : "Out of Stock"}
        </Button>
      </CardFooter>
    </Card>
  );
}

