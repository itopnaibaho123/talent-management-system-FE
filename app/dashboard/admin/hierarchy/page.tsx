"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { db } from "@/lib/db"
import type { User, HierarchyAssignment } from "@/lib/types"
import { showToast } from "@/lib/utils/toast-helper"

export default function HierarchyPage() {
  const [employees, setEmployees] = useState<User[]>([])
  const [hierarchies, setHierarchies] = useState<HierarchyAssignment[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState("")
  const [selectedSupervisor, setSelectedSupervisor] = useState("")
  const [selectedSubordinates, setSelectedSubordinates] = useState<string[]>([])

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      loadData()
    }, 500)

    return () => clearInterval(interval)
  }, [])

  const loadData = () => {
    const emps = db.getUsers().filter((u) => u.role === "employee")
    setEmployees(emps)
    setHierarchies(db.getHierarchyAssignments())
  }

  const handleAssignHierarchy = () => {
    if (!selectedEmployee) {
      showToast.error("Validation Error", "Please select an employee")
      return
    }

    const existingHierarchy = hierarchies.find((h) => h.employeeId === selectedEmployee)

    const newAssignment: HierarchyAssignment = {
      employeeId: selectedEmployee,
      supervisorId: selectedSupervisor || undefined,
      subordinateIds: selectedSubordinates,
      assignedAt: new Date(),
    }

    if (existingHierarchy) {
      Object.assign(existingHierarchy, newAssignment)
    } else {
      db.addHierarchyAssignment(newAssignment)
    }

    loadData()
    const employeeName = employees.find((e) => e.id === selectedEmployee)?.name
    showToast.success("Success", `Hierarchy for ${employeeName} saved successfully`)

    setSelectedEmployee("")
    setSelectedSupervisor("")
    setSelectedSubordinates([])
  }

  const handleSubordinateToggle = (id: string) => {
    setSelectedSubordinates((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]))
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Hierarchy Assignment</h1>
          <p className="text-muted-foreground mt-1">Set supervisor and subordinate relationships</p>
        </div>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-6">Assign Hierarchy</h2>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">Select Employee</label>
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
              >
                <option value="">-- Choose Employee --</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Supervisor (Atasan)</label>
              <select
                value={selectedSupervisor}
                onChange={(e) => setSelectedSupervisor(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
              >
                <option value="">-- None --</option>
                {employees
                  .filter((e) => e.id !== selectedEmployee)
                  .map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-3">Subordinates (Bawahan)</label>
              <div className="space-y-2 p-3 border border-border rounded-lg bg-muted/30">
                {employees
                  .filter((e) => e.id !== selectedEmployee)
                  .map((emp) => (
                    <label key={emp.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedSubordinates.includes(emp.id)}
                        onChange={() => handleSubordinateToggle(emp.id)}
                        className="rounded"
                      />
                      <span className="text-sm">{emp.name}</span>
                    </label>
                  ))}
              </div>
            </div>

            <Button onClick={handleAssignHierarchy} className="w-full bg-primary hover:bg-primary/90">
              Save Hierarchy
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Current Hierarchies</h2>
          <div className="space-y-3">
            {hierarchies.length === 0 ? (
              <p className="text-muted-foreground text-sm">No hierarchies assigned yet</p>
            ) : (
              hierarchies.map((h) => {
                const employee = employees.find((e) => e.id === h.employeeId)
                const supervisor = employees.find((e) => e.id === h.supervisorId)
                return (
                  <div key={h.employeeId} className="p-3 border border-border rounded-lg">
                    <p className="font-semibold text-foreground">{employee?.name}</p>
                    {supervisor && <p className="text-sm text-muted-foreground">Atasan: {supervisor.name}</p>}
                    {h.subordinateIds.length > 0 && (
                      <p className="text-sm text-muted-foreground">
                        Bawahan: {h.subordinateIds.map((id) => employees.find((e) => e.id === id)?.name).join(", ")}
                      </p>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
