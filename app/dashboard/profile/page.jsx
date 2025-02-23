"use client"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { signOut } from "firebase/auth"
import { Facebook, Instagram, TwitterIcon as TikTok, Youtube, LogOut } from "lucide-react"

import { auth } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/providers/auth-provider"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

const socialLinks = [
  {
    name: "TikTok",
    icon: TikTok,
    url: "https://www.tiktok.com/@carvellimasteroffinance",
  },
  {
    name: "Instagram",
    icon: Instagram,
    url: "https://www.instagram.com/carvelli_masteroffinance/",
  },
  {
    name: "Facebook",
    icon: Facebook,
    url: "https://facebook.com/financemaster",
  },
  {
    name: "YouTube",
    icon: Youtube,
    url: "https://www.youtube.com/@CarvelliMasterofFinance/",
  },
]

export default function ProfilePage() {
  const { user } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await signOut(auth)
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const handleSocialClick = (url) => {
    window.open(url, "_blank")
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <Card>
        <CardHeader className="pb-0">
          <div className="flex flex-col items-center">
            <div className="relative h-32 w-32">
              <Image
                src={user?.photoURL || "/placeholder.svg"}
                alt={user?.displayName || "Profile"}
                fill
                className="rounded-full object-cover"
              />
            </div>
            <h1 className="mt-4 text-2xl font-bold">{user?.displayName}</h1>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </CardHeader>
        <CardContent className="mt-6">
          <div className="flex justify-center gap-4">
            {socialLinks.map((link) => (
              <Button key={link.name} variant="outline" size="icon" onClick={() => handleSocialClick(link.url)}>
                <link.icon className="h-5 w-5" />
                <span className="sr-only">{link.name}</span>
              </Button>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="destructive" className="w-full" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

