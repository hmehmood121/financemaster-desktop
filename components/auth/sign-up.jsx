"use client"

import * as React from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from "firebase/auth"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { doc, setDoc } from "firebase/firestore"
import { Loader2, Upload } from "lucide-react"

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
  const router = useRouter()

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setProfilePicture(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
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

      // Create user document
      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        photoURL,
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
          className="absolute inset-0 h-full w-full object-cover"
          src="/billy.jpg"
          alt="Finance"
          width={1920}
          height={1080}
          style={{objectFit:"contain"}}
          priority
        />
      </div>
    </div>
  )
}

