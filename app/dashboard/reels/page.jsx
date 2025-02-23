"use client"

import * as React from "react"
import { collection, getDocs } from "firebase/firestore"
import { ChevronUp, ChevronDown } from "lucide-react"

import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function ReelsPage() {
  const [reels, setReels] = React.useState([])
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const videoRef = React.useRef(null)

  React.useEffect(() => {
    async function fetchReels() {
      const querySnapshot = await getDocs(collection(db, "reels"))
      const fetchedReels = []

      querySnapshot.forEach((doc) => {
        fetchedReels.push({ id: doc.id, ...doc.data() })
      })

      setReels(fetchedReels)
    }

    fetchReels()
  }, [])

  const handleNext = () => {
    if (currentIndex < reels.length - 1) {
      setCurrentIndex((prev) => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1)
    }
  }

  return (
    <div className="flex h-[calc(100vh-2rem)] items-center justify-center">
      <div className="relative mx-auto aspect-[9/16] h-full max-h-[85vh]">
      {reels
  .filter((reel) => reel.status === "Public") // Filter only public reels
  .length > 0 && (
    <>
      <video
        ref={videoRef}
        src={reels.filter((reel) => reel.status === "Public")[currentIndex].videoURL}
        className="h-full w-full rounded-xl object-cover"
        controls
        autoPlay
        loop
      />
      <div className="absolute right-4 top-1/2 flex -translate-y-1/2 flex-col gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className={cn(
            "h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm",
            currentIndex === 0 && "opacity-50"
          )}
        >
          <ChevronUp className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleNext}
          disabled={currentIndex === reels.filter((reel) => reel.status === "Public").length - 1}
          className={cn(
            "h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm",
            currentIndex === reels.filter((reel) => reel.status === "Public").length - 1 &&
              "opacity-50"
          )}
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>
    </>
  )}

      </div>
    </div>
  )
}

