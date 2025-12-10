"use server"

import { redirect } from "next/navigation"
import InstallClient from "./install-client"
import { isSetupComplete } from "@/lib/setup"

export const dynamic = "force-dynamic"

export default async function InstallPage() {
  if (isSetupComplete()) {
    redirect("/")
  }

  return <InstallClient />
}
