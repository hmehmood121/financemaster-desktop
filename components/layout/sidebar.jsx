"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, ShoppingBag, Film, User } from "lucide-react"
import { useAuth } from "@/components/providers/auth-provider"
import Image from "next/image"

const navigation = [
  { name: "Home", href: "/dashboard", icon: Home },
  { name: "Shop", href: "/dashboard/shop", icon: ShoppingBag },
  { name: "Reels", href: "/dashboard/reels", icon: Film },
  { name: "Profile", href: "/dashboard/profile", icon: User },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const { user } = useAuth()

  if (!user) return null

  return (
    <div className="fixed top-0 left-0 h-screen w-64 flex flex-col border-r border-r-[#ffb800] bg-black overflow-y-auto z-10">
      <div className="border-b p-6 flex justify-center items-center">
        <Image alt="Finance Master" width={50} height={50} src="./logo.png" className="w-full h-auto" />
      </div>
      <nav className="flex-1 space-y-1 p-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center rounded-md px-3 py-2 text-sm font-medium ${
                isActive ? "bg-[#ffb800] text-primary" : "text-white text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon className="mr-3 h-4 w-4" />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

