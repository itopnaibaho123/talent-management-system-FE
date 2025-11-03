"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card } from "@/components/ui/card"
import { db } from "@/lib/db"
import type { PersonJobMatch, Job, User } from "@/lib/types"

export default function PersonJobMatchesPage() {
  const [matches, setMatches] = useState<PersonJobMatch[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [employees, setEmployees] = useState<User[]>([])

  useEffect(() => {
    setMatches(db.getPersonJobMatches())
    setJobs(db.getJobs())
    setEmployees(db.getUsers().filter((u) => u.role === "employee"))
  }, [])

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Person-Job Matching Report</h1>
          <p className="text-muted-foreground mt-1">View all job opportunities recommended for each employee</p>
        </div>

        {matches.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No person-job matches generated yet</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {matches.map((match) => {
              const emp = employees.find((e) => e.id === match.employeeId)
              if (!emp) return null

              return (
                <Card key={match.employeeId} className="p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-4">{emp.name}</h2>
                  <div className="space-y-3">
                    {match.matchedJobs.map((jobMatch, idx) => {
                      const job = jobs.find((j) => j.id === jobMatch.jobId)
                      return (
                        <div key={jobMatch.jobId} className="p-4 border border-border rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="text-sm font-semibold text-foreground">
                                #{idx + 1} - {job?.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {job?.level} | Match: {jobMatch.score}%
                              </p>
                            </div>
                            <p className="text-lg font-bold text-accent">{jobMatch.score}%</p>
                          </div>
                          <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                            <div className="h-full bg-accent" style={{ width: `${jobMatch.score}%` }} />
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
