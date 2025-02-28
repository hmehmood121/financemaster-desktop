"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { collection, getDocs } from "firebase/firestore"
import { ArrowLeft } from "lucide-react"

import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function ArticlesPage() {
  const [articles, setArticles] = React.useState([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function fetchArticles() {
      try {
        const querySnapshot = await getDocs(collection(db, "articles"))
        const fetchedArticles = []

        querySnapshot.forEach((doc) => {
          fetchedArticles.push({ id: doc.id, ...doc.data() })
        })

        setArticles(fetchedArticles)
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
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <div className="h-8 w-32 animate-pulse rounded bg-muted" />
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="p-0">
                <div className="aspect-video bg-muted" />
              </CardHeader>
              <CardContent className="p-4">
                <div className="h-5 w-3/4 rounded bg-muted" />
                <div className="mt-2 h-16 w-full rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center">
        <Button variant="ghost" className="group mr-4" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">All Articles</h1>
      </div>

      {articles.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No articles available</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
                {article.excerpt && (
                  <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{article.excerpt}</p>
                )}
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button variant="ghost" size="sm" className="w-full" asChild>
                  <Link href={`/dashboard/articles/${article.id}`}>Read more</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

