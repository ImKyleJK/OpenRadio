"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Radio, UserPlus, AlertCircle, Eye, EyeOff, Check, Sparkles } from "lucide-react"
import { stationConfig } from "@/lib/station-config"
import { usernameFromDisplayName } from "@/lib/username"

type EmailStatusState = "idle" | "checking" | "invalid" | "available" | "taken" | "error"

const adjectives = ["lunar", "crimson", "midnight", "stellar", "velvet", "electric", "golden", "cosmic", "silver", "radiant"]
const nouns = ["groove", "frequency", "echo", "pulse", "wave", "melody", "tempo", "rhythm", "signal", "anthem"]
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function RegisterPage() {
  const router = useRouter()
  const { register } = useAuth()
  const [displayName, setDisplayName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [emailStatus, setEmailStatus] = useState<{ state: EmailStatusState; message?: string }>({ state: "idle" })

  const passwordRequirements = [
    { text: "At least 6 characters", met: password.length >= 6 },
    { text: "Passwords match", met: password === confirmPassword && password.length > 0 },
  ]

  const derivedUsername = useMemo(() => usernameFromDisplayName(displayName), [displayName])

  const randomizeDisplayName = () => {
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)]
    const noun = nouns[Math.floor(Math.random() * nouns.length)]
    const suffix = Math.floor(Math.random() * 900 + 100)
    const pretty = `${adjective} ${noun} ${suffix}`
    setDisplayName(pretty.replace(/\b\w/g, (char) => char.toUpperCase()))
  }

  useEffect(() => {
    if (!email) {
      setEmailStatus({ state: "idle" })
      return
    }

    const trimmed = email.trim().toLowerCase()
    if (!emailRegex.test(trimmed)) {
      setEmailStatus({ state: "invalid", message: "Enter a valid email." })
      return
    }

    let active = true
    const controller = new AbortController()
    setEmailStatus({ state: "checking" })
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/auth/check-email?email=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
          cache: "no-store",
        })
        const data = await res.json().catch(() => ({}))
        if (!active) return
        if (res.ok && data.valid) {
          setEmailStatus({
            state: data.available ? "available" : "taken",
            message: data.available ? "Email looks good." : "This email is already registered.",
          })
        } else {
          setEmailStatus({ state: "invalid", message: data.error || "Enter a valid email." })
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") return
        if (!active) return
        setEmailStatus({ state: "error", message: "Unable to verify email right now." })
      }
    }, 400)

    return () => {
      active = false
      controller.abort()
      clearTimeout(timer)
    }
  }, [email])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    const trimmedEmail = email.trim().toLowerCase()
    if (!emailRegex.test(trimmedEmail)) {
      setError("Enter a valid email address.")
      return
    }
    if (emailStatus.state === "checking") {
      setError("Hang tight, we're validating your email.")
      return
    }
    if (emailStatus.state === "taken") {
      setError("That email is already registered.")
      return
    }

    setIsLoading(true)

    const result = await register(trimmedEmail, password, displayName || "Listener")

    if (result.success) {
      router.push("/")
      router.refresh()
    } else {
      setError(result.error || "Registration failed")
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background to-background" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/20 blur-[120px] rounded-full" />

      <Card className="relative w-full max-w-md glass-card border-border/50">
        <CardHeader className="text-center">
          <Link href="/" className="flex items-center justify-center gap-2 mb-4">
            <div className="relative h-10 w-10 rounded-full overflow-hidden border border-border/50 bg-background/50">
              {stationConfig.logo ? (
                <Image
                  src={stationConfig.logo}
                  alt={`${stationConfig.name} logo`}
                  fill
                  className="object-cover"
                  sizes="40px"
                />
              ) : (
                <>
                  <Radio className="h-10 w-10 p-2 text-primary" />
                  <div className="absolute inset-0 bg-primary/30 blur-lg rounded-full animate-pulse-glow" />
                </>
              )}
            </div>
            <span className="text-xl font-bold">{stationConfig.name}</span>
          </Link>
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <CardDescription>Join our community and start listening</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="displayName">Display Name</Label>
                <Button type="button" variant="ghost" size="sm" className="text-xs gap-1" onClick={randomizeDisplayName}>
                  <Sparkles className="h-3.5 w-3.5" />
                  Surprise me
                </Button>
              </div>
              <Input
                id="displayName"
                type="text"
                placeholder="How should we call you?"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                autoComplete="name"
              />
              <p className="text-xs text-muted-foreground">
                Your username will be{" "}
                <span className="font-mono text-foreground">@{derivedUsername}</span>
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
              {emailStatus.state !== "idle" && (
                <p
                  className={`text-xs ${
                    emailStatus.state === "available"
                      ? "text-green-500"
                      : emailStatus.state === "checking"
                        ? "text-muted-foreground"
                        : "text-red-500"
                  }`}
                >
                  {emailStatus.message ||
                    (emailStatus.state === "checking" ? "Checking availability..." : "Enter a valid email.")}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>

            {/* Password requirements */}
            <div className="space-y-1">
              {passwordRequirements.map((req, index) => (
                <div key={index} className="flex items-center gap-2 text-xs">
                  <Check className={`h-3 w-3 ${req.met ? "text-green-500" : "text-muted-foreground"}`} />
                  <span className={req.met ? "text-green-500" : "text-muted-foreground"}>{req.text}</span>
                </div>
              ))}
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isLoading || emailStatus.state === "invalid" || emailStatus.state === "taken"}
            >
              {isLoading ? (
                <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create Account
                </>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
