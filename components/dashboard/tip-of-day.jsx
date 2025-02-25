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
    <Card className="bg-gradient-to-r from-blue-500 to-purple-500">
      <CardHeader>
        <CardTitle className="text-white">Tip of the Day</CardTitle>
      </CardHeader>
      <CardContent>
        <h3 className="mb-2 text-lg font-semibold text-white">{tip.title}</h3>
        <p className="text-white/90">{tip.content}</p>
      </CardContent>
    </Card>
  )
}

