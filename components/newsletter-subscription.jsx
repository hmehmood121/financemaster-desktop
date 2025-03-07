"use client"

import { useState } from "react"
import Image from "next/image"
import { addDoc, collection } from "firebase/firestore"
import { Loader2 } from "lucide-react"

import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

export function NewsletterSubscription() {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await addDoc(collection(db, "nlemails"), {
        ...formData,
        createdAt: new Date().toISOString(),
      })

      toast.success("Successfully subscribed to newsletter!")
      setFormData({ name: "", email: "" }) // Reset form
    } catch (error) {
      console.error("Error subscribing to newsletter:", error)
      toast.error("Failed to subscribe. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <div className="bg-black py-12 px-2">
      <div className="container mx-auto max-w-4xl">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="w-48">
            <Image
              src="./logo.png"
              alt="Carvelli Master of Finance"
              width={192}
              height={192}
              className="w-full h-auto"
            />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl md:text-3xl font-bold text-[#ffb800] text-center md:text-left mb-6">
              Subscribe Our NewsLatter For More Updates
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="text"
                name="name"
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleChange}
                required
                className="bg-gray-100 border-0"
              />
              <Input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
                className="bg-gray-100 border-0"
              />
              <Button
                type="submit"
                className="w-full bg-[#ffb800] hover:bg-[#ffb800]/90 text-black font-semibold"
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Subscribe
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

