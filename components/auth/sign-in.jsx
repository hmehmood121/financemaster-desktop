"use client"

import * as React from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, sendPasswordResetEmail } from "firebase/auth"
import { Loader2 } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { auth } from "@/lib/firebase"
import { toast } from "sonner"
import { Laptop, Apple, Smartphone } from 'lucide-react';

export default function SignIn() {
  const [isLoading, setIsLoading] = React.useState(false)
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [resetEmail, setResetEmail] = React.useState("")
  const [isResetOpen, setIsResetOpen] = React.useState(false)
  const router = useRouter()

  const handleSignIn = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await signInWithEmailAndPassword(auth, email, password)
      router.push("/dashboard")
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    const provider = new GoogleAuthProvider()

    try {
      await signInWithPopup(auth, provider)
      router.push("/dashboard")
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!resetEmail) {
      toast.error("Please enter your email address")
      return
    }

    try {
      await sendPasswordResetEmail(auth, resetEmail)
      toast.success("Password reset email sent!")
      setIsResetOpen(false)
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <div className="flex min-h-screen">
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <h2 className="text-xl font-semibold mb-4">Download our App</h2>
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
          </div>
          <div className="space-y-6">
            <div>
              <h1 className="mt-8 text-2xl font-bold leading-9 tracking-tight">Sign in to your account</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Button variant="link" className="p-0" onClick={() => router.push("/signup")}>
                  Create one now
                </Button>
              </p>
            </div>
            <form onSubmit={handleSignIn} className="space-y-6">
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
              <Dialog open={isResetOpen} onOpenChange={setIsResetOpen}>
                <DialogTrigger asChild>
                  <Button variant="link" className="px-0">
                    Forgot your password?
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Reset Password</DialogTitle>
                    <DialogDescription>
                      Enter your email address and we&apos;ll send you a link to reset your password.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="reset-email">Email address</Label>
                      <Input
                        id="reset-email"
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                    <Button onClick={handleResetPassword} className="w-full">
                      Send Reset Link
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign in
              </Button>
            </form>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>
            <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isLoading}>
              <Image src="/google.png" alt="Google" width={20} height={20} className="mr-2" />
              Google
            </Button>
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
          priority
        />
      </div>
    </div>
  )
}