"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card } from "@/components/ui/card"
import { db } from "@/lib/db"
import type { User, EmployeeCompetency, Competency } from "@/lib/types"

export default function TrainingRecommendationsPage() {
  const [employees, setEmployees] = useState<User[]>([])
  const [employeeCompetencies, setEmployeeCompetencies] = useState<EmployeeCompetency[]>([])
  const [competencies, setCompetencies] = useState<Competency[]>([])

  useEffect(() => {
    setEmployees(db.getUsers().filter((u) => u.role === "employee"))
    setEmployeeCompetencies(db.getEmployeeCompetencies())
    setCompetencies(db.getCompetencies())
  }, [])

  const getEmployeeCompetencies = (empId: string) => {
    return employeeCompetencies.filter((ec) => ec.employeeId === empId)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Training Recommendations</h1>
          <p className="text-muted-foreground mt-1">Competencies and trainings assigned to all employees</p>
        </div>

        {employees.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No employees in the system</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {employees.map((emp) => {
              const empComps = getEmployeeCompetencies(emp.id)
              return (
                <Card key={emp.id} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-foreground">{emp.name}</h2>
                    <span className="text-sm text-muted-foreground px-3 py-1 bg-muted rounded">
                      {empComps.length} competencies
                    </span>
                  </div>

                  {empComps.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">No competencies assigned</p>
                  ) : (
                    <div className="space-y-3">
                      {empComps.map((ec) => {
                        const comp = competencies.find((c) => c.id === ec.competencyId)
                        return (
                          <div key={ec.competencyId} className="p-3 border border-border rounded-lg">
                            <h3 className="font-medium text-foreground mb-2">{comp?.name}</h3>
                            {comp?.trainings.length ||
                              (0 > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {comp?.trainings.map((training, idx) => (
                                    <span
                                      key={idx}
                                      className="px-2 py-1 bg-secondary/20 text-secondary-foreground rounded text-xs"
                                    >
                                      {training}
                                    </span>
                                  ))}
                                </div>
                              ))}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
