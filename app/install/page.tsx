"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { stationConfig } from "@/lib/station-config"
import {
  Radio,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Database,
  Settings,
  User,
  Wifi,
  Rocket,
  Eye,
  EyeOff,
  UploadCloud,
} from "lucide-react"

type Step = "preflight" | "station" | "stream" | "admin" | "complete"

interface PreflightCheck {
  name: string
  key: string
  status: "pending" | "checking" | "passed" | "failed"
  message?: string
}

export default function InstallPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<Step>("preflight")
  const [isChecking, setIsChecking] = useState(false)
  const [isInstalling, setIsInstalling] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [installError, setInstallError] = useState("")

  const [preflightChecks, setPreflightChecks] = useState<PreflightCheck[]>([
    { name: "Station Name", key: "NEXT_PUBLIC_STATION_NAME", status: "pending" },
    { name: "Station Logo", key: "NEXT_PUBLIC_STATION_LOGO", status: "pending" },
    { name: "Stream URL", key: "NEXT_PUBLIC_STREAM_URL", status: "pending" },
    { name: "AzuraCast API", key: "NEXT_PUBLIC_AZURACAST_API_URL", status: "pending" },
    { name: "MongoDB Connection", key: "MONGODB_URI", status: "pending" },
  ])

  const [stationData, setStationData] = useState({
    name: stationConfig.name,
    tagline: stationConfig.tagline,
    description: stationConfig.description || "",
    logo: stationConfig.logo,
    primaryColor: stationConfig.primaryColor,
    timezone: "America/New_York",
  })
  const [dbUri, setDbUri] = useState("")
  const [jwtSecret, setJwtSecret] = useState("")
  const [logoPreview, setLogoPreview] = useState(stationConfig.logo)
  const [logoUploading, setLogoUploading] = useState(false)
  const [logoUploadError, setLogoUploadError] = useState("")

  const [streamData, setStreamData] = useState({
    streamUrl: stationConfig.streamUrl || "",
    azuracastUrl: stationConfig.azuracastApiUrl || "",
    mountpoint: "/live",
    bitrate: "192",
    format: "mp3",
  })

  const [spotifyData, setSpotifyData] = useState({
    clientId: process.env.SPOTIFY_CLIENT_ID || "",
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET || "",
  })

  const [adminData, setAdminData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    displayName: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const steps: { key: Step; title: string; icon: React.ReactNode }[] = [
    { key: "preflight", title: "Preflight", icon: <Database className="h-4 w-4" /> },
    { key: "station", title: "Station", icon: <Radio className="h-4 w-4" /> },
    { key: "stream", title: "Stream", icon: <Wifi className="h-4 w-4" /> },
    { key: "admin", title: "Admin", icon: <User className="h-4 w-4" /> },
    { key: "complete", title: "Complete", icon: <Rocket className="h-4 w-4" /> },
  ]

  const currentStepIndex = steps.findIndex((s) => s.key === currentStep)
  const progress = ((currentStepIndex + 1) / steps.length) * 100

  const runPreflightChecks = async () => {
    setIsChecking(true)

    const envLookup: Record<string, string | undefined> = {
      NEXT_PUBLIC_STATION_NAME: process.env.NEXT_PUBLIC_STATION_NAME,
      NEXT_PUBLIC_STATION_LOGO: process.env.NEXT_PUBLIC_STATION_LOGO,
      NEXT_PUBLIC_STREAM_URL: process.env.NEXT_PUBLIC_STREAM_URL,
      NEXT_PUBLIC_AZURACAST_API_URL: process.env.NEXT_PUBLIC_AZURACAST_API_URL,
      MONGODB_URI: dbUri || process.env.MONGODB_URI,
    }

    for (let i = 0; i < preflightChecks.length; i++) {
      setPreflightChecks((prev) =>
        prev.map((check, idx) => (idx === i ? { ...check, status: "checking", message: undefined } : check)),
      )

      await new Promise((resolve) => setTimeout(resolve, 400))

      const check = preflightChecks[i]
      const envValue = envLookup[check.key]
      const isServerOnly = check.key === "MONGODB_URI"
      const stagedValue =
        check.key === "NEXT_PUBLIC_STATION_NAME"
          ? stationData.name
          : check.key === "NEXT_PUBLIC_STATION_LOGO"
            ? stationData.logo
            : check.key === "NEXT_PUBLIC_STREAM_URL"
              ? streamData.streamUrl
              : check.key === "NEXT_PUBLIC_AZURACAST_API_URL"
                ? streamData.azuracastUrl
                : undefined

      const passed = isServerOnly ? true : Boolean(envValue || stagedValue)

      setPreflightChecks((prev) =>
        prev.map((check, idx) =>
          idx === i
            ? {
                ...check,
                status: passed ? "passed" : "failed",
                message: isServerOnly
                  ? "Server-side check will run after install"
                  : passed
                    ? envValue
                      ? "Found in env"
                      : "Will be written during install"
                    : `Missing ${check.key} environment variable`,
              }
            : check,
        ),
      )
    }

    setIsChecking(false)
  }

  useEffect(() => {
    if (currentStep === "preflight") {
      runPreflightChecks()
    }
  }, [currentStep])

  useEffect(() => {
    setLogoPreview(stationData.logo)
  }, [stationData.logo])

  const allChecksPassed = preflightChecks.every((c) => c.status === "passed")
  const someChecksFailed = preflightChecks.some((c) => c.status === "failed")

  const validateStep = (step: Step): boolean => {
    const newErrors: Record<string, string> = {}

    if (step === "station") {
      if (!stationData.name.trim()) newErrors.name = "Station name is required"
      if (!stationData.logo?.trim()) newErrors.logo = "Station logo is required"
    }

    if (step === "stream") {
      if (!streamData.streamUrl.trim()) newErrors.streamUrl = "Stream URL is required"
    }

    if (step === "admin") {
      if (!dbUri.trim()) newErrors.dbUri = "MongoDB URI is required"
      if (!spotifyData.clientId.trim()) newErrors.spotifyClientId = "Spotify Client ID is required"
      if (!spotifyData.clientSecret.trim()) newErrors.spotifyClientSecret = "Spotify Client Secret is required"
      if (!adminData.email.trim()) newErrors.email = "Email is required"
      if (!adminData.email.includes("@")) newErrors.email = "Invalid email format"
      if (!adminData.password) newErrors.password = "Password is required"
      if (adminData.password.length < 6) newErrors.password = "Password must be at least 6 characters"
      if (adminData.password !== adminData.confirmPassword) newErrors.confirmPassword = "Passwords do not match"
      if (!adminData.displayName.trim()) newErrors.displayName = "Display name is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    const stepOrder: Step[] = ["preflight", "station", "stream", "admin", "complete"]
    const currentIndex = stepOrder.indexOf(currentStep)

    if (currentStep !== "preflight" && !validateStep(currentStep)) {
      return
    }

    setInstallError("")

    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1])
    }
  }

  const prevStep = () => {
    const stepOrder: Step[] = ["preflight", "station", "stream", "admin", "complete"]
    const currentIndex = stepOrder.indexOf(currentStep)
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1])
    }
  }

  const handleLogoUpload = async (file: File | null) => {
    if (!file) return
    setLogoUploadError("")

    if (!file.type.startsWith("image/")) {
      setLogoUploadError("Please upload an image file")
      return
    }

    setLogoUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/install/logo", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Upload failed")
      }

      const data = (await response.json()) as { url?: string }
      if (!data?.url) {
        throw new Error("Missing upload URL")
      }

      setStationData((prev) => ({ ...prev, logo: data.url }))
      setLogoPreview(data.url)
    } catch (error) {
      console.error("Logo upload failed", error)
      setLogoUploadError("Failed to upload logo. Please try again.")
    } finally {
      setLogoUploading(false)
      const input = document.getElementById("logoUpload") as HTMLInputElement | null
      if (input) input.value = ""
    }
  }

  const finishInstallation = async () => {
    if (!validateStep("admin")) return

    setInstallError("")
    setIsInstalling(true)

    try {
      const effectiveJwtSecret = jwtSecret.trim() || crypto.randomUUID()

      const response = await fetch("/api/install/config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          stationName: stationData.name.trim(),
          tagline: stationData.tagline.trim(),
          description: stationData.description.trim(),
          logo: stationData.logo.trim(),
          primaryColor: stationData.primaryColor.trim(),
          streamUrl: streamData.streamUrl.trim(),
          azuracastUrl: streamData.azuracastUrl.trim(),
          mongoUri: dbUri.trim(),
          jwtSecret: effectiveJwtSecret,
          spotifyClientId: spotifyData.clientId.trim(),
          spotifyClientSecret: spotifyData.clientSecret.trim(),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to persist configuration")
      }

      const adminResponse = await fetch("/api/install/admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mongoUri: dbUri.trim(),
          email: adminData.email.trim(),
          password: adminData.password,
          displayName: adminData.displayName.trim(),
        }),
      })

      if (!adminResponse.ok) {
        const data = await adminResponse.json().catch(() => ({}))
        throw new Error(data.error || "Failed to create admin")
      }

      setCurrentStep("complete")
    } catch (error) {
      console.error("Installation failed", error)
      setInstallError(
        error instanceof Error ? error.message : "Could not write configuration to .env.local. Check permissions and try again.",
      )
    } finally {
      setIsInstalling(false)
    }
  }

  const goToSite = () => {
    router.push("/")
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background to-background" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/20 blur-[120px] rounded-full" />

      <Card className="relative w-full max-w-2xl glass-card border-border/50">
        <CardHeader className="text-center border-b border-border/50 pb-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="relative h-10 w-10 rounded-full overflow-hidden border border-border/50 bg-background/50">
              {logoPreview ? (
                <Image
                  src={logoPreview}
                  alt={`${stationData.name || "Station"} logo`}
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              ) : (
                <>
                  <Radio className="h-10 w-10 p-2 text-primary" />
                  <div className="absolute inset-0 bg-primary/30 blur-lg rounded-full animate-pulse-glow" />
                </>
              )}
            </div>
            <span className="text-2xl font-bold">{stationData.name || "Your Station"}</span>
          </div>
          <CardTitle className="text-xl">Installation Wizard</CardTitle>
          <CardDescription>Set up your radio station in a few simple steps</CardDescription>

          {/* Progress */}
          <div className="mt-6">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between mt-4">
              {steps.map((step, index) => (
                <div
                  key={step.key}
                  className={`flex flex-col items-center gap-1 ${
                    index <= currentStepIndex ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                      index < currentStepIndex
                        ? "bg-primary border-primary text-primary-foreground"
                        : index === currentStepIndex
                          ? "border-primary"
                          : "border-muted"
                    }`}
                  >
                    {index < currentStepIndex ? <CheckCircle2 className="h-4 w-4" /> : step.icon}
                  </div>
                  <span className="text-xs hidden sm:block">{step.title}</span>
                </div>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          {/* Preflight Checks */}
          {currentStep === "preflight" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Environment Check</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Verifying required environment variables and connections...
                </p>
              </div>

              <div className="space-y-3">
                {preflightChecks.map((check) => (
                  <div
                    key={check.key}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/50"
                  >
                    <div className="flex items-center gap-3">
                      {check.status === "pending" && <div className="w-5 h-5 rounded-full bg-muted" />}
                      {check.status === "checking" && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
                      {check.status === "passed" && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                      {check.status === "failed" && <XCircle className="h-5 w-5 text-red-500" />}
                      <div>
                        <p className="font-medium">{check.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{check.key}</p>
                      </div>
                    </div>
                    {check.message && (
                      <span className={`text-xs ${check.status === "passed" ? "text-green-500" : "text-red-500"}`}>
                        {check.message}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {someChecksFailed && !isChecking && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Configuration Required</AlertTitle>
                  <AlertDescription>
                    Some environment variables are missing. Please configure them in your .env file and restart the
                    server, or continue to configure manually.
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={runPreflightChecks} disabled={isChecking}>
                  {isChecking ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Re-check
                </Button>
                <Button onClick={nextStep} disabled={isChecking}>
                  {allChecksPassed ? "Continue" : "Continue Anyway"}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Station Setup */}
          {currentStep === "station" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Station Details</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Configure your radio station&apos;s basic information.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="stationName">Station Name *</Label>
                  <Input
                    id="stationName"
                    value={stationData.name}
                    onChange={(e) => setStationData({ ...stationData, name: e.target.value })}
                    placeholder="My Radio Station"
                  />
                  {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tagline">Tagline</Label>
                  <Input
                    id="tagline"
                    value={stationData.tagline}
                    onChange={(e) => setStationData({ ...stationData, tagline: e.target.value })}
                    placeholder="Your community radio station"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={stationData.description}
                    onChange={(e) => setStationData({ ...stationData, description: e.target.value })}
                    placeholder="A brief description of your station"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="logo">Logo URL or Upload *</Label>
                    <Input
                      id="logo"
                      value={stationData.logo}
                      onChange={(e) => {
                        setLogoUploadError("")
                        setStationData({ ...stationData, logo: e.target.value })
                      }}
                      placeholder="https://..."
                    />
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <input
                          id="logoUpload"
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleLogoUpload(e.target.files?.[0] || null)}
                          disabled={logoUploading}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById("logoUpload")?.click()}
                          disabled={logoUploading}
                        >
                          {logoUploading ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <UploadCloud className="h-4 w-4 mr-2" />
                          )}
                          {logoUploading ? "Uploading..." : "Upload logo"}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Paste an existing logo URL or upload a file (stored in /public/uploads) for automatic metadata.
                      </p>
                      {errors.logo && <p className="text-xs text-red-500">{errors.logo}</p>}
                      {logoUploadError && <p className="text-xs text-red-500">{logoUploadError}</p>}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="primaryColor">Primary Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="primaryColor"
                          value={stationData.primaryColor}
                          onChange={(e) => setStationData({ ...stationData, primaryColor: e.target.value })}
                        />
                        <div
                          className="w-10 h-10 rounded-lg border border-border shrink-0"
                          style={{ backgroundColor: stationData.primaryColor }}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Logo Preview</Label>
                      <div className="relative h-20 w-20 rounded-lg border border-border/60 bg-secondary/40 flex items-center justify-center overflow-hidden">
                        {logoPreview ? (
                          <Image src={logoPreview} alt="Station logo preview" fill sizes="80px" className="object-cover" />
                        ) : (
                          <Radio className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={prevStep}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button onClick={nextStep}>
                  Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Stream Setup */}
          {currentStep === "stream" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Stream Configuration</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Configure your streaming server and AzuraCast integration.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="streamUrl">Stream URL *</Label>
                  <Input
                    id="streamUrl"
                    value={streamData.streamUrl}
                    onChange={(e) => setStreamData({ ...streamData, streamUrl: e.target.value })}
                    placeholder="https://stream.yourstation.com/live"
                  />
                  {errors.streamUrl && <p className="text-xs text-red-500">{errors.streamUrl}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="azuracastUrl">AzuraCast API URL</Label>
                  <Input
                    id="azuracastUrl"
                    value={streamData.azuracastUrl}
                    onChange={(e) => setStreamData({ ...streamData, azuracastUrl: e.target.value })}
                    placeholder="https://panel.yourstation.com/api"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="mountpoint">Mountpoint</Label>
                    <Input
                      id="mountpoint"
                      value={streamData.mountpoint}
                      onChange={(e) => setStreamData({ ...streamData, mountpoint: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bitrate">Bitrate (kbps)</Label>
                    <Input
                      id="bitrate"
                      value={streamData.bitrate}
                      onChange={(e) => setStreamData({ ...streamData, bitrate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="format">Format</Label>
                    <Input
                      id="format"
                      value={streamData.format}
                      onChange={(e) => setStreamData({ ...streamData, format: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={prevStep}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button onClick={nextStep}>
                  Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Admin Setup */}
          {currentStep === "admin" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Create Admin Account</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Set up your administrator account to manage the station.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="dbUri">MongoDB URI *</Label>
                  <Input
                    id="dbUri"
                    value={dbUri}
                    onChange={(e) => setDbUri(e.target.value)}
                    placeholder="mongodb+srv://user:password@cluster.mongodb.net/openradio"
                  />
                  {errors.dbUri && <p className="text-xs text-red-500">{errors.dbUri}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="spotifyClientId">Spotify Client ID *</Label>
                  <Input
                    id="spotifyClientId"
                    value={spotifyData.clientId}
                    onChange={(e) => setSpotifyData({ ...spotifyData, clientId: e.target.value })}
                    placeholder="spotify client id"
                  />
                  {errors.spotifyClientId && <p className="text-xs text-red-500">{errors.spotifyClientId}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="spotifyClientSecret">Spotify Client Secret *</Label>
                  <Input
                    id="spotifyClientSecret"
                    type="password"
                    value={spotifyData.clientSecret}
                    onChange={(e) => setSpotifyData({ ...spotifyData, clientSecret: e.target.value })}
                    placeholder="spotify client secret"
                  />
                  {errors.spotifyClientSecret && <p className="text-xs text-red-500">{errors.spotifyClientSecret}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jwtSecret">JWT Secret (optional)</Label>
                  <Input
                    id="jwtSecret"
                    value={jwtSecret}
                    onChange={(e) => setJwtSecret(e.target.value)}
                    placeholder="Leave blank to auto-generate"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name *</Label>
                  <Input
                    id="displayName"
                    value={adminData.displayName}
                    onChange={(e) => setAdminData({ ...adminData, displayName: e.target.value })}
                    placeholder="Station Admin"
                  />
                  {errors.displayName && <p className="text-xs text-red-500">{errors.displayName}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={adminData.email}
                    onChange={(e) => setAdminData({ ...adminData, email: e.target.value })}
                    placeholder="admin@yourstation.com"
                  />
                  {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={adminData.password}
                      onChange={(e) => setAdminData({ ...adminData, password: e.target.value })}
                      placeholder="Min 6 characters"
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
                  {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={adminData.confirmPassword}
                    onChange={(e) => setAdminData({ ...adminData, confirmPassword: e.target.value })}
                    placeholder="Confirm your password"
                  />
                  {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword}</p>}
                </div>
              </div>

              <Alert>
                <Settings className="h-4 w-4" />
                <AlertTitle>Important</AlertTitle>
                <AlertDescription>
                  This will create the initial admin account. Make sure to save these credentials securely.
                </AlertDescription>
              </Alert>

              {installError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Couldn&apos;t finish install</AlertTitle>
                  <AlertDescription>{installError}</AlertDescription>
                </Alert>
              )}

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={prevStep}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button onClick={finishInstallation} disabled={isInstalling || logoUploading}>
                  {isInstalling ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Installing...
                    </>
                  ) : (
                    <>
                      Complete Setup
                      <Rocket className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Complete */}
          {currentStep === "complete" && (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Installation Complete!</h3>
              <p className="text-muted-foreground mb-8">
                {stationData.name} is now set up and ready to go. Restart the server to load the new metadata across the
                site.
              </p>

              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-secondary/50 text-left">
                  <h4 className="font-semibold mb-2">Quick Start:</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>1. Log in to the Staff Panel with your admin account</li>
                    <li>2. Configure your DJs and show schedule</li>
                    <li>3. Set up your streaming software with the connection details</li>
                    <li>4. Start broadcasting!</li>
                  </ul>
                </div>

                <div className="p-4 rounded-lg bg-secondary/50 text-left">
                  <h4 className="font-semibold mb-2">Configuration saved to .env.local</h4>
                  <p className="text-xs text-muted-foreground mb-2">
                    These values power the site metadata and branding:
                  </p>
                  <div className="text-xs font-mono bg-background/60 border border-border/50 rounded-lg p-3 space-y-1 overflow-auto">
                    <div>NEXT_PUBLIC_STATION_NAME={stationData.name}</div>
                    <div>NEXT_PUBLIC_STATION_TAGLINE={stationData.tagline}</div>
                    <div>NEXT_PUBLIC_STATION_DESCRIPTION={stationData.description}</div>
                    <div>NEXT_PUBLIC_STATION_LOGO={stationData.logo}</div>
                    <div>NEXT_PUBLIC_PRIMARY_COLOR={stationData.primaryColor}</div>
                    <div>NEXT_PUBLIC_STREAM_URL={streamData.streamUrl}</div>
                    <div>NEXT_PUBLIC_AZURACAST_API_URL={streamData.azuracastUrl}</div>
                    <div>MONGODB_URI={dbUri}</div>
                    <div>JWT_SECRET={jwtSecret || "[auto-generated]"}</div>
                    <div>SPOTIFY_CLIENT_ID={spotifyData.clientId}</div>
                    <div>SPOTIFY_CLIENT_SECRET={[...spotifyData.clientSecret].map(() => "*").join("") || "[set]"}</div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Restart the dev server to see your station name, logo, and colors reflected everywhere.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button variant="outline" asChild>
                    <a href="/staff">Go to Staff Panel</a>
                  </Button>
                  <Button onClick={goToSite}>
                    Visit Your Station
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
