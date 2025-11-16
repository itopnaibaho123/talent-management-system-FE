"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { db } from "@/lib/db"
import { showToast } from "@/lib/utils/toast-helper"
import { ConfirmationModal } from "@/components/common/confirmation-modal"
import type { User, Competency, EmployeeCompetency } from "@/lib/types"

export default function EmployeeCompetenciesPage() {
  const [employees, setEmployees] = useState<User[]>([])
  const [competencies, setCompetencies] = useState<Competency[]>([])
  const [employeeCompetencies, setEmployeeCompetencies] = useState<EmployeeCompetency[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState("")
  const [showConfirmAdd, setShowConfirmAdd] = useState(false)
  const [confirmData, setConfirmData] = useState<{ competencyId: string; competencyName: string } | null>(null)
  const [showConfirmRemove, setShowConfirmRemove] = useState(false)
  const [removeCompId, setRemoveCompId] = useState("")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    setEmployees(db.getUsers().filter((u) => u.role === "employee"))
    setCompetencies(db.getCompetencies())
    setEmployeeCompetencies(db.getEmployeeCompetencies())
  }

  const handleAddCompetency = (competencyId: string) => {
    if (!selectedEmployee) {
      showToast.error("Error", "Silakan pilih employee terlebih dahulu")
      return
    }

    const exists = employeeCompetencies.some(
      (ec) => ec.employeeId === selectedEmployee && ec.competencyId === competencyId,
    )

    if (exists) {
      showToast.error("Error", "Kompetensi ini sudah ditambahkan untuk employee ini")
      return
    }

    const comp = competencies.find((c) => c.id === competencyId)
    setConfirmData({ competencyId, competencyName: comp?.name || "" })
    setShowConfirmAdd(true)
  }

  const confirmAddCompetency = () => {
    if (!confirmData || !selectedEmployee) return

    db.addEmployeeCompetency({
      employeeId: selectedEmployee,
      competencyId: confirmData.competencyId,
      addedAt: new Date(),
    })

    showToast.success("Berhasil", `Kompetensi "${confirmData.competencyName}" telah ditambahkan`)
    loadData()
    setShowConfirmAdd(false)
    setConfirmData(null)
  }

  const handleRemoveCompetency = (competencyId: string) => {
    setRemoveCompId(competencyId)
    setShowConfirmRemove(true)
  }

  const confirmRemoveCompetency = () => {
    db.deleteEmployeeCompetency(selectedEmployee, removeCompId)
    const comp = competencies.find((c) => c.id === removeCompId)
    showToast.success("Berhasil", `Kompetensi "${comp?.name}" telah dihapus`)
    loadData()
    setShowConfirmRemove(false)
    setRemoveCompId("")
  }

  const selectedEmployeeData = employees.find((e) => e.id === selectedEmployee)
  const selectedEmployeeComps = employeeCompetencies.filter((ec) => ec.employeeId === selectedEmployee)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Employee Competencies</h1>
          <p className="text-muted-foreground mt-1">Manage skills and competencies for employees</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1 p-6">
            <h2 className="text-lg font-semibold mb-4">Select Employee</h2>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground mb-4"
            >
              <option value="">-- Choose Employee --</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
                </option>
              ))}
            </select>

            {selectedEmployee && (
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Selected:</p>
                  <p className="font-semibold text-foreground">{selectedEmployeeData?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Current Competencies:</p>
                  {selectedEmployeeComps.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">None assigned</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedEmployeeComps.map((ec) => {
                        const comp = competencies.find((c) => c.id === ec.competencyId)
                        return (
                          <div key={ec.competencyId} className="flex items-center justify-between p-2 bg-muted rounded">
                            <span className="text-sm font-medium text-foreground">{comp?.name}</span>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRemoveCompetency(ec.competencyId)}
                            >
                              ✕
                            </Button>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </Card>

          <Card className="lg:col-span-2 p-6">
            <h2 className="text-lg font-semibold mb-4">Available Competencies</h2>
            {selectedEmployee ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {competencies.map((comp) => {
                  const isAssigned = selectedEmployeeComps.some((ec) => ec.competencyId === comp.id)
                  return (
                    <div
                      key={comp.id}
                      className={`p-4 border rounded-lg ${isAssigned ? "bg-secondary/10 border-secondary" : "border-border"}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-foreground">{comp.name}</h3>
                        <Button
                          size="sm"
                          onClick={() => handleAddCompetency(comp.id)}
                          disabled={isAssigned}
                          className={isAssigned ? "" : "bg-primary hover:bg-primary/90"}
                        >
                          {isAssigned ? "Added" : "Add"}
                        </Button>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <p className="mb-2">Trainings:</p>
                        <div className="flex flex-wrap gap-1">
                          {comp.trainings.map((t, i) => (
                            <span key={i} className="px-2 py-1 bg-muted rounded text-xs">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">Select an employee to manage their competencies</p>
            )}
          </Card>
        </div>
      </div>

      <ConfirmationModal
        open={showConfirmAdd}
        title="Konfirmasi Penambahan Kompetensi"
        description={`Apakah Anda yakin ingin menambahkan kompetensi "${confirmData?.competencyName}" untuk employee ini?`}
        confirmText="Ya, Tambahkan"
        cancelText="Batal"
        onConfirm={confirmAddCompetency}
        onCancel={() => {
          setShowConfirmAdd(false)
          setConfirmData(null)
        }}
      />

      <ConfirmationModal
        open={showConfirmRemove}
        title="Konfirmasi Penghapusan Kompetensi"
        description="Apakah Anda yakin ingin menghapus kompetensi ini dari employee?"
        confirmText="Ya, Hapus"
        cancelText="Batal"
        onConfirm={confirmRemoveCompetency}
        onCancel={() => setShowConfirmRemove(false)}
      />
    </DashboardLayout>
  )
}
