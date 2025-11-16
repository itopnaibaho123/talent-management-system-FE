"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight } from "lucide-react"

export function Breadcrumb() {
  const pathname = usePathname()

  // Map routes to breadcrumb labels
  const breadcrumbMap: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/dashboard/admin": "Admin Dashboard",
    "/dashboard/admin/users": "Manage Users",
    "/dashboard/admin/hierarchy": "Assign Hierarchy",
    "/dashboard/admin/peer-assignment": "Assign Peers",
    "/dashboard/hr-development": "HR Development",
    "/dashboard/hr-development/jobs": "Jobs",
    "/dashboard/hr-development/job-matching": "Job-Person Matching",
    "/dashboard/hr-development/competencies": "Competencies",
    "/dashboard/hr-development/employee-competencies": "Employee Competencies",
    "/dashboard/hr-development/resignation": "Resignation Prediction",
    "/dashboard/hr-assessment": "HR Assessment",
    "/dashboard/hr-assessment/assessments": "Create Assessment",
    "/dashboard/hr-assessment/results": "Assessment Results",
    "/dashboard/hr-assessment/summary": "Summary Results",
    "/dashboard/employee": "Employee Dashboard",
    "/dashboard/employee/person-matching": "Person-Job Matching",
    "/dashboard/employee/assessment-results": "Assessment Results",
    "/dashboard/employee/assessment": "Assessment",
    "/dashboard/employee/riwayat": "Riwayat",
    "/dashboard/user-management": "User Management",
    "/dashboard/user-management/job-person-matches": "Job-Person Matches",
    "/dashboard/user-management/person-job-matches": "Person-Job Matches",
    "/dashboard/user-management/training-recommendations": "Training Recommendations",
  }

  // Generate breadcrumb items from pathname
  const pathSegments = pathname.split("/").filter(Boolean)
  const breadcrumbs: Array<{ label: string; href: string }> = []

  // Always start with home
  breadcrumbs.push({ label: "Home", href: "/" })

  // Build breadcrumb trail
  let currentPath = ""
  for (const segment of pathSegments) {
    currentPath += `/${segment}`
    const label = breadcrumbMap[currentPath] || segment.charAt(0).toUpperCase() + segment.slice(1)
    breadcrumbs.push({ label, href: currentPath })
  }

  if (breadcrumbs.length <= 1) return null

  return (
    <nav className="flex items-center gap-2 mb-6 text-sm" aria-label="Breadcrumb">
      {breadcrumbs.map((item, index) => (
        <div key={item.href} className="flex items-center gap-2">
          {index > 0 && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
          {index === breadcrumbs.length - 1 ? (
            <span className="text-foreground font-medium">{item.label}</span>
          ) : (
            <Link href={item.href} className="text-primary hover:underline">
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  )
}
