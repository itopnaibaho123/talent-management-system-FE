"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { db } from "@/lib/db"
import type { Assessment360, Question } from "@/lib/types"
import { showToast } from "@/lib/utils/toast-helper"
import { ConfirmationModal } from "@/components/common/confirmation-modal"

export default function AssessmentsPage() {
  const [assessments, setAssessments] = useState<Assessment360[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    startDate: "",
    endDate: "",
    questions: [] as Question[],
    inChargeIds: [] as string[],
  })
  const [currentQuestion, setCurrentQuestion] = useState({ question: "", category: "Kinerja", weight: 50 })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    setAssessments(db.getAssessments())
    const allEmployees = db.getUsers().filter((u) => u.role === "employee")
    setEmployees(allEmployees)
  }

  const handleAddQuestion = () => {
    if (currentQuestion.question.trim()) {
      const newQuestion: Question = {
        id: String(Date.now()),
        question: currentQuestion.question,
        category: currentQuestion.category,
        weight: currentQuestion.weight,
      }
      setFormData((prev) => ({
        ...prev,
        questions: [...prev.questions, newQuestion],
      }))
      setCurrentQuestion({ question: "", category: "Kinerja", weight: 50 })
      showToast.success("Success", "Question added successfully")
    }
  }

  const handleRemoveQuestion = (qId: string) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.filter((q) => q.id !== qId),
    }))
    showToast.success("Success", "Question removed")
  }

  const handleInChargeToggle = (employeeId: string) => {
    setFormData((prev) => ({
      ...prev,
      inChargeIds: prev.inChargeIds.includes(employeeId)
        ? prev.inChargeIds.filter((id) => id !== employeeId)
        : [...prev.inChargeIds, employeeId],
    }))
  }

  const validateAndConfirm = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.startDate || !formData.endDate || formData.questions.length === 0) {
      showToast.error("Validation Error", "Please fill all required fields and add at least one question")
      return
    }

    const startDate = new Date(formData.startDate)
    const endDate = new Date(formData.endDate)
    if (endDate <= startDate) {
      showToast.error("Date Error", "End date must be after start date")
      return
    }

    setShowConfirm(true)
  }

  const handleCreateAssessment = () => {
    const allEmployeesList = db.getUsers().filter((u) => u.role === "employee")

    const assessmentId = String(Date.now())

    const juries = allEmployeesList.map((employee) => {
      const hierarchy = db.getHierarchyByEmployee(employee.id)[0]
      const peerAssignment = db.getPeerAssignmentByEmployee(employee.id)

      return {
        assessmentId: assessmentId, // Use the correct assessment ID
        rateeId: employee.id,
        raterIds: {
          self: employee.id,
          upward: hierarchy?.supervisorId ? [hierarchy.supervisorId] : [],
          downward: hierarchy?.subordinateIds || [],
          peer: peerAssignment?.peerIds || [],
        },
      }
    })

    const newAssessment: Assessment360 = {
      id: assessmentId, // Use same ID
      name: formData.name,
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate),
      status: "sedang berjalan",
      questions: formData.questions,
      juries,
      responses: [],
      inChargeIds: formData.inChargeIds,
      createdAt: new Date(),
    }

    db.addAssessment(newAssessment)
    loadData()
    setFormData({
      name: "",
      startDate: "",
      endDate: "",
      questions: [],
      inChargeIds: [],
    })
    setShowForm(false)
    setShowConfirm(false)
    showToast.success("Success", `Assessment "${formData.name}" created with ${allEmployeesList.length} employees`)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">360 Assessments</h1>
            <p className="text-muted-foreground mt-1">Create and manage evaluation periods</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90" onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "Create Assessment"}
          </Button>
        </div>

        {showForm && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">Create New Assessment</h2>
            <form onSubmit={validateAndConfirm} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Assessment Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Q4 2024 Performance Review"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Start Date</label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">End Date</label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">Assign Responsibility (In Charge)</label>
                <p className="text-xs text-muted-foreground mb-3">
                  Select employees responsible for overseeing this assessment. All employees will automatically be
                  evaluated.
                </p>
                <div className="space-y-2 p-3 border border-border rounded-lg bg-muted/30 max-h-64 overflow-y-auto">
                  {employees.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No employees available</p>
                  ) : (
                    employees.map((emp) => (
                      <label key={emp.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.inChargeIds.includes(emp.id)}
                          onChange={() => handleInChargeToggle(emp.id)}
                          className="rounded"
                        />
                        <span className="text-sm">{emp.name}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">Assessment Questions</label>
                <div className="space-y-3 p-3 border border-border rounded-lg bg-muted/30 mb-4">
                  {formData.questions.map((q) => (
                    <div key={q.id} className="flex items-start justify-between p-2 bg-background rounded">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{q.question}</p>
                        <p className="text-xs text-muted-foreground">
                          {q.category} | Weight: {q.weight}
                        </p>
                      </div>
                      <Button size="sm" variant="destructive" onClick={() => handleRemoveQuestion(q.id)}>
                        ✕
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 p-4 border border-border rounded-lg bg-card">
                  <div>
                    <label className="text-sm font-medium">Question</label>
                    <textarea
                      value={currentQuestion.question}
                      onChange={(e) => setCurrentQuestion({ ...currentQuestion, question: e.target.value })}
                      placeholder="Enter assessment question"
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
                      rows={2}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium">Category</label>
                      <select
                        value={currentQuestion.category}
                        onChange={(e) => setCurrentQuestion({ ...currentQuestion, category: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
                      >
                        <option>Kinerja</option>
                        <option>Kepemimpinan</option>
                        <option>Kolaborasi</option>
                        <option>Inovasi</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Weight</label>
                      <Input
                        type="number"
                        min="1"
                        max="100"
                        value={currentQuestion.weight}
                        onChange={(e) => setCurrentQuestion({ ...currentQuestion, weight: Number(e.target.value) })}
                        className="text-sm"
                      />
                    </div>
                  </div>
                  <Button type="button" variant="outline" onClick={handleAddQuestion} className="w-full bg-transparent">
                    Add Question
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full bg-secondary hover:bg-secondary/90">
                Create Assessment (All Employees Auto-Assigned)
              </Button>
            </form>
          </Card>
        )}

        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Period</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">In Charge</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Employees</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Questions</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {assessments.map((assess) => (
                  <tr key={assess.id} className="border-b border-border hover:bg-muted/30">
                    <td className="px-6 py-4 text-sm font-medium text-foreground">{assess.name}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(assess.startDate).toLocaleDateString()} -{" "}
                      {new Date(assess.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          assess.status === "sedang berjalan"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                            : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        }`}
                      >
                        {assess.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {assess.inChargeIds && assess.inChargeIds.length > 0
                        ? assess.inChargeIds
                            .map((id) => db.getUserById(id)?.name)
                            .filter(Boolean)
                            .join(", ")
                        : "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">{assess.juries.length}</td>
                    <td className="px-6 py-4 text-sm text-foreground">{assess.questions.length}</td>
                    <td className="px-6 py-4 text-sm">
                      <Button size="sm" variant="outline">
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <ConfirmationModal
          open={showConfirm}
          title="Confirm Assessment Creation"
          description={`Create assessment "${formData.name}" with ${db.getUsers().filter((u) => u.role === "employee").length} employees? All employees will automatically be assigned to evaluate themselves, their peers, and supervisors.`}
          confirmText="Create Assessment"
          cancelText="Cancel"
          onConfirm={handleCreateAssessment}
          onCancel={() => setShowConfirm(false)}
        />
      </div>
    </DashboardLayout>
  )
}
