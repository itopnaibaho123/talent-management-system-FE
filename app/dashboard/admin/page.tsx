"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card } from "@/components/ui/card"
import { db } from "@/lib/db"

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEmployees: 0,
    totalJobs: 0,
    totalAssessments: 0,
  })

  useEffect(() => {
    const users = db.getUsers()
    const jobs = db.getJobs()
    const assessments = db.getAssessments()
    const employees = users.filter((u) => u.role === "employee")

    setStats({
      totalUsers: users.length,
      totalEmployees: employees.length,
      totalJobs: jobs.length,
      totalAssessments: assessments.length,
    })
  }, [])

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Kelola semua aspek sistem manajemen talenta</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-1">Total Users</p>
            <p className="text-3xl font-bold text-primary">{stats.totalUsers}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-1">Total Employees</p>
            <p className="text-3xl font-bold text-secondary">{stats.totalEmployees}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-1">Total Jobs</p>
            <p className="text-3xl font-bold text-accent">{stats.totalJobs}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-1">Total Assessments</p>
            <p className="text-3xl font-bold text-primary">{stats.totalAssessments}</p>
          </Card>
        </div>

        <Card className="p-6">
          <h2 className="text-xl font-bold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-border rounded-lg">
              <h3 className="font-semibold text-foreground mb-2">Create Employee</h3>
              <p className="text-sm text-muted-foreground mb-3">Add new employee to the system</p>
              <a href="/dashboard/admin/users" className="text-primary text-sm font-medium hover:underline">
                Manage →
              </a>
            </div>
            <div className="p-4 border border-border rounded-lg">
              <h3 className="font-semibold text-foreground mb-2">Assign Hierarchy</h3>
              <p className="text-sm text-muted-foreground mb-3">Set supervisor and subordinate relationships</p>
              <a href="/dashboard/admin/hierarchy" className="text-primary text-sm font-medium hover:underline">
                Configure →
              </a>
            </div>
            <div className="p-4 border border-border rounded-lg">
              <h3 className="font-semibold text-foreground mb-2">Assign Peers</h3>
              <p className="text-sm text-muted-foreground mb-3">Assign peer groups for 360 feedback</p>
              <a href="/dashboard/admin/peer-assignment" className="text-primary text-sm font-medium hover:underline">
                Configure →
              </a>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
