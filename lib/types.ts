export type UserRole = "admin" | "hr-development" | "hr-assessment" | "employee" | "user-manajemen"

export interface User {
  id: string
  username: string
  password: string
  name: string
  role: UserRole
}

export interface Job {
  id: string
  name: string
  level: string
  weight: number
  criteria: string
  createdAt: Date
}

export interface Competency {
  id: string
  name: string
  trainings: string[]
  weight: number
  createdAt: Date
}

export interface Assessment360 {
  id: string
  name: string
  startDate: Date
  endDate: Date
  status: "sedang berjalan" | "selesai"
  questions: Question[]
  juries: AssessmentJury[]
  responses: Assessment360Response[]
  inChargeIds: string[] // Added field to track responsible persons for this assessment
  createdAt: Date
}

export interface Question {
  id: string
  question: string
  category: string
  weight: number
}

export interface Assessment360Response {
  id: string
  assessmentId: string
  rateeId: string // Orang yang dinilai
  rateerId: string // Orang yang memberikan penilaian
  raterType: "self" | "upward" | "downward" | "peer" // Tipe penilaian untuk 360 feedback
  answers: { questionId: string; score: number }[]
}

export interface PersonJobMatch {
  id: string
  employeeId: string
  matchedJobs: { jobId: string; score: number }[]
  createdAt: Date
  deterministic: boolean // For consistent results
}

export interface JobPersonMatch {
  id: string
  jobId: string
  successors: { employeeId: string; score: number }[]
  createdAt: Date
  deterministic: boolean
}

export interface EmployeeCompetency {
  employeeId: string
  competencyId: string
  addedAt: Date
}

export interface ResignationPrediction {
  employeeId: string
  riskLevel: "rendah" | "sedang" | "tinggi"
  estimatedMonths: number
  reason: string
  predictedAt: Date
  deterministic: boolean
}

export interface HierarchyAssignment {
  employeeId: string
  supervisorId?: string
  subordinateIds: string[]
  assignedAt: Date
}

export interface AssessmentJury {
  assessmentId: string
  rateeId: string // Orang yang dinilai
  raterIds: {
    self: string // Diri sendiri
    upward: string[] // Supervisor(s)
    downward: string[] // Subordinat(s)
    peer: string[] // Rekan kerja (peer)
  }
}

export interface PeerAssignment {
  employeeId: string
  peerIds: string[]
  assignedAt: Date
}
