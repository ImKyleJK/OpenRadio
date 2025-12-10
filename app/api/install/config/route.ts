import { promises as fs } from "fs"
import path from "path"
import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const formatEnvValue = (value: string) => `"${value.replace(/"/g, '\\"').replace(/\n/g, "\\n")}"`

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const markComplete = Boolean(body?.markComplete)

    const envEntries = new Map<string, string>()
    const setIfString = (key: string, value: unknown) => {
      if (typeof value === "string") {
        envEntries.set(key, value)
      }
    }

    setIfString("NEXT_PUBLIC_STATION_NAME", body.stationName)
    setIfString("NEXT_PUBLIC_STATION_TAGLINE", body.tagline)
    setIfString("NEXT_PUBLIC_STATION_DESCRIPTION", body.description)
    setIfString("NEXT_PUBLIC_STATION_LOGO", body.logo)
    setIfString("NEXT_PUBLIC_PRIMARY_COLOR", body.primaryColor)
    setIfString("NEXT_PUBLIC_STREAM_URL", body.streamUrl)
    setIfString("NEXT_PUBLIC_AZURACAST_API_URL", body.azuracastUrl)
    setIfString("MONGODB_URI", body.mongoUri)
    setIfString("JWT_SECRET", body.jwtSecret)
    setIfString("SPOTIFY_CLIENT_ID", body.spotifyClientId)
    setIfString("SPOTIFY_CLIENT_SECRET", body.spotifyClientSecret)
    if (markComplete) {
      envEntries.set("SETUP_COMPLETED", "true")
    }

    const envPath = path.join(process.cwd(), ".env.local")
    let existingLines: string[] = []

    try {
      const existing = await fs.readFile(envPath, "utf8")
      existingLines = existing.split(/\r?\n/)
    } catch {
      existingLines = []
    }

    const updatedLines = existingLines.map((line) => {
      const match = line.match(/^([A-Z0-9_]+)=/)
      if (!match) return line

      const key = match[1]
      if (!envEntries.has(key)) return line

      const value = envEntries.get(key) ?? ""
      envEntries.delete(key)
      return `${key}=${formatEnvValue(value)}`
    })

    const appended = Array.from(envEntries.entries()).map(([key, value]) => `${key}=${formatEnvValue(value)}`)
    const newContent = [...updatedLines, ...appended].filter((line, idx, arr) => line !== "" || idx < arr.length - 1)

    await fs.writeFile(envPath, `${newContent.join("\n").trimEnd()}\n`, "utf8")

    return NextResponse.json({ ok: true, path: envPath })
  } catch (error) {
    console.error("Failed to save install config", error)
    return NextResponse.json({ error: "Unable to save configuration" }, { status: 500 })
  }
}
