"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { collection, getDocs } from "firebase/firestore"
import { Play } from "lucide-react"

import { db } from "@/lib/firebase"
import { Card } from "@/components/ui/card"

export default function ReelsPage() {
  const [reels, setReels] = React.useState([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function fetchReels() {
      try {
        const querySnapshot = await getDocs(collection(db, "reels"))
        const fetchedReels = []

        querySnapshot.forEach((doc) => {
          fetchedReels.push({ id: doc.id, ...doc.data() })
        })

        setReels(fetchedReels)
      } catch (error) {
        console.error("Error fetching reels:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchReels()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="aspect-[9/16] animate-pulse bg-muted" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Reels</h1>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {reels
          .filter((reel) => reel.status === "Public")
          .map((reel) => (
            <Link key={reel.id} href={`/dashboard/reels/${reel.id}`}>
              <Card className="aspect-[9/16] group relative overflow-hidden">
                <Image
                  src={reel.thumbnailURL || "/placeholder.svg?height=600&width=400"}
                  alt={reel.caption}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Play className="w-12 h-12 text-white" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                  {/* <p className="text-white line-clamp-2 text-sm">{reel.caption}</p> */}
                </div>
              </Card>
            </Link>
          ))}
      </div>
    </div>
  )
}

