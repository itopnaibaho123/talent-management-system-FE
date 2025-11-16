"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { db } from "@/lib/db"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    const user = db.getUserByUsername(username)
    if (!user || user.password !== password) {
      setError("Username atau password salah")
      setIsLoading(false)
      return
    }

    // Store session
    localStorage.setItem("currentUser", JSON.stringify(user))

    // Redirect based on role
    const roleRoutes: Record<string, string> = {
      admin: "/dashboard/admin",
      "hr-development": "/dashboard/hr-development",
      "hr-assessment": "/dashboard/hr-assessment",
      employee: "/dashboard/employee",
      "user-manajemen": "/dashboard/user-management"
    }

    router.push(roleRoutes[user.role] || "/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">SMT</h1>
            <p className="text-muted-foreground">Sistem Manajemen Talenta</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Username</label>
              <Input
                type="text"
                placeholder="Masukkan username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <Input
                type="password"
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm p-3 rounded">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
              {isLoading ? "Loading..." : "Masuk"}
            </Button>
          </form>

          <div className="mt-8 p-4 bg-muted rounded-lg space-y-2 text-xs">
            <p className="font-semibold text-foreground">Demo Accounts:</p>
            <div>
              <p className="text-muted-foreground">
                <span className="font-medium">Admin:</span> admin / admin123
              </p>
              <p className="text-muted-foreground">
                <span className="font-medium">HR Dev:</span> HRPengembangan / HRPengembangan123
              </p>
              <p className="text-muted-foreground">
                <span className="font-medium">HR Assess:</span> HRPenilaian / HRPenilaian123
              </p>
              <p className="text-muted-foreground">
                <span className="font-medium">User Manajemen:</span> USERManajemen / USERManajemen123
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
