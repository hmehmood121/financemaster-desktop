"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { doc, getDoc } from "firebase/firestore"
import { ArrowLeft } from "lucide-react"

import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { CourseReviews } from "@/components/dashboard/course-reviews"

export default function CoursePage({ params }) {
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const router = useRouter()

  useEffect(() => {
    async function fetchCourse() {
      try {
        const docRef = doc(db, "courses", params.id)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          setCourse({ id: docSnap.id, ...docSnap.data() })
        } else {
          setError("Course not found")
        }
      } catch (error) {
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchCourse()
  }, [params.id])

  const handleStartCourse = () => {
    router.push(`/dashboard/courses/${params.id}/learn`)
  }

  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl p-6">
        <div className="space-y-6 animate-pulse">
          <div className="aspect-video w-full bg-muted rounded-lg" />
          <div className="space-y-4">
            <div className="h-8 w-1/2 bg-muted rounded" />
            <div className="h-4 w-1/4 bg-muted rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="container mx-auto max-w-4xl p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6 min-h-[400px] space-y-4">
            <h1 className="text-2xl font-bold text-muted-foreground">{error || "Course not found"}</h1>
            <Button onClick={() => router.push("/dashboard")}>Return to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <Button variant="ghost" className="group mb-6" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Back
      </Button>

      <div className="space-y-8">
        <div className="aspect-video relative w-full rounded-lg overflow-hidden">
          <Image
            src={course.imageUrl || "/placeholder.svg?height=600&width=1200"}
            alt={course.title}
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="text-center space-y-4">
          <p className="text-muted-foreground italic">Instructor</p>
          <h2 className="text-2xl font-bold">Billy Carvelli</h2>
          <p className="text-muted-foreground">Finance Expert</p>
          <Button size="lg" className="px-8" onClick={handleStartCourse}>
            Start Now
          </Button>
        </div>

        <Card>
          <CardHeader>
            <h3 className="text-xl font-bold">About this course</h3>
          </CardHeader>
          <div className="prose prose-gray max-w-none p-5 leading-normal"
             dangerouslySetInnerHTML={{ __html: course.description }}
            ></div>
        </Card>

        <CourseReviews courseId={params.id} />
      </div>
    </div>
  )
}

