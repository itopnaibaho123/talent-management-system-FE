"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { db } from "@/lib/db"
import type { User } from "@/lib/types"
import { showToast } from "@/lib/utils/toast-helper"
import { ConfirmationModal } from "@/components/common/confirmation-modal"

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ username: "", password: "", name: "" })
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = () => {
    setUsers(db.getUsers())
  }

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.username || !formData.password || !formData.name) {
      showToast.error("Validation Error", "Please fill all fields")
      return
    }

    if (users.some((u) => u.username === formData.username)) {
      showToast.error("Username Error", "Username already exists")
      return
    }

    const newUser: User = {
      id: String(Date.now()),
      username: formData.username,
      password: formData.password,
      name: formData.name,
      role: "employee",
    }

    db.addUser(newUser)
    loadUsers()
    setFormData({ username: "", password: "", name: "" })
    setShowForm(false)
    showToast.success("Success", `Employee ${formData.name} created successfully`)
  }

  const handleDeleteUser = (id: string) => {
    const user = db.getUserById(id)
    if (user && (user.role === "admin" || user.role === "hr-development" || user.role === "hr-assessment")) {
      showToast.error("Delete Error", "Cannot delete system users")
      return
    }
    db.deleteUser(id)
    loadUsers()
    setDeleteConfirm(null)
    showToast.success("Success", "Employee deleted successfully")
  }

  const roleLabels: Record<string, string> = {
    admin: "Administrator",
    "hr-development": "HR Pengembangan",
    "hr-assessment": "HR Penilaian",
    employee: "Pegawai",
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">User Management</h1>
            <p className="text-muted-foreground mt-1">Create and manage employee accounts</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90" onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "Create Employee"}
          </Button>
        </div>

        {showForm && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Create New Employee</h2>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Username</label>
                <Input
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Unique username"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Password</label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Password"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Full Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Employee name"
                />
              </div>
              <Button type="submit" className="w-full bg-secondary hover:bg-secondary/90">
                Create Employee
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
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Username</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Role</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-border hover:bg-muted/30">
                    <td className="px-6 py-4 text-sm text-foreground">{user.name}</td>
                    <td className="px-6 py-4 text-sm text-foreground">{user.username}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{roleLabels[user.role]}</td>
                    <td className="px-6 py-4 text-sm space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setDeleteConfirm(user.id)}
                        disabled={user.role !== "employee"}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <ConfirmationModal
          open={deleteConfirm !== null}
          title="Delete Employee"
          description={`Are you sure you want to delete this employee? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          isDangerous
          onConfirm={() => deleteConfirm && handleDeleteUser(deleteConfirm)}
          onCancel={() => setDeleteConfirm(null)}
        />
      </div>
    </DashboardLayout>
  )
}
