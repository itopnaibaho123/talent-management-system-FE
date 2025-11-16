"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import type { User } from "@/lib/types"

export function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser")
    if (currentUser) {
      setUser(JSON.parse(currentUser))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("currentUser")
    router.push("/")
  }

  if (!user) return null

  const roleLabels: Record<string, string> = {
    admin: "Administrator",
    "hr-development": "HR Pengembangan",
    "hr-assessment": "HR Penilaian",
    employee: "Pegawai",
    "user-manajemen": "User Manajemen",
  }

  return (
    <nav className="border-b border-border bg-card shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-primary">SMT</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm">
            <p className="font-medium text-foreground">{user.name}</p>
            <p className="text-xs text-muted-foreground">{roleLabels[user.role]}</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>
    </nav>
  )
}
