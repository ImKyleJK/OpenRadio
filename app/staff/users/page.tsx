"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, Search, UserCog, Shield, Ban, CheckCircle } from "lucide-react"
import type { UserRole } from "@/lib/auth"

interface UserData {
  id: string
  email: string
  displayName: string
  avatar?: string
  role: UserRole
  status: "active" | "disabled"
  createdAt: string
  lastActive?: string
}

const mockUsers: UserData[] = [
  {
    id: "1",
    email: "admin@radio.com",
    displayName: "Station Admin",
    avatar: "/admin-avatar.png",
    role: "admin",
    status: "active",
    createdAt: "2024-01-01",
    lastActive: "2024-12-10",
  },
  {
    id: "2",
    email: "dj@radio.com",
    displayName: "DJ Luna",
    avatar: "/dj-avatar-female.jpg",
    role: "dj",
    status: "active",
    createdAt: "2024-02-15",
    lastActive: "2024-12-10",
  },
  {
    id: "3",
    email: "writer@radio.com",
    displayName: "Sarah Johnson",
    avatar: "/writer-avatar.png",
    role: "writer",
    status: "active",
    createdAt: "2024-03-01",
    lastActive: "2024-12-09",
  },
  {
    id: "4",
    email: "listener1@example.com",
    displayName: "John Doe",
    role: "listener",
    status: "active",
    createdAt: "2024-06-15",
    lastActive: "2024-12-08",
  },
  {
    id: "5",
    email: "listener2@example.com",
    displayName: "Jane Smith",
    role: "listener",
    status: "disabled",
    createdAt: "2024-07-20",
    lastActive: "2024-11-01",
  },
]

const roles: UserRole[] = ["listener", "dj", "writer", "staff", "admin"]

export default function UsersPage() {
  const [users, setUsers] = useState(mockUsers)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)

  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter === "all" || u.role === roleFilter
    const matchesSearch =
      u.displayName.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
    return matchesRole && matchesSearch
  })

  const updateUserRole = (userId: string, newRole: UserRole) => {
    setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)))
    setSelectedUser(null)
  }

  const toggleUserStatus = (userId: string) => {
    setUsers(users.map((u) => (u.id === userId ? { ...u, status: u.status === "active" ? "disabled" : "active" } : u)))
  }

  const roleColors: Record<UserRole, string> = {
    admin: "bg-red-500/20 text-red-400 border-red-500/30",
    staff: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    dj: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    writer: "bg-green-500/20 text-green-400 border-green-500/30",
    listener: "bg-muted text-muted-foreground border-border",
  }

  const stats = {
    total: users.length,
    admins: users.filter((u) => u.role === "admin").length,
    staff: users.filter((u) => ["dj", "writer", "staff"].includes(u.role)).length,
    listeners: users.filter((u) => u.role === "listener").length,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">Manage users, roles, and permissions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Users", value: stats.total, icon: Users },
          { label: "Admins", value: stats.admins, icon: Shield },
          { label: "Staff", value: stats.staff, icon: UserCog },
          { label: "Listeners", value: stats.listeners, icon: Users },
        ].map((stat, index) => (
          <Card key={index} className="glass-card border-border/50">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="glass-card border-border/50">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                All Users
              </CardTitle>
              <CardDescription>Manage user accounts and permissions</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 w-[200px]"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {roles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead className="hidden sm:table-cell">Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="hidden md:table-cell">Status</TableHead>
                <TableHead className="hidden lg:table-cell">Last Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.displayName} />
                        <AvatarFallback>{user.displayName.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.displayName}</p>
                        <p className="text-xs text-muted-foreground sm:hidden">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground">{user.email}</TableCell>
                  <TableCell>
                    <Badge className={roleColors[user.role]}>{user.role}</Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant={user.status === "active" ? "outline" : "secondary"}>
                      {user.status === "active" ? (
                        <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                      ) : (
                        <Ban className="h-3 w-3 mr-1 text-red-500" />
                      )}
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground">
                    {user.lastActive ? formatDate(user.lastActive) : "Never"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedUser(user)}>
                            <UserCog className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit User Role</DialogTitle>
                            <DialogDescription>Change the role for {selectedUser?.displayName}</DialogDescription>
                          </DialogHeader>
                          <div className="py-4">
                            <Select
                              value={selectedUser?.role}
                              onValueChange={(value) =>
                                selectedUser && updateUserRole(selectedUser.id, value as UserRole)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select role" />
                              </SelectTrigger>
                              <SelectContent>
                                {roles.map((role) => (
                                  <SelectItem key={role} value={role}>
                                    {role.charAt(0).toUpperCase() + role.slice(1)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setSelectedUser(null)}>
                              Cancel
                            </Button>
                            <Button onClick={() => setSelectedUser(null)}>Save Changes</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleUserStatus(user.id)}
                        className={user.status === "active" ? "text-red-500" : "text-green-500"}
                      >
                        {user.status === "active" ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredUsers.length === 0 && <div className="text-center py-8 text-muted-foreground">No users found</div>}
        </CardContent>
      </Card>
    </div>
  )
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
}
