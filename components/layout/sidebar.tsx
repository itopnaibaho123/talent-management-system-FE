"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import type { User } from "@/lib/types"

const menuItems: Record<string, Array<{ label: string; href: string }>> = {
  admin: [
    { label: "Dashboard", href: "/dashboard/admin" },
    { label: "Manage Users", href: "/dashboard/admin/users" },
    { label: "Assign Hierarchy", href: "/dashboard/admin/hierarchy" },
    { label: "Assign Peers", href: "/dashboard/admin/peer-assignment" }, // Added peer assignment menu
  ],
  "hr-development": [
    { label: "Dashboard", href: "/dashboard/hr-development" },
    { label: "Jobs", href: "/dashboard/hr-development/jobs" },
    { label: "Job-Person Matching", href: "/dashboard/hr-development/job-matching" },
    { label: "Competencies", href: "/dashboard/hr-development/competencies" },
    { label: "Employee Competencies", href: "/dashboard/hr-development/employee-competencies" },
    { label: "Resignation Prediction", href: "/dashboard/hr-development/resignation" },
  ],
  "hr-assessment": [
    { label: "Dashboard", href: "/dashboard/hr-assessment" },
    { label: "Create Assessment", href: "/dashboard/hr-assessment/assessments" },
    { label: "Assessment Results", href: "/dashboard/hr-assessment/results" },
    { label: "Summary Results", href: "/dashboard/hr-assessment/summary" },
  ],
  employee: [
    { label: "Dashboard", href: "/dashboard/employee" },
    { label: "Person-Job Matching", href: "/dashboard/employee/person-matching" },
    { label: "Assessment Results", href: "/dashboard/employee/assessment-results" },
  ],
  "user-manajemen": [
    { label: "Dashboard", href: "/dashboard/user-management" },
    { label: "Job-Person Matching", href: "/dashboard/user-management/job-person-matches" },
    { label: "Resignation", href: "/dashboard/user-management/resignation" },
    { label: "training-recommendations", href: "/dashboard/user-management/training-recommendations" },
  ],
}

export function Sidebar() {
  const [user, setUser] = useState<User | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser")
    if (currentUser) {
      setUser(JSON.parse(currentUser))
    }
  }, [])

  if (!user) return null

  const items = menuItems[user.role] || []

  return (
    <aside className="w-64 border-r border-border bg-sidebar min-h-screen">
      <nav className="p-4 space-y-1">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "block px-4 py-2 rounded-lg text-sm transition-colors",
              pathname === item.href
                ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50",
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
