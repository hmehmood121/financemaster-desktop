"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, Timestamp, collection, getDocs } from "firebase/firestore"
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  Link2,
  Send,
  MoreVertical,
  ChevronUp,
  ChevronDown,
} from "lucide-react"

import { db } from "@/lib/firebase"
import { useAuth } from "@/components/providers/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"

export default function ReelPage({ params }) {
  const { user } = useAuth()
  const router = useRouter()
  const [reel, setReel] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [isCommentsOpen, setIsCommentsOpen] = React.useState(false)
  const [hasLiked, setHasLiked] = React.useState(false)
  const [newComment, setNewComment] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [editingComment, setEditingComment] = React.useState(null)
  const [editedText, setEditedText] = React.useState("")
  const [allReels, setAllReels] = React.useState([])
  const [currentIndex, setCurrentIndex] = React.useState(0)

  // Fetch all public reels
  React.useEffect(() => {
    async function fetchAllReels() {
      try {
        const querySnapshot = await getDocs(collection(db, "reels"))
        const fetchedReels = querySnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((reel) => reel.status === "Public")
        setAllReels(fetchedReels)
        // Find current reel index
        const index = fetchedReels.findIndex((reel) => reel.id === params.id)
        setCurrentIndex(index)
      } catch (error) {
        console.error("Error fetching reels:", error)
      }
    }

    fetchAllReels()
  }, [params.id])

  React.useEffect(() => {
    async function fetchReel() {
      try {
        const docRef = doc(db, "reels", params.id)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          const data = docSnap.data()
          const reelData = {
            id: docSnap.id,
            ...data,
            likes: Array.isArray(data.likes) ? data.likes : [],
            comments: Array.isArray(data.comments) ? data.comments : [],
          }
          setReel(reelData)
          setHasLiked(Array.isArray(data.likes) && data.likes.includes(user?.uid))
        }
      } catch (error) {
        console.error("Error fetching reel:", error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchReel()
    }
  }, [params.id, user])

  const navigateToReel = (direction) => {
    const newIndex =
      direction === "next"
        ? (currentIndex + 1) % allReels.length
        : (currentIndex - 1 + allReels.length) % allReels.length

    const nextReel = allReels[newIndex]
    if (nextReel) {
      router.push(`/dashboard/reels/${nextReel.id}`)
    }
  }

  const handleKeyNavigation = React.useCallback(
    (e) => {
      if (e.key === "ArrowUp") {
        e.preventDefault()
        navigateToReel("prev")
      } else if (e.key === "ArrowDown") {
        e.preventDefault()
        navigateToReel("next")
      }
    },
    [navigateToReel],
  )

  React.useEffect(() => {
    window.addEventListener("keydown", handleKeyNavigation)
    return () => window.removeEventListener("keydown", handleKeyNavigation)
  }, [handleKeyNavigation])

  const handleLike = async () => {
    if (!user) return

    try {
      const reelRef = doc(db, "reels", params.id)
      if (hasLiked) {
        await updateDoc(reelRef, {
          likes: arrayRemove(user.uid),
        })
        setReel((prev) => ({
          ...prev,
          likes: prev.likes.filter((id) => id !== user.uid),
        }))
      } else {
        await updateDoc(reelRef, {
          likes: arrayUnion(user.uid),
        })
        setReel((prev) => ({
          ...prev,
          likes: [...prev.likes, user.uid],
        }))
      }
      setHasLiked(!hasLiked)
    } catch (error) {
      console.error("Error updating like:", error)
      toast.error("Failed to update like")
    }
  }

  const handleComment = async (e) => {
    e.preventDefault()
    if (!user || !newComment.trim()) return

    setIsSubmitting(true)
    try {
      const reelRef = doc(db, "reels", params.id)
      const newCommentObj = {
        id: crypto.randomUUID(),
        text: newComment.trim(),
        userId: user.uid,
        userName: user.displayName,
        userPhoto: user.photoURL,
        timestamp: Timestamp.now().toDate().toISOString(),
      }

      await updateDoc(reelRef, {
        comments: arrayUnion(newCommentObj),
      })

      setReel((prev) => ({
        ...prev,
        comments: [...prev.comments, newCommentObj],
      }))
      setNewComment("")
      toast.success("Comment added successfully")
    } catch (error) {
      console.error("Error adding comment:", error)
      toast.error("Failed to add comment")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditComment = async (e) => {
    e.preventDefault()
    if (!editedText.trim()) return

    try {
      const updatedComments = reel.comments.map((comment) =>
        comment.id === editingComment.id ? { ...comment, text: editedText.trim() } : comment,
      )

      await updateDoc(doc(db, "reels", params.id), {
        comments: updatedComments,
      })

      setReel((prev) => ({
        ...prev,
        comments: updatedComments,
      }))
      setEditingComment(null)
      setEditedText("")
      toast.success("Comment updated successfully")
    } catch (error) {
      console.error("Error updating comment:", error)
      toast.error("Failed to update comment")
    }
  }

  const handleDeleteComment = async (commentId) => {
    try {
      const updatedComments = reel.comments.filter((comment) => comment.id !== commentId)

      await updateDoc(doc(db, "reels", params.id), {
        comments: updatedComments,
      })

      setReel((prev) => ({
        ...prev,
        comments: updatedComments,
      }))
      toast.success("Comment deleted successfully")
    } catch (error) {
      console.error("Error deleting comment:", error)
      toast.error("Failed to delete comment")
    }
  }

  const handleShare = (platform) => {
    const url = window.location.href
    const text = reel?.caption || "Check out this reel!"

    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter: `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
    }

    if (platform === "copy") {
      navigator.clipboard.writeText(url)
      toast.success("Link copied to clipboard!")
      return
    }

    window.open(shareUrls[platform], "_blank")
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!reel) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Reel not found</h1>
          <Button onClick={() => router.push("/dashboard/reels")} className="mt-4">
            Back to Reels
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black relative">
      {/* Navigation Buttons */}
      <div className="fixed right-8 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-4">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20"
          onClick={() => navigateToReel("prev")}
          disabled={currentIndex === 0}
        >
          <ChevronUp color="#ffffff" className="h-6 w-6" />
          <span className="sr-only">Previous reel</span>
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20"
          onClick={() => navigateToReel("next")}
          disabled={currentIndex === allReels.length - 1}
        >
          <ChevronDown color="#ffffff" className="h-6 w-6" />
          <span className="sr-only">Next reel</span>
        </Button>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Button variant="ghost" className="group mb-4 text-white" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back
        </Button>

        <div className="grid gap-6 md:grid-cols-[1fr_400px]">
          {/* Video Section */}
          <div className="relative aspect-[9/16] md:aspect-video">
            <video src={reel.videoURL} className="h-full w-full rounded-lg object-contain" controls autoPlay loop />
          </div>

          {/* Info Section */}
          <div className="space-y-6 text-white">
            <div className="flex items-start gap-4">
              {/* <div className="relative h-12 w-12 flex-shrink-0">
                <Image
                  src={reel.userPhoto || "/placeholder.svg"}
                  alt={reel.userName}
                  fill
                  className="rounded-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h2 className="font-semibold">{reel.userName}</h2>
                <p className="text-sm text-gray-400">{new Date(reel.timestamp).toLocaleDateString()}</p>
              </div> */}
            </div>

            <p className="text-lg">{reel.caption}</p>

            <div className="flex items-center gap-6">
              <button onClick={handleLike} className="flex items-center gap-2">
                <Heart
                  className={`h-6 w-6 transition-colors ${hasLiked ? "fill-red-500 text-red-500" : "text-white"}`}
                />
                <span>{reel.likes.length}</span>
              </button>

              <button onClick={() => setIsCommentsOpen(true)} className="flex items-center gap-2">
                <MessageCircle className="h-6 w-6" />
                <span>{reel.comments.length}</span>
              </button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2">
                    <Share2 className="h-6 w-6" />
                    <span>Share</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleShare("facebook")}>
                    <Facebook className="mr-2 h-4 w-4" />
                    Facebook
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShare("twitter")}>
                    <Twitter className="mr-2 h-4 w-4" />
                    Twitter
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShare("linkedin")}>
                    <Linkedin className="mr-2 h-4 w-4" />
                    LinkedIn
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShare("copy")}>
                    <Link2 className="mr-2 h-4 w-4" />
                    Copy link
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isCommentsOpen} onOpenChange={setIsCommentsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Comments</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-4">
              {reel.comments.map((comment) => (
                <div key={comment.id} className="flex gap-4">
                  <div className="relative h-8 w-8 flex-shrink-0">
                    <Image
                      src={comment.userPhoto || "/placeholder.svg"}
                      alt={comment.userName}
                      fill
                      className="rounded-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{comment.userName}</p>
                      <span className="text-xs text-muted-foreground">
                        {new Date(comment.timestamp).toLocaleDateString()}
                      </span>
                      {comment.userId === user?.uid && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 ml-auto">
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">More options</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setEditingComment(comment)
                                setEditedText(comment.text)
                              }}
                            >
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteComment(comment.id)}>
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                    {editingComment?.id === comment.id ? (
                      <form onSubmit={handleEditComment} className="mt-2 flex gap-2">
                        <Input value={editedText} onChange={(e) => setEditedText(e.target.value)} className="flex-1" />
                        <Button type="submit" size="sm">
                          Save
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingComment(null)
                            setEditedText("")
                          }}
                        >
                          Cancel
                        </Button>
                      </form>
                    ) : (
                      <p className="text-sm">{comment.text}</p>
                    )}
                  </div>
                </div>
              ))}
              {reel.comments.length === 0 && <p className="text-center text-muted-foreground">No comments yet</p>}
            </div>
          </ScrollArea>
          <form onSubmit={handleComment} className="flex gap-2 mt-4">
            <Input
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={isSubmitting}
            />
            <Button type="submit" size="icon" disabled={isSubmitting || !newComment.trim()}>
              <Send className="h-4 w-4" />
              <span className="sr-only">Send comment</span>
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

