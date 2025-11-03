"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card } from "@/components/ui/card"
import { db } from "@/lib/db"
import type { User, PersonJobMatch, EmployeeCompetency, HierarchyAssignment } from "@/lib/types"

export default function EmployeeDashboard() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [hierarchy, setHierarchy] = useState<HierarchyAssignment | null>(null)
  const [personJobMatch, setPersonJobMatch] = useState<PersonJobMatch | null>(null)
  const [competencies, setCompetencies] = useState<EmployeeCompetency[]>([])
  const [stats, setStats] = useState({
    matchedJobs: 0,
    competencies: 0,
    hasSupervisor: false,
    hasSubordinates: 0,
  })

  useEffect(() => {
    const user = localStorage.getItem("currentUser")
    if (user) {
      const userData = JSON.parse(user)
      setCurrentUser(userData)

      const hier = db.getHierarchyByEmployee(userData.id)[0]
      setHierarchy(hier || null)

      const match = db.getPersonJobMatchesByEmployee(userData.id)[0]
      setPersonJobMatch(match || null)

      const comps = db.getEmployeeCompetenciesByEmployee(userData.id)
      setCompetencies(comps)

      setStats({
        matchedJobs: match?.matchedJobs.length || 0,
        competencies: comps.length,
        hasSupervisor: !!hier?.supervisorId,
        hasSubordinates: hier?.subordinateIds.length || 0,
      })
    }
  }, [])

  if (!currentUser) return null

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Selamat datang, {currentUser.name}</h1>
          <p className="text-muted-foreground mt-1">Dashboard pengembangan karir Anda</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-1">Potential Positions</p>
            <p className="text-3xl font-bold text-primary">{stats.matchedJobs}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-1">Your Competencies</p>
            <p className="text-3xl font-bold text-secondary">{stats.competencies}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-1">Supervisor</p>
            <p className="text-lg font-bold text-accent">{stats.hasSupervisor ? "Assigned" : "None"}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-1">Subordinates</p>
            <p className="text-3xl font-bold text-primary">{stats.hasSubordinates}</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Hierarchy Information</h2>
            <div className="space-y-3">
              {hierarchy?.supervisorId ? (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Your Supervisor</p>
                  <p className="font-medium text-foreground">
                    {db.getUserById(hierarchy.supervisorId)?.name || "Unknown"}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">No supervisor assigned</p>
              )}

              {hierarchy?.subordinateIds.length || 0 > 0 ? (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Your Team</p>
                  <div className="space-y-1">
                    {hierarchy?.subordinateIds.map((subId) => (
                      <p key={subId} className="text-sm text-foreground">
                        • {db.getUserById(subId)?.name}
                      </p>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </Card>

          <Card className="p-6 lg:col-span-2">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <a
                href="/dashboard/employee/person-matching"
                className="p-4 border border-border rounded-lg hover:bg-muted/50 transition"
              >
                <h3 className="font-semibold text-foreground mb-1">Find Job Opportunities</h3>
                <p className="text-xs text-muted-foreground">Discover suitable positions</p>
              </a>
              <a
                href="/dashboard/employee/assessment-results"
                className="p-4 border border-border rounded-lg hover:bg-muted/50 transition"
              >
                <h3 className="font-semibold text-foreground mb-1">View 360 Results</h3>
                <p className="text-xs text-muted-foreground">Check your feedback scores</p>
              </a>
              <a
                href="/dashboard/employee/assessment"
                className="p-4 border border-border rounded-lg hover:bg-muted/50 transition"
              >
                <h3 className="font-semibold text-foreground mb-1">Give Assessment</h3>
                <p className="text-xs text-muted-foreground">Berikan penilaian 360 derajat</p>
              </a>
            </div>
          </Card>
        </div>

        {competencies.length > 0 && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Your Competencies</h2>
            <div className="flex flex-wrap gap-2">
              {competencies.map((ec) => {
                const comp = db.getCompetencyById(ec.competencyId)
                return (
                  <div
                    key={ec.competencyId}
                    className="px-3 py-1 bg-secondary/20 text-secondary-foreground rounded-full text-sm font-medium"
                  >
                    {comp?.name}
                  </div>
                )
              })}
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
