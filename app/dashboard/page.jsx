"use client"

import { useAuth } from "@/components/providers/auth-provider"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { ArticleList } from "@/components/dashboard/article-list"
import { TipOfTheDay } from "@/components/dashboard/tip-of-day"
import { CourseList } from "@/components/dashboard/course-list"

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!user) return null

  return (
    <main className="container mx-auto p-6">
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Welcome, {user.displayName || ""}!</h1>
        <CourseList />
        <TipOfTheDay />
        <ArticleList />
      </div>
    </main>
  )
}

