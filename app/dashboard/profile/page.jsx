"use client"
import * as React from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { signOut } from "firebase/auth"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { Facebook, Instagram, TwitterIcon as TikTok, Youtube, LogOut, Pencil } from "lucide-react"

import { auth, db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/providers/auth-provider"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export default function ProfilePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [socialLinks, setSocialLinks] = React.useState({
    instagram: "",
    facebook: "",
    tiktok: "",
    youtube: "",
  })
  const [isEditing, setIsEditing] = React.useState(false)
  const [editedLinks, setEditedLinks] = React.useState(socialLinks)

  React.useEffect(() => {
    async function fetchUserData() {
      if (user) {
        try {
          const docRef = doc(db, "users", user.uid)
          const docSnap = await getDoc(docRef)
          if (docSnap.exists()) {
            const userData = docSnap.data()
            setSocialLinks(userData.socialLinks || {})
            setEditedLinks(userData.socialLinks || {})
          }
        } catch (error) {
          console.error("Error fetching user data:", error)
        }
      }
    }

    fetchUserData()
  }, [user])

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

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    try {
      const docRef = doc(db, "users", user.uid)
      await updateDoc(docRef, {
        socialLinks: editedLinks,
      })
      setSocialLinks(editedLinks)
      setIsEditing(false)
      toast.success("Social links updated successfully")
    } catch (error) {
      console.error("Error updating social links:", error)
      toast.error("Failed to update social links")
    }
  }

  const ourSocialLinks = [
    {
      name: "TikTok",
      icon: TikTok,
      url: "https://tiktok.com/@financemaster",
    },
    {
      name: "Instagram",
      icon: Instagram,
      url: "https://instagram.com/financemaster",
    },
    {
      name: "Facebook",
      icon: Facebook,
      url: "https://facebook.com/financemaster",
    },
    {
      name: "YouTube",
      icon: Youtube,
      url: "https://youtube.com/@financemaster",
    },
  ]

  return (
    <div className="mx-auto max-w-2xl space-y-8 p-6">
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
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Social Links</h2>
              <Dialog open={isEditing} onOpenChange={setIsEditing}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit Links
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Social Links</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleEditSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="instagram">Instagram Profile Link</Label>
                      <Input
                        id="instagram"
                        type="url"
                        value={editedLinks.instagram}
                        onChange={(e) => setEditedLinks((prev) => ({ ...prev, instagram: e.target.value }))}
                        required
                        placeholder="https://instagram.com/username"
                      />
                    </div>
                    <div>
                      <Label htmlFor="facebook">Facebook Profile Link</Label>
                      <Input
                        id="facebook"
                        type="url"
                        value={editedLinks.facebook}
                        onChange={(e) => setEditedLinks((prev) => ({ ...prev, facebook: e.target.value }))}
                        required
                        placeholder="https://facebook.com/username"
                      />
                    </div>
                    <div>
                      <Label htmlFor="tiktok">TikTok Profile Link</Label>
                      <Input
                        id="tiktok"
                        type="url"
                        value={editedLinks.tiktok}
                        onChange={(e) => setEditedLinks((prev) => ({ ...prev, tiktok: e.target.value }))}
                        required
                        placeholder="https://tiktok.com/@username"
                      />
                    </div>
                    <div>
                      <Label htmlFor="youtube">YouTube Channel Link</Label>
                      <Input
                        id="youtube"
                        type="url"
                        value={editedLinks.youtube}
                        onChange={(e) => setEditedLinks((prev) => ({ ...prev, youtube: e.target.value }))}
                        required
                        placeholder="https://youtube.com/@username"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">Save Changes</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="flex items-center justify-start gap-2"
                onClick={() => handleSocialClick(socialLinks.instagram)}
              >
                <Instagram className="h-5 w-5" />
                Instagram
              </Button>
              <Button
                variant="outline"
                className="flex items-center justify-start gap-2"
                onClick={() => handleSocialClick(socialLinks.facebook)}
              >
                <Facebook className="h-5 w-5" />
                Facebook
              </Button>
              <Button
                variant="outline"
                className="flex items-center justify-start gap-2"
                onClick={() => handleSocialClick(socialLinks.tiktok)}
              >
                <TikTok className="h-5 w-5" />
                TikTok
              </Button>
              <Button
                variant="outline"
                className="flex items-center justify-start gap-2"
                onClick={() => handleSocialClick(socialLinks.youtube)}
              >
                <Youtube className="h-5 w-5" />
                YouTube
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="destructive" className="w-full" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </CardFooter>
      </Card>
      <h1 className="text-center">Follow Us</h1>
      <CardContent className="mt-6">
          <div className="flex justify-center gap-4">
            {ourSocialLinks.map((link) => (
              <Button key={link.name} variant="outline" size="icon" onClick={() => handleSocialClick(link.url)}>
                <link.icon className="h-5 w-5" />
                <span className="sr-only">{link.name}</span>
              </Button>
            ))}
          </div>
        </CardContent>
    </div>
  )
}

