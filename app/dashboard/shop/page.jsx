"use client"

import * as React from "react"
import Image from "next/image"
import { collection, getDocs } from "firebase/firestore"
import { ExternalLink, Search } from "lucide-react"

import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"

export default function ShopPage() {
  const [selectedCategory, setSelectedCategory] = React.useState("All")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [products, setProducts] = React.useState([])
  const [categories, setCategories] = React.useState([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function fetchData() {
      try {
        // Fetch products
        const productsSnapshot = await getDocs(collection(db, "products"))
        const productsData = productsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        setProducts(productsData)

        // Fetch categories
        const categoriesSnapshot = await getDocs(collection(db, "shopcategories"))
        const categoriesData = categoriesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        setCategories([
          {
            id: "all",
            name: "All",
            imageUrl: "/placeholder.svg?height=80&width=80",
          },
          ...categoriesData,
        ])
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const handleProductClick = (url) => {
    window.open(url, "_blank")
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header and Search */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Shop</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="relative">
        <ScrollArea className="w-full whitespace-nowrap rounded-lg border">
          <div className="flex w-max space-x-4 p-4">
            {loading
              ? // Loading skeleton for categories
                [...Array(5)].map((_, i) => (
                  <div key={i} className="flex flex-col items-center space-y-2">
                    <Skeleton className="h-20 w-20 rounded-full" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))
              : categories.map((category) => (
                  <Button
                    key={category.id}
                    variant="ghost"
                    className={`flex flex-col items-center space-y-2 hover:bg-accent ${
                      selectedCategory === category.name ? "bg-accent" : ""
                    }`}
                    onClick={() => setSelectedCategory(category.name)}
                  >
                    <div className="relative h-20 w-20 overflow-hidden rounded-full">
                      <Image
                        src={category.imageUrl || "/placeholder.svg"}
                        alt={category.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <span className="text-sm font-medium">{category.name}</span>
                  </Button>
                ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Products Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {loading ? (
          // Loading skeleton for products
          [...Array(8)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="aspect-square" />
              <CardContent className="p-4">
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))
        ) : filteredProducts.length === 0 ? (
          <div className="col-span-full text-center">
            <p className="text-muted-foreground">No products found</p>
          </div>
        ) : (
          filteredProducts.map((product) => (
            <Card
              key={product.id}
              className="group cursor-pointer overflow-hidden transition-all hover:shadow-lg"
              onClick={() => handleProductClick(product.url)}
            >
              <div className="aspect-square relative">
                <Image
                  src={product.imageUrl || "/placeholder.svg"}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
              </div>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="mt-4 font-medium line-clamp-1">{product.name}</h3>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </div>
                {product.price && <p className="mt-2 text-sm text-muted-foreground">${product.price}</p>}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

