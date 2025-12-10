"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Users, Search, UserPlus, UploadCloud, Sparkles } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { resolveAvatar } from "@/lib/avatar"

interface UserSummary {
  id: string
  displayName: string
  email: string
  avatar?: string | null
  role: string
  username?: string
}

export default function DJsPage() {
  const { toast } = useToast()
  const [query, setQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState<UserSummary[]>([])
  const [selected, setSelected] = useState<UserSummary | null>(null)
  const [form, setForm] = useState({ displayName: "", avatar: "" })
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const djCount = useMemo(() => results.filter((user) => user.role === "dj").length, [results])

  const runSearch = async () => {
    setIsSearching(true)
    try {
      const res = await fetch(`/api/staff/users?q=${encodeURIComponent(query)}`, { cache: "no-store" })
      if (!res.ok) {
        throw new Error("Unable to search users")
      }
      const data = await res.json()
      setResults(data.users || [])
    } catch (error) {
      toast({ title: "Search failed", description: error instanceof Error ? error.message : undefined, variant: "destructive" })
    } finally {
      setIsSearching(false)
    }
  }

  useEffect(() => {
    void runSearch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSelect = (user: UserSummary) => {
    setSelected(user)
    setForm({ displayName: user.displayName || "", avatar: user.avatar || "" })
  }

  const handleAvatarUpload = async (file: File | null) => {
    if (!file) return
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch("/api/install/logo", {
        method: "POST",
        body: formData,
      })
      if (!res.ok) throw new Error("Upload failed")
      const data = await res.json()
      if (!data?.url) throw new Error("Missing upload URL")
      setForm((prev) => ({ ...prev, avatar: data.url }))
      toast({ title: "Avatar uploaded" })
    } catch (error) {
      toast({ title: "Upload failed", description: error instanceof Error ? error.message : undefined, variant: "destructive" })
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleSave = async () => {
    if (!selected) return
    if (!form.displayName.trim()) {
      toast({ title: "Display name required", variant: "destructive" })
      return
    }
    setIsSaving(true)
    try {
      const res = await fetch("/api/staff/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selected.id,
          displayName: form.displayName.trim(),
          avatar: form.avatar.trim() || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Unable to update DJ")
      }
      const updated = data.user as UserSummary
      setResults((prev) => prev.map((user) => (user.id === updated.id ? { ...user, ...updated } : user)))
      setSelected((prev) => (prev && prev.id === updated.id ? { ...prev, ...updated } : prev))
      toast({ title: "DJ updated", description: `${updated.displayName} is now a DJ.` })
    } catch (error) {
      toast({ title: "Update failed", description: error instanceof Error ? error.message : undefined, variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">DJ Management</h1>
        <p className="text-muted-foreground">Promote registered users to DJs, update their profile, and keep avatars on brand.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              Find Users
            </CardTitle>
            <CardDescription>Search existing accounts by name, email, or username</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                placeholder="Search users..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1"
              />
              <Button onClick={runSearch} disabled={isSearching} className="sm:w-auto">
                {isSearching ? "Searching..." : "Search"}
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              {results.length} result{results.length === 1 ? "" : "s"} • {djCount} DJ{djCount === 1 ? "" : "s"} found in list
            </div>
            <div className="space-y-3 max-h-[420px] overflow-auto pr-1">
              {results.length === 0 && !isSearching ? (
                <div className="text-center text-muted-foreground py-10">No users match that search yet.</div>
              ) : (
                results.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleSelect(user)}
                    className={`w-full flex items-center gap-3 rounded-lg border p-3 text-left transition hover:border-primary/50 ${
                      selected?.id === user.id ? "border-primary bg-primary/5" : "border-border/50 bg-secondary/40"
                    }`}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={resolveAvatar(user)} alt={user.displayName} />
                      <AvatarFallback>{user.displayName?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{user.displayName}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <Badge variant={user.role === "dj" ? "default" : "outline"}>{user.role.toUpperCase()}</Badge>
                  </button>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Promote to DJ
            </CardTitle>
            <CardDescription>Select a user to edit their profile and assign DJ permissions.</CardDescription>
          </CardHeader>
          <CardContent>
            {selected ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 border border-border/50">
                    <AvatarImage src={form.avatar || resolveAvatar(selected)} alt={selected.displayName} />
                    <AvatarFallback>{selected.displayName?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <Input
                      placeholder="Avatar URL (optional)"
                      value={form.avatar}
                      onChange={(e) => setForm((prev) => ({ ...prev, avatar: e.target.value }))}
                    />
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleAvatarUpload(e.target.files?.[0] || null)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="gap-2"
                    >
                      <UploadCloud className="h-4 w-4" />
                      {isUploading ? "Uploading..." : "Upload image"}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Display Name</label>
                  <Input
                    value={form.displayName}
                    onChange={(e) => setForm((prev) => ({ ...prev, displayName: e.target.value }))}
                    placeholder="DJ Display Name"
                  />
                </div>

                <div className="rounded-lg border border-dashed border-border/60 bg-secondary/30 p-4 text-sm text-muted-foreground flex items-start gap-3">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <p>Saving will update their display name/avatar and assign the DJ role immediately.</p>
                </div>

                <Button onClick={handleSave} disabled={isSaving} className="gap-2">
                  <UserPlus className="h-4 w-4" />
                  {isSaving ? "Saving..." : "Save & Set as DJ"}
                </Button>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-16">Select a user from the left to begin.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
