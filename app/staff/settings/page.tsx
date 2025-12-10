"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Radio, Wifi, Share2, Save, CheckCircle2, Loader2 } from "lucide-react"
import { stationConfig } from "@/lib/station-config"

export default function SettingsPage() {
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const [stationSettings, setStationSettings] = useState({
    name: stationConfig.name,
    tagline: stationConfig.tagline,
    description: stationConfig.description || stationConfig.tagline,
    logo: stationConfig.logo || "/logo.png",
    primaryColor: stationConfig.primaryColor,
  })

  const [streamSettings, setStreamSettings] = useState({
    streamUrl: stationConfig.streamUrl,
    mountpoint: "/live",
    azuracastUrl: stationConfig.azuracastApiUrl || "https://panel.azuracast.com",
    bitrate: "192",
    format: "mp3",
  })

  const [socialSettings, setSocialSettings] = useState({
    twitter: "communityradio",
    instagram: "communityradio",
    facebook: "communityradio",
    discord: "https://discord.gg/communityradio",
    youtube: "communityradio",
  })

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setIsSaving(false)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Station Settings</h1>
        <p className="text-muted-foreground">Configure your station&apos;s settings and integrations</p>
      </div>

      {showSuccess && (
        <Alert className="border-green-500/30 bg-green-500/10">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-green-500">Settings saved successfully!</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="station" className="space-y-6">
        <TabsList className="glass-card">
          <TabsTrigger value="station" className="gap-2">
            <Radio className="h-4 w-4" />
            Station
          </TabsTrigger>
          <TabsTrigger value="stream" className="gap-2">
            <Wifi className="h-4 w-4" />
            Stream
          </TabsTrigger>
          <TabsTrigger value="social" className="gap-2">
            <Share2 className="h-4 w-4" />
            Social
          </TabsTrigger>
        </TabsList>

        <form onSubmit={handleSave}>
          <TabsContent value="station">
            <Card className="glass-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Radio className="h-5 w-5 text-primary" />
                  Station Information
                </CardTitle>
                <CardDescription>Basic information about your radio station</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="stationName">Station Name</Label>
                    <Input
                      id="stationName"
                      value={stationSettings.name}
                      onChange={(e) => setStationSettings({ ...stationSettings, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tagline">Tagline</Label>
                    <Input
                      id="tagline"
                      value={stationSettings.tagline}
                      onChange={(e) => setStationSettings({ ...stationSettings, tagline: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={stationSettings.description}
                    onChange={(e) => setStationSettings({ ...stationSettings, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="logo">Logo URL</Label>
                    <Input
                      id="logo"
                      value={stationSettings.logo}
                      onChange={(e) => setStationSettings({ ...stationSettings, logo: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="primaryColor">Primary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="primaryColor"
                        value={stationSettings.primaryColor}
                        onChange={(e) => setStationSettings({ ...stationSettings, primaryColor: e.target.value })}
                      />
                      <div
                        className="w-10 h-10 rounded-lg border border-border shrink-0"
                        style={{ backgroundColor: stationSettings.primaryColor }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stream">
            <Card className="glass-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wifi className="h-5 w-5 text-primary" />
                  Stream Configuration
                </CardTitle>
                <CardDescription>Configure your stream and AzuraCast integration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="streamUrl">Stream URL</Label>
                    <Input
                      id="streamUrl"
                      value={streamSettings.streamUrl}
                      onChange={(e) => setStreamSettings({ ...streamSettings, streamUrl: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mountpoint">Mountpoint</Label>
                    <Input
                      id="mountpoint"
                      value={streamSettings.mountpoint}
                      onChange={(e) => setStreamSettings({ ...streamSettings, mountpoint: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="azuracastUrl">AzuraCast API URL</Label>
                  <Input
                    id="azuracastUrl"
                    value={streamSettings.azuracastUrl}
                    onChange={(e) => setStreamSettings({ ...streamSettings, azuracastUrl: e.target.value })}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="bitrate">Bitrate (kbps)</Label>
                    <Input
                      id="bitrate"
                      value={streamSettings.bitrate}
                      onChange={(e) => setStreamSettings({ ...streamSettings, bitrate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="format">Format</Label>
                    <Input
                      id="format"
                      value={streamSettings.format}
                      onChange={(e) => setStreamSettings({ ...streamSettings, format: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="social">
            <Card className="glass-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="h-5 w-5 text-primary" />
                  Social Links
                </CardTitle>
                <CardDescription>Connect your social media accounts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="twitter">Twitter</Label>
                    <Input
                      id="twitter"
                      value={socialSettings.twitter}
                      onChange={(e) => setSocialSettings({ ...socialSettings, twitter: e.target.value })}
                      placeholder="username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input
                      id="instagram"
                      value={socialSettings.instagram}
                      onChange={(e) => setSocialSettings({ ...socialSettings, instagram: e.target.value })}
                      placeholder="username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="facebook">Facebook</Label>
                    <Input
                      id="facebook"
                      value={socialSettings.facebook}
                      onChange={(e) => setSocialSettings({ ...socialSettings, facebook: e.target.value })}
                      placeholder="page name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="youtube">YouTube</Label>
                    <Input
                      id="youtube"
                      value={socialSettings.youtube}
                      onChange={(e) => setSocialSettings({ ...socialSettings, youtube: e.target.value })}
                      placeholder="channel name"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discord">Discord Invite URL</Label>
                  <Input
                    id="discord"
                    value={socialSettings.discord}
                    onChange={(e) => setSocialSettings({ ...socialSettings, discord: e.target.value })}
                    placeholder="https://discord.gg/..."
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <div className="flex justify-end pt-6">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </form>
      </Tabs>
    </div>
  )
}
