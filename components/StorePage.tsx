import { useState, useEffect } from "react";
import { Layout } from "./Layout";
import { ProductCard } from "./ProductCard";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";
import { Switch } from "./ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { ChevronDown, ChevronUp, SlidersHorizontal, X } from "lucide-react";

import type { Product } from "../types";
import { getAllProducts } from "../lib/products";

export function StorePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  
  // Filter states
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [showDiscounted, setShowDiscounted] = useState(false);
  const [maxPrice, setMaxPrice] = useState(500);
  const [showFilters, setShowFilters] = useState(true);

  useEffect(() => {
    const loadProducts = () => {
      const combined = getAllProducts(); // Now includes review stats
    
      const prices = combined.map(p => p.price);
      const calculatedMaxPrice = Math.ceil(Math.max(...prices, 500));
      setMaxPrice(calculatedMaxPrice);
      setPriceRange([0, calculatedMaxPrice]);
      
      setAllProducts(combined);
    };

    loadProducts();

    const handleUpdate = () => {
      loadProducts();
    };

    // Listen to both product and review updates
    window.addEventListener("products-updated", handleUpdate);
    window.addEventListener("reviews-updated", handleUpdate);

    return () => {
      window.removeEventListener("products-updated", handleUpdate);
      window.removeEventListener("reviews-updated", handleUpdate);
    };
  }, []); // This should re-run when component mounts (after login)

  const categories = Array.from(
    new Set(allProducts.map((p) => p.category))
  ).sort();

  const filtered = allProducts.filter((p) => {
    const matchesSearch =
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || p.category === selectedCategory;
    const matchesPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
    const matchesDiscount = !showDiscounted || (p.discount && p.discount > 0);
    
    return matchesSearch && matchesCategory && matchesPrice && matchesDiscount;
  });

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setPriceRange([0, maxPrice]);
    setShowDiscounted(false);
  };

  const activeFiltersCount = 
    (selectedCategory !== "all" ? 1 : 0) +
    (priceRange[0] !== 0 || priceRange[1] !== maxPrice ? 1 : 0) +
    (showDiscounted ? 1 : 0);

  return (
    <Layout>
      <div className="container px-4 md:px-6 py-8">
        {/* Single sticky bar: toggle + search + filters */}
        <div className="sticky top-16 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b">
          <div className="py-3 space-y-3">
            {/* Toggle button */}
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => setShowFilters((v) => !v)}
                className="gap-2"
              >
                <SlidersHorizontal className="h-4 w-4" />
                {showFilters ? "Hide Filters" : "Show Filters"}
                {showFilters ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Search */}
            <div className="flex items-center gap-2">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="flex-1"
              />
              {searchQuery && (
                <Button variant="ghost" onClick={() => setSearchQuery("")}>
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>

            {/* Filters (shown when toggled on) */}
            {showFilters && (
              <div className="flex flex-wrap gap-3">
                {/* Price Filter */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <SlidersHorizontal className="h-4 w-4" />
                      Price: ${priceRange[0]} - ${priceRange[1]}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Price Range</Label>
                        <Slider
                          min={0}
                          max={maxPrice}
                          step={10}
                          value={priceRange}
                          onValueChange={(value) =>
                            setPriceRange(value as [number, number])
                          }
                          className="w-full"
                        />
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>${priceRange[0]}</span>
                          <span>${priceRange[1]}</span>
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Discount Filter */}
                <div className="flex items-center gap-2 px-3 py-2 border rounded-md">
                  <Switch
                    id="discount-filter"
                    checked={showDiscounted}
                    onCheckedChange={setShowDiscounted}
                  />
                  <Label htmlFor="discount-filter" className="cursor-pointer">
                    Discounted Only
                  </Label>
                </div>

                {/* Category Filter */}
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Reset Filters */}
                {activeFiltersCount > 0 && (
                  <Button variant="ghost" onClick={resetFilters} className="gap-2">
                    <X className="h-4 w-4" />
                    Clear Filters ({activeFiltersCount})
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Products grid/list */}
        <div className="pt-2">
          <div className="text-sm text-muted-foreground">
            Showing {filtered.length} of {allProducts.length} products
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">No products found</p>
              <p className="text-sm text-muted-foreground mt-2">
                Try adjusting your search or filters
              </p>
              <Button onClick={resetFilters} variant="outline" className="mt-4">
                Reset Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
