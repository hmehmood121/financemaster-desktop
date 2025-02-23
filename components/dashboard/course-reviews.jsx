"use client"

import * as React from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { collection, query, where, getDocs, addDoc, updateDoc, doc } from "firebase/firestore"
import { Star } from "lucide-react"

import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import Image from "next/image"

export function CourseReviews({ courseId }) {
  const { user } = useAuth()
  const [reviews, setReviews] = React.useState([])
  const [userReview, setUserReview] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [isReviewOpen, setIsReviewOpen] = React.useState(false)
  const [rating, setRating] = React.useState(0)
  const [comment, setComment] = React.useState("")
  const [averageRating, setAverageRating] = React.useState(0)
  const [ratingCounts, setRatingCounts] = React.useState([
    { rate: 5, totalNumber: 0 },
    { rate: 4, totalNumber: 0 },
    { rate: 3, totalNumber: 0 },
    { rate: 2, totalNumber: 0 },
    { rate: 1, totalNumber: 0 },
  ])

  React.useEffect(() => {
    fetchReviews()
  }, [courseId])

  async function fetchReviews() {
    try {
      const q = query(collection(db, "reviews"), where("courseId", "==", courseId))
      const snapshot = await getDocs(q)
      const reviewsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))

      setReviews(reviewsData)

      // Find user's review if it exists
      const userReview = reviewsData.find((review) => review.userId === user?.uid)
      if (userReview) {
        setUserReview(userReview)
        setRating(userReview.rating)
        setComment(userReview.comment)
      }

      // Calculate average rating and counts
      if (reviewsData.length > 0) {
        const totalRating = reviewsData.reduce((acc, review) => acc + review.rating, 0)
        setAverageRating((totalRating / reviewsData.length).toFixed(1))

        const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        reviewsData.forEach((review) => {
          counts[review.rating] = (counts[review.rating] || 0) + 1
        })

        setRatingCounts([
          { rate: 5, totalNumber: counts[5] },
          { rate: 4, totalNumber: counts[4] },
          { rate: 3, totalNumber: counts[3] },
          { rate: 2, totalNumber: counts[2] },
          { rate: 1, totalNumber: counts[1] },
        ])
      }
    } catch (error) {
      console.error("Error fetching reviews:", error)
      toast.error("Failed to load reviews")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitReview = async () => {
    if (!rating) {
      toast.error("Please select a rating")
      return
    }

    try {
      if (userReview) {
        // Update existing review
        await updateDoc(doc(db, "reviews", userReview.id), {
          rating,
          comment,
          updatedAt: new Date().toISOString(),
        })
        toast.success("Review updated successfully")
      } else {
        // Add new review
        await addDoc(collection(db, "reviews"), {
          courseId,
          userId: user.uid,
          userName: user.displayName,
          userPhoto: user.photoURL,
          rating,
          comment,
          createdAt: new Date().toISOString(),
        })
        toast.success("Review submitted successfully")
      }

      setIsReviewOpen(false)
      fetchReviews()
    } catch (error) {
      console.error("Error submitting review:", error)
      toast.error("Failed to submit review")
    }
  }

  const renderRatingBar = (rate, totalNumber) => {
    const percentage = reviews.length > 0 ? (totalNumber / reviews.length) * 100 : 0

    return (
      <div className="flex items-center gap-2">
        <span className="w-12 text-sm">{rate} stars</span>
        <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary" style={{ width: `${percentage}%` }} />
        </div>
        <span className="w-12 text-sm text-right">{totalNumber}</span>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader className="space-y-6">
        <CardTitle>Course Reviews</CardTitle>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-4xl font-bold">{averageRating}</span>
            <div className="flex flex-col">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= Math.floor(averageRating) ? "fill-primary text-primary" : "fill-muted text-muted"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">{reviews.length} reviews</span>
            </div>
          </div>
          <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
            <DialogTrigger asChild>
              <Button>{userReview ? "Edit Review" : "Write a Review"}</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{userReview ? "Edit Your Review" : "Write a Review"}</DialogTitle>
                <DialogDescription>Share your experience with this course</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} type="button" onClick={() => setRating(star)} className="focus:outline-none">
                      <Star
                        className={`h-8 w-8 ${star <= rating ? "fill-primary text-primary" : "fill-muted text-muted"}`}
                      />
                    </button>
                  ))}
                </div>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Write your review here..."
                  className="min-h-[100px]"
                />
                <Button onClick={handleSubmitReview} className="w-full">
                  {userReview ? "Update Review" : "Submit Review"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <div className="space-y-2">
          {ratingCounts.map(({ rate, totalNumber }) => (
            <div key={rate}>{renderRatingBar(rate, totalNumber)}</div>
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="space-y-2">
            <div className="flex items-center gap-2">
              {review.userDisplayPhoto && (
                <Image
                  src={review.userDisplayPhoto || "/placeholder.svg"}
                  alt={review.userDisplayName }
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              )}
              <div>
                <p className="font-medium">{review.userDisplayName}</p>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= review.rating ? "fill-primary text-primary" : "fill-muted text-muted"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
            {review.review && <p className="text-muted-foreground">{review.review}</p>}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

