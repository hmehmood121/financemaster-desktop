"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { doc, getDoc } from "firebase/firestore"
import { ArrowLeft } from "lucide-react"

import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function ArticlePage({ params }) {
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const router = useRouter()

  useEffect(() => {
    async function fetchArticle() {
      try {
        const docRef = doc(db, "articles", params.id)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          setArticle({ id: docSnap.id, ...docSnap.data() })
        } else {
          setError("Article not found")
        }
      } catch (error) {
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchArticle()
  }, [params.id])

  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl p-6">
        <div className="space-y-6">
          <div className="h-8 w-32 animate-pulse rounded bg-muted" />
          <Card>
            <CardHeader className="p-0">
              <div className="aspect-video w-full animate-pulse bg-muted" />
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="h-8 w-3/4 animate-pulse rounded bg-muted" />
              <div className="space-y-2">
                <div className="h-4 w-full animate-pulse rounded bg-muted" />
                <div className="h-4 w-full animate-pulse rounded bg-muted" />
                <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="container mx-auto max-w-4xl p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6 min-h-[400px] space-y-4">
            <h1 className="text-2xl font-bold text-muted-foreground">{error || "Article not found"}</h1>
            <Button onClick={() => router.push("/dashboard")}>Return to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <div className="space-y-6">
        <Button variant="ghost" className="group" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back
        </Button>

        <Card>
          <CardHeader className="p-0">
            <div className="aspect-video relative w-full">
              <Image
                src={article.image || "/placeholder.svg?height=600&width=1200"}
                alt={article.title}
                fill
                className="object-cover"
                priority
              />
            </div>
            <h3 className="italic">Author: {article.author}</h3>
            <p className="italic">Published Date: {article.publishDate}</p>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <h2 className="text-xl font-bold">{article.title}</h2>
            <div className="prose prose-gray max-w-none"
             dangerouslySetInnerHTML={{ __html: article.content }}
            ></div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

