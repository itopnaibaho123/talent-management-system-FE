"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card } from "@/components/ui/card"
import { db } from "@/lib/db"
import type { Assessment360, User } from "@/lib/types"

export default function ResultsPage() {
  const [assessments, setAssessments] = useState<Assessment360[]>([])
  const [employees, setEmployees] = useState<User[]>([])
  const [selectedAssessment, setSelectedAssessment] = useState("")
  const [selectedEmployee, setSelectedEmployee] = useState("")

  useEffect(() => {
    setAssessments(db.getAssessments())
    setEmployees(db.getUsers().filter((u) => u.role === "employee"))
  }, [])

  const assessment = assessments.find((a) => a.id === selectedAssessment)
  const employee = employees.find((e) => e.id === selectedEmployee)

  const calculateResults = () => {
    if (!assessment || !employee) return null

    const responses = db.getAssessmentResponsesByRatee(assessment.id, employee.id)

    if (responses.length === 0) {
      return null // No responses yet
    }

    // Group responses by question
    const questionScores: { [key: string]: number[] } = {}
    responses.forEach((response) => {
      response.answers.forEach((answer) => {
        if (!questionScores[answer.questionId]) {
          questionScores[answer.questionId] = []
        }
        questionScores[answer.questionId].push(answer.score)
      })
    })

    // Calculate average for each question
    const resultsByQuestion = assessment.questions.map((q) => {
      const scores = questionScores[q.id] || []
      const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
      const raterCount = scores.length
      return { question: q.question, avgScore, raterCount }
    })

    // Calculate overall average
    const allScores = Object.values(questionScores).flat()
    const overallAvg = allScores.length > 0 ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : 0

    return { resultsByQuestion, overallAvg, totalRaters: responses.length }
  }

  const results = calculateResults()

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Assessment Results</h1>
          <p className="text-muted-foreground mt-1">View aggregated assessment scores and feedback</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1 p-6">
            <h2 className="text-lg font-semibold mb-4">Filters</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Assessment Period</label>
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
              <div>
                <label className="text-sm font-medium">Employee</label>
                <select
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground mt-1"
                >
                  <option value="">-- Select Employee --</option>
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Card>

          <Card className="lg:col-span-2 p-6">
            {assessment && employee && results ? (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-1">{employee.name}</h2>
                  <p className="text-muted-foreground">{assessment.name}</p>
                </div>

                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">Overall Average Score</p>
                  <p className="text-4xl font-bold text-primary">{results.overallAvg}/100</p>
                  <p className="text-xs text-muted-foreground mt-2">From {results.totalRaters} raters</p>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-4">Question Scores (Averaged)</h3>
                  <div className="space-y-4">
                    {results.resultsByQuestion.map((item, idx) => (
                      <div key={idx}>
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium text-foreground">{item.question}</p>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-accent">{item.avgScore}/100</p>
                            <p className="text-xs text-muted-foreground">{item.raterCount} raters</p>
                          </div>
                        </div>
                        <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                          <div className="h-full bg-accent" style={{ width: `${item.avgScore}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : assessment && employee ? (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                No responses submitted yet for this employee
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                Select an assessment and employee to view results
              </div>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
