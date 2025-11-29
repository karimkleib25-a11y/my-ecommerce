import { useState, useEffect } from "react";
import { Header } from "./Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Star, Edit, Trash2, MessageSquare } from "lucide-react";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";
import { Layout } from "./Layout";

interface Review {
  id: string;
  productId: string;
  productName: string;
  productImage?: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export function MyReviews() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    const loadReviews = () => {
      const allReviewsRaw = localStorage.getItem("reviews");
      if (allReviewsRaw) {
        const allReviews: Review[] = JSON.parse(allReviewsRaw);
        // Filter reviews by current user
        const userReviews = allReviews.filter((review) => review.userId === user?.id);
        setReviews(userReviews);
      }
    };

    loadReviews();

    // Listen for review updates
    const handleReviewUpdate = () => {
      loadReviews();
    };

    window.addEventListener("reviews-updated", handleReviewUpdate);

    return () => {
      window.removeEventListener("reviews-updated", handleReviewUpdate);
    };
  }, [user?.id]);

  const handleDelete = (reviewId: string) => {
    if (confirm("Are you sure you want to delete this review?")) {
      const allReviewsRaw = localStorage.getItem("reviews");
      if (allReviewsRaw) {
        const allReviews: Review[] = JSON.parse(allReviewsRaw);
        const filtered = allReviews.filter((r) => r.id !== reviewId);
        localStorage.setItem("reviews", JSON.stringify(filtered));
        setReviews(reviews.filter((r) => r.id !== reviewId));
        window.dispatchEvent(new Event("reviews-updated"));
        toast.success("Review deleted successfully");
      }
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <Layout>
      <div className="container px-4 md:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Reviews</h1>
          <p className="text-muted-foreground">
            Manage all your product reviews
          </p>
        </div>

        {reviews.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No reviews yet</h3>
              <p className="text-muted-foreground text-center">
                Purchase products and leave reviews to help other shoppers
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {reviews.map((review) => (
              <Card key={review.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      {review.productImage && (
                        <img
                          src={review.productImage}
                          alt={review.productName}
                          className="w-16 h-16 object-cover rounded"
                          onError={(e) => {
                            e.currentTarget.src = "https://dummyimage.com/600x600/cccccc/000000&text=No+Image";
                          }}
                        />
                      )}
                      <div>
                        <CardTitle className="text-lg">
                          {review.productName}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          {renderStars(review.rating)}
                          <span className="text-xs">
                            {new Date(review.date).toLocaleDateString()}
                          </span>
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(review.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {review.comment}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
