"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { db } from "@/lib/db"
import type { Job } from "@/lib/types"
import { showToast } from "@/lib/utils/toast-helper"

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ name: "", level: "", weight: 50, criteria: "" })
  const [isDisabled, setIsDisabled] = useState(true)

  useEffect(() => {
    loadJobs()
  }, [])

  useEffect(() => {
    const valid =
      formData.name.trim() !== "" &&
      formData.level.trim() !== "" &&
      formData.weight > 0;
      formData.criteria.trim() !== "";
  
    setIsDisabled(!valid);
    }, [formData]);

  const loadJobs = () => {
    setJobs(db.getJobs())
  }

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.level || !formData.criteria) {
      showToast.error("Validation Error", "Please fill all fields")
      return
    }

    const newJob: Job = {
      id: String(Date.now()),
      name: formData.name,
      level: formData.level,
      weight: Number(formData.weight),
      criteria: formData.criteria,
      createdAt: new Date(),
    }

    db.addJob(newJob)
    loadJobs()
    setFormData({ name: "", level: "", weight: 50, criteria: "" })
    setShowForm(false)
    showToast.success("Success", `Job position "${formData.name}" created successfully`)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Jobs Management</h1>
            <p className="text-muted-foreground mt-1">Create and manage job positions</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90" onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "Create Job"}
          </Button>
        </div>

        {showForm && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Create New Job</h2>
            <form onSubmit={handleCreateJob} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Job Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Software Engineer"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Level</label>
                <Input
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  placeholder="e.g., Senior"
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
              <div>
                <label className="text-sm font-medium">Criteria / Description</label>
                <textarea
                  value={formData.criteria}
                  onChange={(e) => setFormData({ ...formData, criteria: e.target.value })}
                  placeholder="Required skills and qualifications"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                  rows={4}
                />
              </div>
              <Button type="submit" className="w-full bg-secondary hover:bg-secondary/90" disabled={isDisabled}>
                Create Job
              </Button>
            </form>
          </Card>
        )}

        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Job Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Level</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Weight</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Criteria</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id} className="border-b border-border hover:bg-muted/30">
                    <td className="px-6 py-4 text-sm font-medium text-foreground">{job.name}</td>
                    <td className="px-6 py-4 text-sm text-foreground">{job.level}</td>
                    <td className="px-6 py-4 text-sm text-foreground">{job.weight}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground truncate max-w-xs">{job.criteria}</td>
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
      </div>
    </DashboardLayout>
  )
}
