"use client"

import type React from "react"
import { Breadcrumb } from "@/components/common/breadcrumb"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "./navbar"
import { Sidebar } from "./sidebar"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  useEffect(() => {
    const user = localStorage.getItem("currentUser")
    if (!user) {
      router.push("/")
    }
  }, [router])

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <Breadcrumb />
          {children}
        </main>
      </div>
    </div>
  )
}
