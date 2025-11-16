"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card } from "@/components/ui/card"
import { db } from "@/lib/db"

export default function HRDevelopmentDashboard() {
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalCompetencies: 0,
    totalMatches: 0,
    totalEmployeesWithCompetencies: 0,
  })

  useEffect(() => {
    const jobs = db.getJobs()
    const competencies = db.getCompetencies()
    const jobPersonMatches = db.getJobPersonMatches()
    const employeeCompetencies = db.getEmployeeCompetencies()
    const uniqueEmployees = new Set(employeeCompetencies.map((ec) => ec.employeeId))

    setStats({
      totalJobs: jobs.length,
      totalCompetencies: competencies.length,
      totalMatches: jobPersonMatches.length,
      totalEmployeesWithCompetencies: uniqueEmployees.size,
    })
  }, [])

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">HR Dashboard Development</h1>
          <p className="text-muted-foreground mt-1">Manage jobs, competencies and talent development</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-1">Total Jobs</p>
            <p className="text-3xl font-bold text-primary">{stats.totalJobs}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-1">Total Competencies</p>
            <p className="text-3xl font-bold text-secondary">{stats.totalCompetencies}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-1">Job-Person Matches</p>
            <p className="text-3xl font-bold text-accent">{stats.totalMatches}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-1">Employees w/ Competencies</p>
            <p className="text-3xl font-bold text-primary">{stats.totalEmployeesWithCompetencies}</p>
          </Card>
        </div>

        <Card className="p-6">
          <h2 className="text-xl font-bold text-foreground mb-4">Talent Development</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-border rounded-lg">
              <h3 className="font-semibold text-foreground mb-2">Manage Jobs</h3>
              <p className="text-sm text-muted-foreground mb-3">Create job positions and criteria</p>
              <a href="/dashboard/hr-development/jobs" className="text-primary text-sm font-medium hover:underline">
                View Jobs →
              </a>
            </div>
            <div className="p-4 border border-border rounded-lg">
              <h3 className="font-semibold text-foreground mb-2">Manage Competencies</h3>
              <p className="text-sm text-muted-foreground mb-3">Define skills and trainings</p>
              <a
                href="/dashboard/hr-development/competencies"
                className="text-primary text-sm font-medium hover:underline"
              >
                View Competencies →
              </a>
            </div>
            <div className="p-4 border border-border rounded-lg">
              <h3 className="font-semibold text-foreground mb-2">Job-Person Matching</h3>
              <p className="text-sm text-muted-foreground mb-3">Match employees to jobs</p>
              <a
                href="/dashboard/hr-development/job-matching"
                className="text-primary text-sm font-medium hover:underline"
              >
                View Matches →
              </a>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
