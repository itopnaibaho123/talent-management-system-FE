"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { db } from "@/lib/db"
import { generateDeterministicScore } from "@/lib/utils/matching"
import type { User, PersonJobMatch } from "@/lib/types"

export default function PersonMatchingPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [personJobMatch, setPersonJobMatch] = useState<PersonJobMatch | null>(null)
  const [hasGenerated, setHasGenerated] = useState(false)

  useEffect(() => {
    const user = localStorage.getItem("currentUser")
    if (user) {
      const userData = JSON.parse(user)
      setCurrentUser(userData)

      const existingMatch = db.getPersonJobMatchesByEmployee(userData.id)[0]
      if (existingMatch) {
        setPersonJobMatch(existingMatch)
        setHasGenerated(true)
      }
    }
  }, [])

  const handleGenerateMatch = () => {
    if (!currentUser) return

    const jobs = db.getJobs()
    if (jobs.length === 0) {
      alert("No jobs available in the system")
      return
    }

    // Generate person-job matches (up to 5 jobs)
    const matchedJobs = jobs
      .slice(0, Math.min(5, jobs.length))
      .map((job) => ({
        jobId: job.id,
        score: generateDeterministicScore("person-job", currentUser.id, job.id),
      }))
      .sort((a, b) => b.score - a.score)

    const newMatch: PersonJobMatch = {
      id: String(Date.now()),
      employeeId: currentUser.id,
      matchedJobs,
      createdAt: new Date(),
      deterministic: true,
    }

    // Also assign random competencies (up to 3)
    const competencies = db.getCompetencies()
    if (competencies.length > 0) {
      const selectedComps = competencies.slice(0, Math.min(3, competencies.length))

      selectedComps.forEach((comp) => {
        const exists = db.getEmployeeCompetenciesByEmployee(currentUser.id).some((ec) => ec.competencyId === comp.id)
        if (!exists) {
          db.addEmployeeCompetency({
            employeeId: currentUser.id,
            competencyId: comp.id,
            addedAt: new Date(),
          })
        }
      })
    }

    db.addPersonJobMatch(newMatch)
    setPersonJobMatch(newMatch)
    setHasGenerated(true)
  }

  if (!currentUser) return null

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Person-Job Matching</h1>
          <p className="text-muted-foreground mt-1">Discover job opportunities that match your profile</p>
        </div>

        {!hasGenerated ? (
          <Card className="p-8 text-center">
            <h2 className="text-xl font-semibold text-foreground mb-2">Ready to explore opportunities?</h2>
            <p className="text-muted-foreground mb-6">
              Generate personalized job recommendations based on your profile
            </p>
            <Button onClick={handleGenerateMatch} className="bg-primary hover:bg-primary/90">
              Generate My Matches
            </Button>
          </Card>
        ) : personJobMatch ? (
          <div className="space-y-4">
            <Card className="p-6 bg-accent/5 border-accent/20">
              <p className="text-sm text-muted-foreground mb-1">Recommendations Generated</p>
              <p className="text-lg text-foreground">
                {personJobMatch.matchedJobs.length} potential position
                {personJobMatch.matchedJobs.length !== 1 ? "s" : ""} identified
              </p>
            </Card>

            <div className="space-y-3">
              {personJobMatch.matchedJobs.map((match, idx) => {
                const job = db.getJobById(match.jobId)
                if (!job) return null

                return (
                  <Card key={match.jobId} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">{job.name}</h3>
                        <div className="flex gap-2 mt-1">
                          <span className="px-2 py-1 bg-muted rounded text-xs text-muted-foreground">#{idx + 1}</span>
                          <span className="px-2 py-1 bg-muted rounded text-xs text-muted-foreground">{job.level}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-accent">{match.score}%</p>
                        <p className="text-xs text-muted-foreground">Match Score</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                        <div className="h-full bg-accent" style={{ width: `${match.score}%` }} />
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Requirements:</p>
                      <p className="text-sm text-foreground line-clamp-2">{job.criteria}</p>
                    </div>
                  </Card>
                )
              })}
            </div>

            <Button onClick={handleGenerateMatch} variant="outline" className="w-full bg-transparent">
              Regenerate Matches
            </Button>
          </div>
        ) : null}
      </div>
    </DashboardLayout>
  )
}
