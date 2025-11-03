"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { db } from "@/lib/db"
import { generateDeterministicScore } from "@/lib/utils/matching"
import type { Job, User, JobPersonMatch } from "@/lib/types"

export default function JobMatchingPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [employees, setEmployees] = useState<User[]>([])
  const [matches, setMatches] = useState<JobPersonMatch[]>([])
  const [expandedJob, setExpandedJob] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    setJobs(db.getJobs())
    setEmployees(db.getUsers().filter((u) => u.role === "employee"))
    setMatches(db.getJobPersonMatches())
  }

  const handleCreateMatch = (jobId: string) => {
    // Check if match already exists for this job
    const existingMatch = matches.find((m) => m.jobId === jobId)
    if (existingMatch) {
      setExpandedJob(expandedJob === jobId ? null : jobId)
      return
    }

    // Generate deterministic matches
    const successors = employees
      .slice(0, Math.min(5, employees.length))
      .map((emp) => ({
        employeeId: emp.id,
        score: generateDeterministicScore("job-person", emp.id, jobId),
      }))
      .sort((a, b) => b.score - a.score)

    const newMatch: JobPersonMatch = {
      id: String(Date.now()),
      jobId,
      successors,
      createdAt: new Date(),
      deterministic: true,
    }

    db.addJobPersonMatch(newMatch)
    loadData()
    setExpandedJob(jobId)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Job-Person Matching</h1>
          <p className="text-muted-foreground mt-1">Find the best successor candidates for each job</p>
        </div>

        <div className="space-y-4">
          {jobs.map((job) => {
            const match = matches.find((m) => m.jobId === job.id)
            const isExpanded = expandedJob === job.id

            return (
              <Card key={job.id} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{job.name}</h3>
                    <p className="text-sm text-muted-foreground">{job.level}</p>
                  </div>
                  <Button onClick={() => handleCreateMatch(job.id)} className="bg-secondary hover:bg-secondary/90">
                    {match ? "View Match" : "Generate Match"}
                  </Button>
                </div>

                {isExpanded && match && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <h4 className="font-semibold text-foreground mb-3">Top Successors:</h4>
                    <div className="space-y-2">
                      {match.successors.map((successor, idx) => {
                        const emp = employees.find((e) => e.id === successor.employeeId)
                        return (
                          <div
                            key={successor.employeeId}
                            className="flex items-center justify-between p-3 bg-muted/30 rounded"
                          >
                            <div>
                              <p className="font-medium text-foreground">
                                #{idx + 1} - {emp?.name}
                              </p>
                              <p className="text-xs text-muted-foreground">{emp?.name}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-accent">{successor.score}%</p>
                              <div className="w-32 h-2 bg-border rounded-full overflow-hidden">
                                <div className="h-full bg-accent" style={{ width: `${successor.score}%` }} />
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </Card>
            )
          })}

          {jobs.length === 0 && (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No jobs available. Create jobs first to see matching results.</p>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
