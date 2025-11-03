"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card } from "@/components/ui/card"
import { db } from "@/lib/db"
import type { User } from "@/lib/types"

export default function UserManagementPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [employees, setEmployees] = useState<User[]>([])
  const router = useRouter()

  useEffect(() => {
    const user = localStorage.getItem("currentUser")
    if (user) {
      const userData = JSON.parse(user)
      setCurrentUser(userData)

      // Check if user has access to this dashboard
      if (!["admin", "hr-development", "hr-assessment"].includes(userData.role)) {
        router.push("/dashboard/employee")
      }
    }

    setEmployees(db.getUsers().filter((u) => u.role === "employee"))
  }, [router])

  if (!currentUser || !["admin", "hr-development", "hr-assessment"].includes(currentUser.role)) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">User Management & Reports</h1>
          <p className="text-muted-foreground mt-1">
            Organization-wide overview of all matching results and recommendations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-1">Total Employees</p>
            <p className="text-3xl font-bold text-primary">{employees.length}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-1">Job-Person Matches</p>
            <p className="text-3xl font-bold text-secondary">{db.getJobPersonMatches().length}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-1">Person-Job Matches</p>
            <p className="text-3xl font-bold text-accent">{db.getPersonJobMatches().length}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-1">Total Competencies</p>
            <p className="text-3xl font-bold text-primary">{db.getCompetencies().length}</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Quick Reports</h2>
            <div className="space-y-3">
              <a
                href="/dashboard/user-management/job-person-matches"
                className="block p-4 border border-border rounded-lg hover:bg-muted/50 transition"
              >
                <h3 className="font-semibold text-foreground mb-1">Job-Person Matches</h3>
                <p className="text-xs text-muted-foreground">All successor recommendations by job</p>
              </a>
              <a
                href="/dashboard/user-management/person-job-matches"
                className="block p-4 border border-border rounded-lg hover:bg-muted/50 transition"
              >
                <h3 className="font-semibold text-foreground mb-1">Person-Job Matches</h3>
                <p className="text-xs text-muted-foreground">All employee job recommendations</p>
              </a>
              <a
                href="/dashboard/user-management/training-recommendations"
                className="block p-4 border border-border rounded-lg hover:bg-muted/50 transition"
              >
                <h3 className="font-semibold text-foreground mb-1">Training Recommendations</h3>
                <p className="text-xs text-muted-foreground">All required competencies by employee</p>
              </a>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Key Metrics</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Employees with Competencies</p>
                <p className="text-2xl font-bold text-accent">
                  {new Set(db.getEmployeeCompetencies().map((ec) => ec.employeeId)).size} / {employees.length}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">High Resignation Risk</p>
                <p className="text-2xl font-bold text-secondary">
                  {db.getResignationPredictions().filter((p) => p.riskLevel === "tinggi").length}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Active Assessments</p>
                <p className="text-2xl font-bold text-primary">
                  {db.getAssessments().filter((a) => a.status === "sedang berjalan").length}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
