import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth.server"
import { updateBookingStatus, type BookingStatus } from "@/lib/bookings"
import { hasRole } from "@/lib/auth"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  const session = await getSession()
  if (!session || !hasRole(session.user, ["admin", "staff"])) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const status = body.status as BookingStatus
    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 })
    }
    const booking = await updateBookingStatus({ id: params.id, status, actedBy: session.user })
    return NextResponse.json({ booking })
  } catch (error) {
    console.error("Failed to update booking", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update booking" }, { status: 400 })
  }
}
