import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Wifi, Server, Lock, Settings, AlertTriangle, Copy, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ConnectionPage() {
  // These would come from .env or MongoDB settings in production
  const connectionDetails = {
    server: "stream.communityradio.com",
    port: "8000",
    mountpoint: "/live",
    username: "source",
    password: "••••••••••••",
    bitrate: "192 kbps",
    format: "MP3",
    sampleRate: "44100 Hz",
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Connection Guide</h1>
        <p className="text-muted-foreground">Settings and instructions for connecting to the stream</p>
      </div>

      <Alert className="border-yellow-500/30 bg-yellow-500/10">
        <AlertTriangle className="h-4 w-4 text-yellow-500" />
        <AlertTitle className="text-yellow-500">Keep these details private</AlertTitle>
        <AlertDescription className="text-yellow-500/80">
          Never share your connection password with anyone outside of authorized staff members.
        </AlertDescription>
      </Alert>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Connection Details */}
        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5 text-primary" />
              Server Details
            </CardTitle>
            <CardDescription>Use these settings in your broadcasting software</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <div>
                  <p className="text-sm text-muted-foreground">Server Address</p>
                  <p className="font-mono font-medium">{connectionDetails.server}</p>
                </div>
                <Button variant="ghost" size="icon">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <div>
                  <p className="text-sm text-muted-foreground">Port</p>
                  <p className="font-mono font-medium">{connectionDetails.port}</p>
                </div>
                <Button variant="ghost" size="icon">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <div>
                  <p className="text-sm text-muted-foreground">Mount Point</p>
                  <p className="font-mono font-medium">{connectionDetails.mountpoint}</p>
                </div>
                <Button variant="ghost" size="icon">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Authentication */}
        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              Authentication
            </CardTitle>
            <CardDescription>Your login credentials for the stream</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <div>
                  <p className="text-sm text-muted-foreground">Username</p>
                  <p className="font-mono font-medium">{connectionDetails.username}</p>
                </div>
                <Button variant="ghost" size="icon">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <div>
                  <p className="text-sm text-muted-foreground">Password</p>
                  <p className="font-mono font-medium">{connectionDetails.password}</p>
                </div>
                <Button variant="ghost" size="icon">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Encoder Settings */}
        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Encoder Settings
            </CardTitle>
            <CardDescription>Recommended audio encoding configuration</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Format</span>
                <Badge variant="secondary">{connectionDetails.format}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Bitrate</span>
                <Badge variant="secondary">{connectionDetails.bitrate}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Sample Rate</span>
                <Badge variant="secondary">{connectionDetails.sampleRate}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Channels</span>
                <Badge variant="secondary">Stereo</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status */}
        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wifi className="h-5 w-5 text-primary" />
              Connection Status
            </CardTitle>
            <CardDescription>Current stream server status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium text-green-500">Server Online</p>
                  <p className="text-sm text-green-500/70">Ready to accept connections</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Uptime</p>
                  <p className="font-medium">99.9%</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Latency</p>
                  <p className="font-medium">24ms</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Software Guides */}
      <Card className="glass-card border-border/50">
        <CardHeader>
          <CardTitle>Recommended Broadcasting Software</CardTitle>
          <CardDescription>Compatible software for streaming to the station</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: "BUTT", description: "Broadcast Using This Tool - Simple and reliable", free: true },
              { name: "Mixxx", description: "Full DJ software with built-in streaming", free: true },
              { name: "OBS Studio", description: "Great for video + audio streaming", free: true },
              { name: "SAM Broadcaster", description: "Professional radio automation", free: false },
              { name: "RadioDJ", description: "Free radio automation software", free: true },
              { name: "Virtual DJ", description: "Popular DJ software with streaming", free: false },
            ].map((software, index) => (
              <div key={index} className="p-4 rounded-lg bg-secondary/30 border border-border/50">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{software.name}</h3>
                  <Badge variant={software.free ? "secondary" : "outline"}>{software.free ? "Free" : "Paid"}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{software.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
