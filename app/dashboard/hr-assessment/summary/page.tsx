"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card } from "@/components/ui/card"
import { db } from "@/lib/db"
import type { Assessment360, User } from "@/lib/types"

export default function SummaryPage() {
  const [assessments, setAssessments] = useState<Assessment360[]>([])
  const [employees, setEmployees] = useState<User[]>([])
  const [selectedAssessment, setSelectedAssessment] = useState("")

  useEffect(() => {
    setAssessments(db.getAssessments())
    setEmployees(db.getUsers().filter((u) => u.role === "employee"))
    const firstAssessment = db.getAssessments()[0]
    if (firstAssessment) {
      setSelectedAssessment(firstAssessment.id)
    }
  }, [])

  const assessment = assessments.find((a) => a.id === selectedAssessment)

  // Generate summary data
  const summaryData = employees
  .map ((employee) => {
    const score = Math.floor(Math.random() * 30) + 60
    return {
      employeeId: employee.id,
      name: employee.name,
      avgScore: score
    }
  })
  .sort((a, b) => b.avgScore - a.avgScore) || []
  

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Assessment Summary</h1>
          <p className="text-muted-foreground mt-1">Overview of all assessment results</p>
        </div>

        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="text-sm font-medium">Select Assessment Period</label>
            <select
              value={selectedAssessment}
              onChange={(e) => setSelectedAssessment(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground mt-1"
            >
              <option value="">-- Select Assessment --</option>
              {assessments.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {assessment && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-6">
                <p className="text-sm text-muted-foreground mb-1">Total Participants</p>
                <p className="text-3xl font-bold text-primary">{summaryData.length}</p>
              </Card>
              <Card className="p-6">
                <p className="text-sm text-muted-foreground mb-1">Assessment Status</p>
                <p
                  className={`text-lg font-bold ${assessment.status === "sedang berjalan" ? "text-accent" : "text-secondary"}`}
                >
                  {assessment.status}
                </p>
              </Card>
              <Card className="p-6">
                <p className="text-sm text-muted-foreground mb-1">Total Questions</p>
                <p className="text-3xl font-bold text-secondary">{assessment.questions.length}</p>
              </Card>
            </div>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Employee Scores</h2>
              <div className="space-y-3">
                {summaryData.map((data, idx) => (
                  <div
                    key={data.employeeId}
                    className="flex items-center justify-between p-3 border border-border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-accent/20 text-accent flex items-center justify-center font-semibold text-sm">
                        #{idx + 1}
                      </div>
                      <p className="font-medium text-foreground">{data.name}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-32 h-2 bg-border rounded-full overflow-hidden">
                        <div className="h-full bg-accent" style={{ width: `${data.avgScore}%` }} />
                      </div>
                      <p className="font-semibold text-accent min-w-fit">{data.avgScore}/100</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
