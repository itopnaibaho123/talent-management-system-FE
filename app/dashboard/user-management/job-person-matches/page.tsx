"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card } from "@/components/ui/card"
import { db } from "@/lib/db"
import type { JobPersonMatch, Job, User } from "@/lib/types"

export default function JobPersonMatchesPage() {
  const [matches, setMatches] = useState<JobPersonMatch[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [employees, setEmployees] = useState<User[]>([])

  useEffect(() => {
    setMatches(db.getJobPersonMatches())
    setJobs(db.getJobs())
    setEmployees(db.getUsers().filter((u) => u.role === "employee"))
  }, [])

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Job-Person Matching Report</h1>
          <p className="text-muted-foreground mt-1">View all successor recommendations for each position</p>
        </div>

        {matches.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No job-person matches generated yet</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {matches.map((match) => {
              const job = jobs.find((j) => j.id === match.jobId)
              if (!job) return null

              return (
                <Card key={match.jobId} className="p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-4">
                    {job.name} ({job.level})
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {match.successors.slice(0, 5).map((successor, idx) => {
                      const emp = employees.find((e) => e.id === successor.employeeId)
                      return (
                        <div key={successor.employeeId} className="p-4 border border-border rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="text-sm font-medium text-foreground">{emp?.name}</p>
                              <p className="text-xs text-muted-foreground">Rank #{idx + 1}</p>
                            </div>
                            <p className="text-lg font-bold text-accent">{successor.score}%</p>
                          </div>
                          <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                            <div className="h-full bg-accent" style={{ width: `${successor.score}%` }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
