import type { ProductReview } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Star } from "lucide-react"

interface ProductReviewsProps {
  reviews: ProductReview[]
}

export default function ProductReviews({ reviews }: ProductReviewsProps) {
  if (!reviews || reviews.length === 0) {
    return <p className="text-sm text-muted-foreground">No reviews yet.</p>
  }

  return (
    <div className="space-y-6">
      {reviews.map((review, index) => (
        <Card key={index}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  {/* Placeholder for reviewer image if available */}
                  <AvatarFallback>{review.reviewerName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-base">{review.reviewerName}</CardTitle>
                  <p className="text-xs text-muted-foreground">{new Date(review.date).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                  />
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 leading-relaxed">{review.comment}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
