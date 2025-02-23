"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { doc, getDoc } from "firebase/firestore"
import { ArrowLeft, Lock, Play } from "lucide-react"

import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function CourseLearnPage({ params }) {
  const [course, setCourse] = useState(null)
  const [currentVideo, setCurrentVideo] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function fetchCourse() {
      try {
        const docRef = doc(db, "courses", params.id)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          const courseData = { id: docSnap.id, ...docSnap.data() }
          setCourse(courseData)
          // Set first public video as current video
          const publicVideos = courseData.videos?.filter((video) => video.visibility === "Public") || []
          if (publicVideos.length > 0) {
            setCurrentVideo(publicVideos[0])
          }
        }
      } catch (error) {
        console.error("Error fetching course:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCourse()
  }, [params.id])

  const handleVideoClick = (video) => {
    if (video.visibility === "Public") {
      setCurrentVideo(video)
    }
  }

  const publicVideosCount = course?.videos?.filter((video) => video.visibility === "Public").length || 0

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!course) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <h1 className="text-2xl font-bold text-muted-foreground">Course not found</h1>
          <Button onClick={() => router.push("/dashboard")}>Return to Dashboard</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b p-4 flex-none">
        <Button variant="ghost" className="group" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Course
        </Button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left side - Video Player */}
        <div className="flex-1 min-w-0 overflow-y-auto">
          {currentVideo && (
            <>
              <div className="relative w-full bg-black">
                <div className="aspect-video">
                  <video
                    id={`video-${currentVideo.id}`}
                    controls
                    autoPlay
                    src={currentVideo.videoUrl}
                    className="w-full h-full"
                  />
                </div>
              </div>
              <div className="p-4">
                <h1 className="text-2xl font-bold mb-2">{currentVideo.title}</h1>
                <div className="flex items-center text-sm text-muted-foreground">
                  <span>{course.instructor}</span>
                  {currentVideo.duration && (
                    <>
                      <span className="mx-2">•</span>
                      <span>{currentVideo.duration}</span>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right side - Video List */}
        <div className="w-[400px] border-l flex-none flex flex-col">
          <div className="p-4 border-b flex-none">
            <h2 className="font-semibold">{course.title}</h2>
            <p className="text-sm text-muted-foreground">
              {publicVideosCount} available {publicVideosCount === 1 ? "video" : "videos"}
            </p>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-2">
              {course.videos?.map((video) => (
                <div
                  key={video.id}
                  onClick={() => handleVideoClick(video)}
                  className={`flex items-start gap-2 p-2 rounded-lg transition-all ${
                    video.visibility === "Public" ? "cursor-pointer hover:bg-accent/50" : "opacity-50"
                  }`}
                >
                  <div className="relative w-40 flex-shrink-0">
                    <div className="aspect-video">
                      <Image
                        src={video.thumbnailUrl || "/placeholder.svg?height=80&width=120"}
                        alt={video.title}
                        fill
                        className={`object-cover rounded-md ${
                          currentVideo?.id === video.id ? "ring-2 ring-primary ring-offset-2" : ""
                        }`}
                      />
                      {video.visibility !== "Public" ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-md">
                          <Lock className="h-6 w-6 text-muted-foreground" />
                        </div>
                      ) : currentVideo?.id === video.id ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-primary/20 rounded-md">
                          <Play className="h-6 w-6 text-primary fill-primary" />
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3
                      className={`font-medium text-sm line-clamp-2 ${
                        currentVideo?.id === video.id ? "text-primary" : ""
                      }`}
                    >
                      {video.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      {video.duration && <p className="text-xs text-muted-foreground">{video.duration}</p>}
                      {video.visibility !== "Public" && (
                        <p className="text-xs text-muted-foreground">Premium content</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}

