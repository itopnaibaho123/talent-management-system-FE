"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card } from "@/components/ui/card"
import { db } from "@/lib/db"
import type { User, Assessment360 } from "@/lib/types"

export default function AssessmentResultsPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [assessments, setAssessments] = useState<Assessment360[]>([])
  const [employees, setEmployees] = useState<User[]>([])
  const [selectedAssessment, setSelectedAssessment] = useState<string | null>(null)

  useEffect(() => {
    const user = localStorage.getItem("currentUser")
    if (user) {
      const userData = JSON.parse(user)
      setCurrentUser(userData)

      const allAssessments = db.getAssessments()
      const relevantAssessments = allAssessments.filter(
        (a) => a.juries && a.juries.some((jury) => jury.rateeId === userData.id),
      )

      setAssessments(relevantAssessments)
      setEmployees(db.getUsers().filter((u) => u.role === "employee"))

      if (relevantAssessments.length > 0) {
        setSelectedAssessment(relevantAssessments[0].id)
      }
    }
  }, [])

  const assessment = assessments.find((a) => a.id === selectedAssessment)

  const calculateScoresByRaterType = () => {
    if (!assessment || !currentUser) return null

    const responses = db.getAssessmentResponsesByRatee(assessment.id, currentUser.id)

    const scoresByType: Record<string, { scores: number[]; count: number; average: number }> = {
      self: { scores: [], count: 0, average: 0 },
      peer: { scores: [], count: 0, average: 0 },
      upward: { scores: [], count: 0, average: 0 },
      downward: { scores: [], count: 0, average: 0 },
    }

    responses.forEach((response) => {
      const avgScore = response.answers.reduce((sum: number, a: any) => sum + a.score, 0) / response.answers.length
      const raterType = response.raterType
      if (scoresByType[raterType]) {
        scoresByType[raterType].scores.push(avgScore)
        scoresByType[raterType].count++
      }
    })

    // Calculate averages
    Object.keys(scoresByType).forEach((type) => {
      if (scoresByType[type].scores.length > 0) {
        scoresByType[type].average =
          Math.round((scoresByType[type].scores.reduce((a, b) => a + b, 0) / scoresByType[type].count) * 10) / 10
      }
    })

    return scoresByType
  }

  const generateScores = () => {
    if (!assessment) return null

    const scores = assessment.questions.map(() => Math.floor(Math.random() * 30) + 65)
    const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)

    return { scores, avgScore }
  }

  const scoresByType = calculateScoresByRaterType()
  const results = selectedAssessment ? generateScores() : null

  const raterTypeLabels: Record<string, string> = {
    self: "Self Assessment",
    peer: "Peer Feedback",
    upward: "Supervisor Feedback",
    downward: "Subordinate Feedback",
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">360 Assessment Results</h1>
          <p className="text-muted-foreground mt-1">View your feedback from peers, supervisors, and subordinates</p>
        </div>

        {assessments.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No assessments available for you yet</p>
          </Card>
        ) : (
          <>
            <div>
              <label className="text-sm font-medium">Select Assessment Period</label>
              <select
                value={selectedAssessment || ""}
                onChange={(e) => setSelectedAssessment(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground mt-1"
              >
                <option value="">-- Select Period --</option>
                {assessments.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>

            {assessment && results && (
              <div className="space-y-6">
                <Card className="p-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">Overall Score</p>
                    <p className="text-5xl font-bold text-primary mb-2">{results.avgScore}</p>
                    <p className="text-foreground">{assessment.name}</p>
                  </div>
                </Card>

                {scoresByType && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Object.entries(scoresByType).map(([type, data]) => (
                      <Card key={type} className="p-4">
                        <p className="text-xs text-muted-foreground mb-1 uppercase">{raterTypeLabels[type]}</p>
                        <p className="text-3xl font-bold text-secondary mb-1">{data.average || "-"}</p>
                        <p className="text-xs text-muted-foreground">
                          {data.count} {data.count === 1 ? "rater" : "raters"}
                        </p>
                      </Card>
                    ))}
                  </div>
                )}

                <Card className="p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-4">Category Breakdown</h2>
                  <div className="space-y-4">
                    {assessment.questions.map((q, idx) => (
                      <div key={q.id}>
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="text-sm font-medium text-foreground">{q.question}</p>
                            <p className="text-xs text-muted-foreground">{q.category}</p>
                          </div>
                          <p className="text-lg font-bold text-accent">{results.scores[idx]}/100</p>
                        </div>
                        <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                          <div className="h-full bg-accent" style={{ width: `${results.scores[idx]}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-6 bg-secondary/5 border-secondary/20">
                  <h2 className="text-lg font-semibold text-foreground mb-3">Insights</h2>
                  <ul className="space-y-2 text-sm text-foreground">
                    <li className="flex gap-2">
                      <span className="text-accent">✓</span>
                      Strong performance with consistent feedback across evaluators
                    </li>
                    <li className="flex gap-2">
                      <span className="text-accent">✓</span>
                      Focus on developing areas identified in lower-scored categories
                    </li>
                    <li className="flex gap-2">
                      <span className="text-accent">✓</span>
                      Consider leveraging your strengths in upcoming projects
                    </li>
                  </ul>
                </Card>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
