"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { collection, getDocs, limit, query } from "firebase/firestore"
import { ChevronRight } from "lucide-react"

import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export function ArticleList() {
  const [articles, setArticles] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [hasMore, setHasMore] = React.useState(false)

  React.useEffect(() => {
    async function fetchArticles() {
      try {
        const q = query(collection(db, "articles"), limit(4))
        const querySnapshot = await getDocs(q)
        const fetchedArticles = []

        querySnapshot.forEach((doc) => {
          fetchedArticles.push({ id: doc.id, ...doc.data() })
        })

        setArticles(fetchedArticles)
        setHasMore(querySnapshot.size === 4)
      } catch (error) {
        console.error("Error fetching articles:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchArticles()
  }, [])

  if (loading) {
    return (
      <section>
        <h2 className="text-2xl font-bold">Latest Articles</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="p-0">
                <div className="aspect-video bg-muted" />
              </CardHeader>
              <CardContent className="p-4">
                <div className="h-5 w-3/4 rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    )
  }

  if (articles.length === 0) {
    return (
      <section>
        <h2 className="text-2xl font-bold">Latest Articles</h2>
        <Card className="mt-6">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No articles available</p>
          </CardContent>
        </Card>
      </section>
    )
  }

  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Latest Articles</h2>
        {hasMore && (
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/articles">
              View all
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {articles.map((article) => (
          <Card key={article.id}>
            <CardHeader className="p-0">
              <div className="aspect-video relative">
                <Image
                  src={article.image || "/placeholder.svg?height=200&width=300"}
                  alt={article.title}
                  fill
                  className="rounded-t-lg object-cover"
                />
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <CardTitle className="line-clamp-2">{article.title}</CardTitle>
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <Button size="sm" className="w-full" asChild>
                <Link href={`/dashboard/articles/${article.id}`}>Read more</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  )
}

