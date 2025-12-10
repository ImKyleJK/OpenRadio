export type UserRole = "listener" | "dj" | "writer" | "staff" | "admin"

export interface User {
  id: string
  email: string
  displayName: string
  avatar?: string
  bio?: string
  role: UserRole
  socialLinks?: {
    twitter?: string
    instagram?: string
    website?: string
  }
  createdAt: string
  lastActive?: string
}

export interface Session {
  user: User
  expires: string
}

export function hasRole(user: User | null, allowedRoles: UserRole[]): boolean {
  if (!user) return false
  return allowedRoles.includes(user.role)
}

export function canAccessStaff(user: User | null): boolean {
  return hasRole(user, ["dj", "writer", "staff", "admin"])
}

export function canManageUsers(user: User | null): boolean {
  return hasRole(user, ["admin"])
}

export function canWriteArticles(user: User | null): boolean {
  return hasRole(user, ["writer", "staff", "admin"])
}

export function canManageShows(user: User | null): boolean {
  return hasRole(user, ["dj", "staff", "admin"])
}
