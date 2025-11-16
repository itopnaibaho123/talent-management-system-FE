"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card } from "@/components/ui/card"
import { db } from "@/lib/db"
import { generateDeterministicScore } from "@/lib/utils/matching"
import type { User, ResignationPrediction } from "@/lib/types"

export default function ResignationPredictionPage() {
  const [employees, setEmployees] = useState<User[]>([])
  const [predictions, setPredictions] = useState<ResignationPrediction[]>([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    const emps = db.getUsers().filter((u) => u.role === "employee")
    setEmployees(emps)

    // Generate or get predictions for all employees
    const allPredictions = emps.map((emp) => {
      const existing = db.getResignationPredictionByEmployee(emp.id)
      if (existing) {
        return existing
      }

      // Generate deterministic prediction
      const score = generateDeterministicScore("resignation", emp.id, "base")
      const riskLevel = score < 70 ? "Low" : score < 85 ? "Moderate" : "High"
      const months = Math.floor((score - 50) / 10) + 1

      const reasons = [
        "Performance decreases",
        "Lack of promotional opportunities",
        "No work-life balance",
        "Compensation is not competitive",
        "The work environment is less supportive",
      ]
      const reason = reasons[Math.floor(Math.random() * reasons.length)]

      const prediction: ResignationPrediction = {
        employeeId: emp.id,
        riskLevel,
        estimatedMonths: months,
        reason,
        predictedAt: new Date(),
        deterministic: true,
      }

      db.addResignationPrediction(prediction)
      return prediction
    })

    setPredictions(allPredictions)
  }

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "rendah":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      case "sedang":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
      case "tinggi":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
      default:
        return "bg-muted"
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Resignation Prediction</h1>
          <p className="text-muted-foreground mt-1">AI-based employee resignation risk analysis</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {["Low", "Moderate", "High"].map((level) => {
            const count = predictions.filter((p) => p.riskLevel === level).length
            const colors = {
              Low: "text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400",
              Moderate: "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400",
              High: "text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400",
            }
            return (
              <Card key={level} className={`p-6 ${colors[level as keyof typeof colors]}`}>
                <p className="text-sm font-medium opacity-75">
                  Risk Level: {level.charAt(0).toUpperCase() + level.slice(1)}
                </p>
                <p className="text-3xl font-bold">{count}</p>
              </Card>
            )
          })}
        </div>

        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Employee</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Risk Level</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Timeline</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Reason</th>
                </tr>
              </thead>
              <tbody>
                {predictions.map((pred) => {
                  const emp = employees.find((e) => e.id === pred.employeeId)
                  return (
                    <tr key={pred.employeeId} className="border-b border-border hover:bg-muted/30">
                      <td className="px-6 py-4 text-sm font-medium text-foreground">{emp?.name}</td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getRiskColor(pred.riskLevel)}`}
                        >
                          {pred.riskLevel}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">~{pred.estimatedMonths} months</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{pred.reason}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
