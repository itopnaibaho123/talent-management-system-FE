"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { db } from "@/lib/db"
import type { Riwayat, User } from "@/lib/types"
import { showToast } from "@/lib/utils/toast-helper"
import { ConfirmationModal } from "@/components/common/confirmation-modal"

export default function RiwayatPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isDisabled, setIsDisabled] = useState(true)
  const [riwayat, setRiwayat] = useState<Riwayat[]>([])
  const [showForm, setShowForm] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [formData, setFormData] = useState({
    namaRiwayat: "",
    deskripsiRiwayat: "",
    tipeRiwayat: "",
    skalaRiwayat: 0,
  })
  const [currentType, setCurrentType] = useState({category: "Riwayat Organisasi" })

  useEffect(() => {
    const user = localStorage.getItem("currentUser")
    if(user) {
        const userData = JSON.parse(user)
        setCurrentUser(userData)
      
    }
    
  }, [])
  useEffect(() => {
    if(!currentUser?.username) return;
    loadData()
  }, [currentUser])

  useEffect(() => {
  const valid =
    formData.namaRiwayat.trim() !== "" &&
    formData.deskripsiRiwayat.trim() !== ""

  setIsDisabled(!valid);
  }, [formData]);

  const loadData = () => {
    const result = db.getRiwayatByUsername(currentUser!.username);
    setRiwayat(result)
  }

  const validateAndConfirm = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.namaRiwayat || !formData.deskripsiRiwayat) {
      showToast.error("Validation Error", "Please fill all required fields and add at least one question")
      return
    }

    setShowConfirm(true)
  }

  const handleCreateRiwayat = () => {
    

    const riwayatId = String(Date.now())


    const newRiwayat: Riwayat = {
      id: riwayatId, // Use same ID
      username: currentUser!.username,
      tipeRiwayat: currentType.category,
      namaRiwayat: formData.namaRiwayat,
      deskripsiRiwayat: formData.deskripsiRiwayat,
      skalaRiwayat: formData.skalaRiwayat,
    }

    db.addRiwayat(newRiwayat)
    loadData()
    setFormData({
      namaRiwayat: "",
      deskripsiRiwayat: "",
      skalaRiwayat: 0,
      tipeRiwayat: ""
    })
    setShowForm(false)
    setShowConfirm(false)
    showToast.success("Success", `Riwayat created with ${currentUser?.name} employees`)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Talent Supporting Data</h1>
            <p className="text-muted-foreground mt-1">All Talent Supporting Data of {currentUser?.name}</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90" onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "Create Achievement"}
          </Button>
        </div>

        {showForm && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">Entering new data</h2>
            <form onSubmit={validateAndConfirm} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                      <label className="text-sm font-medium">Achievement Type</label>
                      <select
                        value={currentType.category}
                        onChange={(e) => setCurrentType({ ...currentType, category: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
                      >
                        <option>Riwayat Organisasi</option>
                        <option>Riwayat Agen Perubahan</option>
                        <option>Riwayat Pertimbangan Atasan</option>
                        <option>Riwayat Partisipasi Organisasi</option>
                        <option>Riwayat Bahasa inggris dan Bahasa Asing</option>
                      </select>
                    </div>
                <div>
                  <label className="text-sm font-medium">Name of Achievement</label>
                  <Input
                    value={formData.namaRiwayat}
                    onChange={(e) => setFormData({ ...formData, namaRiwayat: e.target.value })}
                    placeholder="e.g., Taekwondo"
                  />
                </div>
                <div>
                    <label className="text-sm font-medium">Description</label>
                    <textarea
                    value={formData.deskripsiRiwayat}
                    onChange={(e) => setFormData({ ...formData, deskripsiRiwayat: e.target.value })}
                    placeholder="e.g., Juara 1 internasional"
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                    rows={3}
                    />
                </div>
                {currentType.category === "Riwayat Bahasa inggris dan Bahasa Asing" && (<div>
                          <label className="text-sm font-medium">Score</label>
                          <Input
                              type="number"
                              min="0"
                              max="600"
                              value={formData.skalaRiwayat}
                              onChange={(e) => setFormData({ ...formData, skalaRiwayat: Number(e.target.value) })}
                          />
                      </div>)}
                
              </div>
              
              <Button type="submit" className="w-full bg-secondary hover:bg-secondary/90" disabled = {isDisabled}>
                Create Achievement
              </Button>
            </form>
          </Card>
        )}

        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Achievement Type</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Achievement Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Achievement Description</th>
                </tr>
              </thead>
              <tbody>
                {riwayat.map((riwayat) => ( riwayat.tipeRiwayat !== "Riwayat Bahasa inggris dan Bahasa Asing" && (
                  <tr key={riwayat.id} className="border-b border-border hover:bg-muted/30">
                    <td className="px-6 py-4 text-sm font-medium text-foreground">{riwayat.tipeRiwayat}</td>
                    <td className="px-6 py-4 text-sm font-medium text-foreground">{riwayat.namaRiwayat}</td>
                    <td className="px-6 py-4 text-sm font-medium text-foreground">{riwayat.deskripsiRiwayat}</td>
                  </tr> )
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Description</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Score</th>
                </tr>
              </thead>
              <tbody>
                {riwayat.map((riwayat) => ( riwayat.tipeRiwayat === "Riwayat Bahasa inggris dan Bahasa Asing" && (
                  <tr key={riwayat.id} className="border-b border-border hover:bg-muted/30">
                    <td className="px-6 py-4 text-sm font-medium text-foreground">{riwayat.namaRiwayat}</td>
                    <td className="px-6 py-4 text-sm font-medium text-foreground">{riwayat.deskripsiRiwayat}</td>
                    <td className="px-6 py-4 text-sm font-medium text-foreground">{riwayat.skalaRiwayat}</td>
                  </tr> )
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <ConfirmationModal
          open={showConfirm}
          title="Confirm Riwayat Creation"
          description={`Create Riwayat "${formData.namaRiwayat}" with ${currentUser?.name} employee.`}
          confirmText="Create Riwayat"
          cancelText="Cancel"
          onConfirm={handleCreateRiwayat}
          onCancel={() => setShowConfirm(false)}
        />
      </div>
    </DashboardLayout>
  )
}
