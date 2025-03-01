"use client"

import * as React from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { collection, query, where, getDocs } from "firebase/firestore"
import { ArrowLeft } from "lucide-react"

import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { generateSlug } from "@/lib/utils"

export default function ArticlePage({ params }) {
  const [article, setArticle] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const router = useRouter()

  React.useEffect(() => {
    async function fetchArticle() {
      try {
        // First try to find by slug
        const articlesRef = collection(db, "articles")
        const slugQuery = query(articlesRef, where("slug", "==", params.slug))
        let querySnapshot = await getDocs(slugQuery)

        // If no article found by slug, try to find by generated slug from title
        if (querySnapshot.empty) {
          const allArticlesQuery = await getDocs(articlesRef)
          const matchingDoc = allArticlesQuery.docs.find((doc) => {
            const data = doc.data()
            return generateSlug(data.title) === params.slug
          })
          if (matchingDoc) {
            querySnapshot = { docs: [matchingDoc] }
          }
        }

        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0]
          const data = doc.data()
          setArticle({
            id: doc.id,
            ...data,
            slug: data.slug || generateSlug(data.title),
          })
        }
      } catch (error) {
        console.error("Error fetching article:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchArticle()
  }, [params.slug])

  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl p-6">
        <div className="space-y-6 animate-pulse">
          <div className="h-8 w-32 bg-muted rounded" />
          <div className="aspect-video w-full bg-muted rounded-lg" />
          <div className="space-y-4">
            <div className="h-8 w-3/4 bg-muted rounded" />
            <div className="h-4 w-full bg-muted rounded" />
            <div className="h-4 w-full bg-muted rounded" />
            <div className="h-4 w-2/3 bg-muted rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="container mx-auto max-w-4xl p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6 min-h-[400px] space-y-4">
            <h1 className="text-2xl font-bold text-muted-foreground">Article not found</h1>
            <Button onClick={() => router.push("/dashboard/articles")}>Back to Articles</Button>
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

      <article className="space-y-8">
        {article.image && (
          <div className="aspect-video relative w-full rounded-lg overflow-hidden">
            <Image
              src={article.image || "/placeholder.svg?height=600&width=1200"}
              alt={article.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        <div className="space-y-4">
          <h1 className="text-4xl font-bold">{article.title}</h1>
          {article.excerpt && <p className="text-xl text-muted-foreground">{article.excerpt}</p>}
          <div className="prose prose-gray max-w-none"
        dangerouslySetInnerHTML={{ __html: article.content }} 
        ></div>
        </div>
      </article>
    </div>
  )
}

