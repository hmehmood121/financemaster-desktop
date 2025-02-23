"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { collection, getDocs } from "firebase/firestore"

import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export function CourseList() {
  const [courses, setCourses] = React.useState([])

  React.useEffect(() => {
    async function fetchCourses() {
      const querySnapshot = await getDocs(collection(db, "courses"))
      const fetchedCourses = []

      querySnapshot.forEach((doc) => {
        fetchedCourses.push({ id: doc.id, ...doc.data() })
      })

      setCourses(fetchedCourses)
    }

    fetchCourses()
  }, [])

  return (
    <section>
      <h2 className="text-2xl font-bold">Featured Courses</h2>
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {courses
  .filter((course) => course.status === "Public") // Filter only public courses
  .map((course) => (
    <Card key={course.id}>
      <CardHeader className="p-0">
        <div className="aspect-video relative">
          <Image
            src={course.imageUrl || "/placeholder.svg"}
            alt={course.name}
            fill
            className="rounded-t-lg object-cover"
          />
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <CardTitle className="line-clamp-2">{course.name}</CardTitle>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button className="w-full" asChild>
          <Link href={`/dashboard/courses/${course.id}`}>Start Learning</Link>
        </Button>
      </CardFooter>
    </Card>
  ))}

      </div>
    </section>
  )
}

