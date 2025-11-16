"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card } from "@/components/ui/card"
import { db } from "@/lib/db"

export default function HRAssessmentDashboard() {
  const [stats, setStats] = useState({
    totalAssessments: 0,
    inProgress: 0,
    completed: 0,
  })

  useEffect(() => {
    const assessments = db.getAssessments()
    setStats({
      totalAssessments: assessments.length,
      inProgress: assessments.filter((a) => a.status === "Ongoing").length,
      completed: assessments.filter((a) => a.status === "Finish").length,
    })
  }, [])

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">HR Assessment Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage 360-degree assessments for performance evaluation</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-1">Total Assessments</p>
            <p className="text-3xl font-bold text-primary">{stats.totalAssessments}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-1">In Progress</p>
            <p className="text-3xl font-bold text-accent">{stats.inProgress}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-1">Completed</p>
            <p className="text-3xl font-bold text-secondary">{stats.completed}</p>
          </Card>
        </div>

        <Card className="p-6">
          <h2 className="text-xl font-bold text-foreground mb-4">360 Degree Assessment</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-border rounded-lg">
              <h3 className="font-semibold text-foreground mb-2">Create Assessment</h3>
              <p className="text-sm text-muted-foreground mb-3">Set up new 360 evaluation period</p>
              <a
                href="/dashboard/hr-assessment/assessments"
                className="text-primary text-sm font-medium hover:underline"
              >
                Create →
              </a>
            </div>
            <div className="p-4 border border-border rounded-lg">
              <h3 className="font-semibold text-foreground mb-2">View Results</h3>
              <p className="text-sm text-muted-foreground mb-3">Analyze assessment responses</p>
              <a href="/dashboard/hr-assessment/results" className="text-primary text-sm font-medium hover:underline">
                View →
              </a>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
