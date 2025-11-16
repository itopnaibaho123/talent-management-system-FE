"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { db } from "@/lib/db"
import { getAssignedRatees } from "@/lib/utils/assessment-helper"
import { toast } from "sonner"
import type { User, Assessment360 } from "@/lib/types"

export default function EmployeeAssessmentPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [assessments, setAssessments] = useState<Assessment360[]>([])
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment360 | null>(null)
  const [selectedRatee, setSelectedRatee] = useState<{
    id: string
    name: string
    type: "self" | "upward" | "downward" | "peer"
  } | null>(null)
  const [answers, setAnswers] = useState<{ [key: string]: number }>({})
  const [submitted, setSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false) // added loading state

  useEffect(() => {
    const user = localStorage.getItem("currentUser")
    if (user) {
      const userData = JSON.parse(user)
      setCurrentUser(userData)
      const active = db.getAssessments().filter((a) => a.status === "Ongoing")
      setAssessments(active)
    }
  }, [])

  const handleAssessmentSelect = (assessment: Assessment360) => {
    setSelectedAssessment(assessment)
    setSelectedRatee(null)
    setAnswers({})
    setSubmitted(false)
  }

  const handleRateeSelect = (id: string, name: string, type: "self" | "upward" | "downward" | "peer") => {
    setSelectedRatee({ id, name, type })
    setAnswers({})
    setSubmitted(false)
  }

  const handleScoreChange = (questionId: string, score: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: score }))
  }

  const handleSubmit = async () => {
    if (!currentUser || !selectedAssessment || !selectedRatee) {
      console.log("[v0] Missing data:", {
        currentUser: !!currentUser,
        selectedAssessment: !!selectedAssessment,
        selectedRatee: !!selectedRatee,
      })
      toast.error("Error", { description: "Data tidak lengkap" })
      return
    }

    const confirmed = window.confirm(`Are you sure you want to save the rating for ${selectedRatee?.name}?`)
    if (!confirmed) {
      console.log("[v0] User cancelled submission")
      return
    }

    setIsLoading(true)
    console.log("[v0] Starting submission for", selectedRatee.name)

    try {
      console.log("[v0] Current answers:", answers)
      console.log("[v0] Assessment questions:", selectedAssessment.questions.length)

      const response = {
        id: `resp_${Date.now()}`,
        assessmentId: selectedAssessment.id,
        rateeId: selectedRatee.id,
        rateerId: currentUser.id,
        raterType: selectedRatee.type,
        answers: selectedAssessment.questions.map((q) => ({
          questionId: q.id,
          score: answers[q.id] || 0,
        })),
      }

      console.log("[v0] Response object created:", response)

      const existingIndex = selectedAssessment.responses.findIndex(
        (r) => r.rateeId === selectedRatee.id && r.rateerId === currentUser.id && r.raterType === selectedRatee.type,
      )

      if (existingIndex >= 0) {
        console.log("[v0] Updating existing response at index", existingIndex)
        selectedAssessment.responses[existingIndex] = response
      } else {
        console.log("[v0] Adding new response")
        selectedAssessment.responses.push(response)
      }

      console.log("[v0] Before update - responses count:", selectedAssessment.responses.length)

      db.updateAssessment(selectedAssessment.id, {
        responses: selectedAssessment.responses,
      })

      console.log("[v0] Assessment updated in database")

      toast.success("Penilaian Berhasil Disimpan", {
        description: `Penilaian untuk ${selectedRatee.name} telah disimpan`,
        duration: 3000,
      })

      const updatedAssessment = db.getAssessmentById(selectedAssessment.id)
      if (updatedAssessment) {
        console.log("[v0] Assessment reloaded - responses count:", updatedAssessment.responses.length)
        setSelectedAssessment(updatedAssessment)
      }

      setSelectedRatee(null)
      setAnswers({})
      setSubmitted(false)
    } catch (error) {
      console.error("[v0] Error saving assessment:", error)
      toast.error("Gagal Menyimpan Penilaian", {
        description: error instanceof Error ? error.message : "Terjadi kesalahan saat menyimpan penilaian",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!currentUser) return null

  if (!selectedAssessment) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">360 Degree Assessment</h1>
            <p className="text-muted-foreground mt-1">Rate your coworkers</p>
          </div>

          <div className="grid gap-4">
            {assessments.length > 0 ? (
              assessments.map((assessment) => (
                <Card key={assessment.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-foreground">{assessment.name}</h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        {assessment.questions.length} question | {assessment.juries.length} participant
                      </p>
                    </div>
                    <Button onClick={() => handleAssessmentSelect(assessment)}>Start Assesment</Button>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-6">
                <p className="text-muted-foreground text-center">There is no ongoing assessment</p>
              </Card>
            )}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!selectedRatee) {
    const assignedRatees = getAssignedRatees(selectedAssessment.id, currentUser.id)

    const groupedRatees = {
      self: assignedRatees.filter((r) => r.type === "self"),
      upward: assignedRatees.filter((r) => r.type === "upward"),
      downward: assignedRatees.filter((r) => r.type === "downward"),
      peer: assignedRatees.filter((r) => r.type === "peer"),
    }

    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => {
                setSelectedAssessment(null)
                setSelectedRatee(null)
              }}
            >
              ← Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{selectedAssessment.name}</h1>
              <p className="text-muted-foreground mt-1">Select the person you want to rate</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Self Assessment */}
            {groupedRatees.self.map((ratee) => (
              <Card key={ratee.id} className="p-6">
                <h3 className="text-lg font-semibold mb-2 text-primary">Self Assesment</h3>
                <p className="text-sm text-muted-foreground mb-4">{db.getUserById(ratee.id)?.name || "You"}</p>
                <Button
                  onClick={() => handleRateeSelect(ratee.id, db.getUserById(ratee.id)?.name || "Self", "self")}
                  className="w-full"
                >
                  Start →
                </Button>
              </Card>
            ))}

            {/* Upward (Supervisor) */}
            {groupedRatees.upward.map((ratee) => (
              <Card key={ratee.id} className="p-6">
                <h3 className="text-lg font-semibold mb-2 text-accent">Penilaian ke Atasan</h3>
                <p className="text-sm text-muted-foreground mb-4">Nilai {db.getUserById(ratee.id)?.name || "Atasan"}</p>
                <Button
                  onClick={() => handleRateeSelect(ratee.id, db.getUserById(ratee.id)?.name || "Supervisor", "upward")}
                  className="w-full"
                >
                  Start →
                </Button>
              </Card>
            ))}

            {/* Downward (Subordinates) */}
            {groupedRatees.downward.map((ratee) => (
              <Card key={ratee.id} className="p-6">
                <h3 className="text-lg font-semibold mb-2 text-secondary">Assessment of Subordinates</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Score {db.getUserById(ratee.id)?.name || "Subordinates"}
                </p>
                <Button
                  onClick={() =>
                    handleRateeSelect(ratee.id, db.getUserById(ratee.id)?.name || "Subordinate", "downward")
                  }
                  className="w-full"
                >
                  Start →
                </Button>
              </Card>
            ))}

            {/* Peer */}
            {groupedRatees.peer.map((ratee) => (
              <Card key={ratee.id} className="p-6">
                <h3 className="text-lg font-semibold mb-2 text-foreground">Rate Peer</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Score {db.getUserById(ratee.id)?.name || "Peer"}
                </p>
                <Button
                  onClick={() => handleRateeSelect(ratee.id, db.getUserById(ratee.id)?.name || "Peer", "peer")}
                  className="w-full"
                >
                  Start →
                </Button>
              </Card>
            ))}
          </div>

          {assignedRatees.length === 0 && (
            <Card className="p-6">
              <p className="text-muted-foreground text-center">
                You are not assigned to assess anyone in this assessment.
              </p>
            </Card>
          )}
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setSelectedRatee(null)} disabled={isLoading}>
            ← Kembali
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Score {selectedRatee.type === "self" ? "Diri" : selectedRatee.name}
            </h1>
            <p className="text-muted-foreground mt-1">
              Type:{" "}
              {selectedRatee.type === "self"
                ? "Self-Assessment"
                : selectedRatee.type === "upward"
                  ? "Upward Feedback"
                  : selectedRatee.type === "downward"
                    ? "Downward Feedback"
                    : "Peer Feedback"}
            </p>
          </div>
        </div>

        {submitted && (
          <Card className="p-4 bg-green-50 border-green-200">
            <p className="text-green-700">Assessment saved successfully!</p>
          </Card>
        )}

        <Card className="p-6">
          <div className="space-y-6">
            {selectedAssessment.questions.map((question, idx) => (
              <div key={question.id} className="pb-6 border-b border-border last:border-0">
                <p className="text-sm font-semibold text-muted-foreground mb-2">Category: {question.category}</p>
                <p className="font-medium text-foreground mb-3">
                  {idx + 1}. {question.question}
                </p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <button
                      key={score}
                      onClick={() => handleScoreChange(question.id, score)}
                      disabled={isLoading} // disable buttons while loading
                      className={`w-10 h-10 rounded border-2 font-semibold transition-colors ${
                        answers[question.id] === score
                          ? "bg-primary text-white border-primary"
                          : "border-border hover:border-primary text-muted-foreground"
                      } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      {score}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setSelectedRatee(null)} disabled={isLoading}>
            Batal
          </Button>
          <Button
            onClick={() => handleSubmit()}
            disabled={Object.keys(answers).length !== selectedAssessment.questions.length || isLoading}
          >
            {isLoading ? "Saving..." : "Save Ratings"}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  )
}
