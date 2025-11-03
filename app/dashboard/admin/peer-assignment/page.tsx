"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { db } from "@/lib/db"
import type { User, PeerAssignment } from "@/lib/types"

export default function PeerAssignmentPage() {
  const [employees, setEmployees] = useState<User[]>([])
  const [peerAssignments, setPeerAssignments] = useState<PeerAssignment[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState("")
  const [selectedPeers, setSelectedPeers] = useState<string[]>([])

  useEffect(() => {
    loadData()
    const interval = setInterval(() => {
      loadData()
    }, 500)
    return () => clearInterval(interval)
  }, [])

  const loadData = () => {
    const emps = db.getUsers().filter((u) => u.role === "employee")
    setEmployees(emps)
    setPeerAssignments(db.getPeerAssignments())
  }

  const handleAssignPeers = () => {
    if (!selectedEmployee) {
      alert("Please select an employee")
      return
    }

    const assignment: PeerAssignment = {
      employeeId: selectedEmployee,
      peerIds: selectedPeers,
      assignedAt: new Date(),
    }

    db.addPeerAssignment(assignment)
    loadData()
    setSelectedEmployee("")
    setSelectedPeers([])
  }

  const handlePeerToggle = (id: string) => {
    setSelectedPeers((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]))
  }

  const handleDelete = (employeeId: string) => {
    if (confirm("Delete this peer assignment?")) {
      db.deletePeerAssignment(employeeId)
      loadData()
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Peer Assignment</h1>
          <p className="text-muted-foreground mt-1">Assign peer groups for 360 feedback</p>
        </div>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-6">Assign Peers</h2>

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
              <label className="block text-sm font-medium mb-3">Select Peers (Rekan Kerja)</label>
              <div className="space-y-2 p-3 border border-border rounded-lg bg-muted/30">
                {employees
                  .filter((e) => e.id !== selectedEmployee)
                  .map((emp) => (
                    <label key={emp.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedPeers.includes(emp.id)}
                        onChange={() => handlePeerToggle(emp.id)}
                        className="rounded"
                      />
                      <span className="text-sm">{emp.name}</span>
                    </label>
                  ))}
              </div>
            </div>

            <Button onClick={handleAssignPeers} className="w-full bg-primary hover:bg-primary/90">
              Save Peer Assignment
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Current Peer Assignments</h2>
          <div className="space-y-3">
            {peerAssignments.length === 0 ? (
              <p className="text-muted-foreground text-sm">No peer assignments created yet</p>
            ) : (
              peerAssignments.map((pa) => {
                const employee = employees.find((e) => e.id === pa.employeeId)
                return (
                  <div
                    key={pa.employeeId}
                    className="p-3 border border-border rounded-lg flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold text-foreground">{employee?.name}</p>
                      {pa.peerIds.length > 0 ? (
                        <p className="text-sm text-muted-foreground">
                          Peers: {pa.peerIds.map((id) => employees.find((e) => e.id === id)?.name).join(", ")}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground">No peers assigned</p>
                      )}
                    </div>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(pa.employeeId)}>
                      Delete
                    </Button>
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
