"use client"

import * as React from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from "firebase/auth"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { doc, setDoc } from "firebase/firestore"
import { Loader2, Upload, Apple, Laptop, Smartphone } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { auth, storage, db } from "@/lib/firebase"
import { toast } from "sonner"

export default function SignUp() {
  const [isLoading, setIsLoading] = React.useState(false)
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [profilePicture, setProfilePicture] = React.useState(null)
  const [previewUrl, setPreviewUrl] = React.useState("")
  const [socialLinks, setSocialLinks] = React.useState({
    instagram: "",
    facebook: "",
    tiktok: "",
    youtube: "",
  })
  const router = useRouter()

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setProfilePicture(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleSocialLinkChange = (platform) => (e) => {
    setSocialLinks((prev) => ({
      ...prev,
      [platform]: e.target.value,
    }))
  }

  const handleSignUp = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Create user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Upload profile picture if selected
      let photoURL = ""
      if (profilePicture) {
        const storageRef = ref(storage, `profile-pictures/${user.uid}`)
        await uploadBytes(storageRef, profilePicture)
        photoURL = await getDownloadURL(storageRef)
      }

      // Update profile
      await updateProfile(user, {
        displayName: name,
        photoURL: photoURL,
      })

      // Create user document with social links
      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        photoURL,
        socialLinks: Object.fromEntries(Object.entries(socialLinks).filter(([_, value]) => value.trim() !== "")),
        createdAt: new Date().toISOString(),
      })

      // Send verification email
      await sendEmailVerification(user)

      toast.success("Account created! Please check your email to verify your account.")
      router.push("/dashboard")
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
             <div className="flex flex-wrap gap-4 mb-8">
                   <Button onClick={() => window.open("https://play.google.com/store/apps/details?id=com.finance.master", "_blank")}  variant="outline" className="flex items-center gap-2">
                       <Smartphone className="h-4 w-4" />
                       Download for Android
                     </Button>
                     <Button onClick={() => window.open("https://drive.google.com/file/d/114-sJfwYRgnZ2P3GG_vIhPrDpG7_4YA1/view?usp=sharing", "_blank")} variant="outline" className="flex items-center gap-2">
                       <Laptop className="h-4 w-4" />
                       Download for Windows
                     </Button>
                  
                     <Button onClick={() => window.open("https://drive.google.com/file/d/1yDbGE5qGcBIDqhZM1Ugg8LBPpRVpS0H8/view?usp=sharing", "_blank")} variant="outline" className="flex items-center gap-2">
                       <Apple className="h-4 w-4" />
                       Download for Mac
                     </Button>
                     <Button onClick={() => window.open("https://drive.google.com/file/d/1gXCgv1DUd9nhEJvKRmvS0t_EmgOwZU25/view?usp=drive_link", "_blank")} variant="outline" className="flex items-center gap-2">
                       <Laptop className="h-4 w-4" />
                       Download for Linux
                     </Button>
                   </div>
          <div className="space-y-6">
            <div>
              <h1 className="mt-8 text-2xl font-bold leading-9 tracking-tight">Create your account</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Already have an account?{" "}
                <Button variant="link" className="p-0" onClick={() => router.push("/")}>
                  Sign in
                </Button>
              </p>
            </div>
            <form onSubmit={handleSignUp} className="space-y-6">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative h-24 w-24">
                  {previewUrl ? (
                    <Image
                      src={previewUrl || "/placeholder.svg"}
                      alt="Profile"
                      fill
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-muted">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="profile-picture"
                  />
                  <Label
                    htmlFor="profile-picture"
                    className="cursor-pointer text-sm text-muted-foreground hover:text-foreground"
                  >
                    Upload profile picture
                  </Label>
                </div>
              </div>
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required className="mt-2" />
              </div>
              <div>
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="instagram">Instagram Profile Link</Label>
                <Input
                  id="instagram"
                  type="url"
                  value={socialLinks.instagram}
                  onChange={handleSocialLinkChange("instagram")}
                  placeholder="https://instagram.com/username"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="facebook">Facebook Profile Link</Label>
                <Input
                  id="facebook"
                  type="url"
                  value={socialLinks.facebook}
                  onChange={handleSocialLinkChange("facebook")}
                  placeholder="https://facebook.com/username"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="tiktok">TikTok Profile Link</Label>
                <Input
                  id="tiktok"
                  type="url"
                  value={socialLinks.tiktok}
                  onChange={handleSocialLinkChange("tiktok")}
                  placeholder="https://tiktok.com/@username"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="youtube">YouTube Channel Link</Label>
                <Input
                  id="youtube"
                  type="url"
                  value={socialLinks.youtube}
                  onChange={handleSocialLinkChange("youtube")}
                  placeholder="https://youtube.com/@username"
                  className="mt-2"
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create account
              </Button>
            </form>
          </div>
        </div>
      </div>
      <div className="relative hidden w-0 flex-1 lg:block">
        <Image
          className="absolute inset-0 h-full w-full"
          src="/billy.jpg"
          alt="Finance"
          width={1920}
          height={1080}
          style={{objectFit:'contain'}}
          priority
        />
      </div>
    </div>
  )
}

