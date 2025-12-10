"use client"

import type { ReactNode } from "react"

import { AuthProvider } from "@/context/auth-context"
import { RadioProvider } from "@/context/radio-context"
import { StickyPlayer } from "@/components/sticky-player"
import { Toaster } from "@/components/ui/toaster"

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <RadioProvider>
        {children}
        <StickyPlayer />
      </RadioProvider>
      <Toaster />
    </AuthProvider>
  )
}
