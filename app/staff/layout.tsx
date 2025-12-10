import type React from "react"
import { redirect } from "next/navigation"
import { getCurrentUser, canAccessStaff } from "@/lib/auth"
import { StaffSidebar } from "@/components/staff/staff-sidebar"
import { StaffHeader } from "@/components/staff/staff-header"

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()

  if (!user || !canAccessStaff(user)) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen flex">
      <StaffSidebar user={user} />
      <div className="flex-1 flex flex-col lg:ml-64">
        <StaffHeader user={user} />
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
