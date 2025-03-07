"use client"

import * as React from "react"
import { collection, getDocs, limit, query } from "firebase/firestore"

import { db } from "@/lib/firebase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function TipOfTheDay() {
  const [tip, setTip] = React.useState(null)

  React.useEffect(() => {
    async function fetchTip() {
      const q = query(collection(db, "tip"), limit(1))
      const querySnapshot = await getDocs(q)

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0]
        setTip({ id: doc.id, ...doc.data() })
      }
    }

    fetchTip()
  }, [])

  if (!tip) return null

  return (
    <Card className="bg-gradient-to-r from-[#ffb800] to-[#fff]/95">
      <CardHeader>
        <CardTitle className="text-black">Tip of the Day</CardTitle>
      </CardHeader>
      <CardContent>
        <h3 className="mb-2 text-lg font-semibold text-black">{tip.title}</h3>
        <p className="text-black">{tip.content}</p>
      </CardContent>
    </Card>
  )
}

