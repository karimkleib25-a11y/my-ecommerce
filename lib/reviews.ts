export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  orderId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

const STORAGE_KEY = "reviews";

export function getReviews(): Review[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function getReviewsByProduct(productId: string): Review[] {
  return getReviews().filter(r => r.productId === productId);
}

export function getReviewsByUser(userId: string): Review[] {
  return getReviews().filter(r => r.userId === userId);
}

export function hasUserReviewedProduct(userId: string, productId: string, orderId: string): boolean {
  return getReviews().some(
    r => r.userId === userId && r.productId === productId && r.orderId === orderId
  );
}

export function addReview(review: Review) {
  const reviews = getReviews();
  reviews.push(review);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
  window.dispatchEvent(new Event("reviews-updated"));
}

export function deleteReview(reviewId: string) {
  const reviews = getReviews().filter(r => r.id !== reviewId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
  window.dispatchEvent(new Event("reviews-updated"));
}