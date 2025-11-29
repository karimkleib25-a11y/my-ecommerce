import type { Product } from "../types";
import { products as mockProducts } from "./mockData";
import { getReviewsByProduct } from "./reviews";

const STORAGE_KEY = "seller_products";

export function getSellerProducts(): Product[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function getProductsByStore(storeId?: string): Product[] {
  if (!storeId) return [];
  return getSellerProducts().filter(p => p.storeId === storeId);
}

export function getAllProducts(): Product[] {
  const sellerProducts = getSellerProducts();
  const allProducts = [...mockProducts, ...sellerProducts];
  
  // Add review stats to each product
  return allProducts.map(product => enrichProductWithReviews(product));
}

export function getProductById(id: string): Product | undefined {
  const product = getAllProducts().find(p => p.id === id);
  return product ? enrichProductWithReviews(product) : undefined;
}

function enrichProductWithReviews(product: Product): Product {
  const reviews = getReviewsByProduct(product.id);
  
  if (reviews.length === 0) {
    return {
      ...product,
      rating: product.rating || 0,
      reviewCount: product.reviewCount || 0,
    };
  }
  
  const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
  const avgRating = totalRating / reviews.length;
  
  return {
    ...product,
    rating: Number(avgRating.toFixed(1)),
    reviewCount: reviews.length,
  };
}

export function saveSellerProduct(p: Product) {
  const list = getSellerProducts();
  list.push(p);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  window.dispatchEvent(new Event("products-updated"));
}

export function deleteSellerProduct(id: string) {
  const list = getSellerProducts().filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  window.dispatchEvent(new Event("products-updated"));
}

export function deleteProductsByStore(storeId: string) {
  const list = getSellerProducts().filter(p => p.storeId !== storeId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  window.dispatchEvent(new Event("products-updated"));
}