import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth.server"
import { getActiveListeners, recordListenerStart, recordListenerStop } from "@/lib/listener-sessions"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  const listeners = await getActiveListeners()
  return NextResponse.json({ listeners })
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json().catch(() => ({}))
    const action = (body?.action as string) || "start"

    if (action === "stop") {
      await recordListenerStop(session.user.id)
    } else {
      await recordListenerStart(session.user)
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Listener session update failed", error)
    return NextResponse.json({ error: "Unable to update listener" }, { status: 500 })
  }
}
