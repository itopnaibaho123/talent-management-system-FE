"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { db } from "@/lib/db"
import type { Competency } from "@/lib/types"
import { showToast } from "@/lib/utils/toast-helper"
import { ConfirmationModal } from "@/components/common/confirmation-modal"

export default function CompetenciesPage() {
  const [competencies, setCompetencies] = useState<Competency[]>([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ name: "", trainings: "", weight: 50 })
  const [showConfirm, setShowConfirm] = useState(false)
  const [isDisabled, setIsDisabled] = useState(true)

  useEffect(() => {
    loadCompetencies()
  }, [])

  useEffect(() => {
    const valid =
      formData.name.trim() !== "" &&
      formData.trainings.trim() !== "" &&
      formData.weight > 0;
  
    setIsDisabled(!valid);
    }, [formData]);

  const loadCompetencies = () => {
    setCompetencies(db.getCompetencies())
  }

  const handleCreateCompetency = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.trainings) {
      showToast.error("Validation Error", "Silakan isi semua field")
      return
    }
    setShowConfirm(true)
  }

  const confirmCreate = () => {
    const trainingsArray = formData.trainings.split(",").map((t) => t.trim())

    const newCompetency: Competency = {
      id: String(Date.now()),
      name: formData.name,
      trainings: trainingsArray,
      weight: Number(formData.weight),
      createdAt: new Date(),
    }

    db.addCompetency(newCompetency)
    loadCompetencies()
    showToast.success("Berhasil", `Kompetensi "${formData.name}" telah dibuat`)
    setFormData({ name: "", trainings: "", weight: 50 })
    setShowForm(false)
    setShowConfirm(false)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Competencies</h1>
            <p className="text-muted-foreground mt-1">Define skills and training requirements</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90" onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "Create Competency"}
          </Button>
        </div>

        {showForm && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Create New Competency</h2>
            <form onSubmit={handleCreateCompetency} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Competency Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Leadership"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Trainings (comma-separated)</label>
                <textarea
                  value={formData.trainings}
                  onChange={(e) => setFormData({ ...formData, trainings: e.target.value })}
                  placeholder="e.g., Leadership 101, Management Skills, Team Building"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                  rows={3}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Weight (Importance)</label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })}
                />
              </div>
              <Button type="submit" className="w-full bg-secondary hover:bg-secondary/90" disabled = {isDisabled}>
                Create Competency
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
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Trainings</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Weight</th>
                </tr>
              </thead>
              <tbody>
                {competencies.map((comp) => (
                  <tr key={comp.id} className="border-b border-border hover:bg-muted/30">
                    <td className="px-6 py-4 text-sm font-medium text-foreground">{comp.name}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      <div className="flex flex-wrap gap-1">
                        {comp.trainings.map((t, i) => (
                          <span key={i} className="px-2 py-1 bg-muted rounded text-xs">
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">{comp.weight}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <ConfirmationModal
        open={showConfirm}
        title="Confirmation of Competency Creation"
        description={`Are you sure you want to create a competency of "${formData.name}"?`}
        confirmText="Yes, Create"
        cancelText="Cancel"
        onConfirm={confirmCreate}
        onCancel={() => setShowConfirm(false)}
      />
    </DashboardLayout>
  )
}
