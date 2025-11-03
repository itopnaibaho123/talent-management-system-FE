/* In-memory database with localStorage persistence for talent management system */
import type {
  User,
  Job,
  Competency,
  Assessment360,
  PersonJobMatch,
  JobPersonMatch,
  ResignationPrediction,
  EmployeeCompetency,
  HierarchyAssignment,
  PeerAssignment, // Added PeerAssignment type
} from "./types"

export class Database {
  static instance: Database

  private users: User[] = []
  private jobs: Job[] = []
  private competencies: Competency[] = []
  private assessments: Assessment360[] = []
  private personJobMatches: PersonJobMatch[] = []
  private jobPersonMatches: JobPersonMatch[] = []
  private resignationPredictions: ResignationPrediction[] = []
  private employeeCompetencies: EmployeeCompetency[] = []
  private hierarchyAssignments: HierarchyAssignment[] = []
  private peerAssignments: PeerAssignment[] = [] // Added peer assignments

  private constructor() {
    this.loadFromStorage()
  }

  static getInstance(): Database {
    if (!this.instance) {
      this.instance = new Database()
    }
    return this.instance
  }

  private loadFromStorage() {
    if (typeof window === "undefined") {
      this.initializeDefaultUsers()
      return
    }

    try {
      const stored = localStorage.getItem("talent_db")
      if (stored) {
        const data = JSON.parse(stored)
        this.users = data.users || []
        this.jobs = data.jobs || []
        this.competencies = data.competencies || []
        this.assessments = data.assessments || []
        this.personJobMatches = data.personJobMatches || []
        this.jobPersonMatches = data.jobPersonMatches || []
        this.resignationPredictions = data.resignationPredictions || []
        this.employeeCompetencies = data.employeeCompetencies || []
        this.hierarchyAssignments = data.hierarchyAssignments || []
        this.peerAssignments = data.peerAssignments || [] // Load peer assignments
      } else {
        this.initializeDefaultUsers()
      }
    } catch (error) {
      console.error("Error loading from localStorage:", error)
      this.initializeDefaultUsers()
    }
  }

  private saveToStorage() {
    if (typeof window === "undefined") return

    try {
      const data = {
        users: this.users,
        jobs: this.jobs,
        competencies: this.competencies,
        assessments: this.assessments,
        personJobMatches: this.personJobMatches,
        jobPersonMatches: this.jobPersonMatches,
        resignationPredictions: this.resignationPredictions,
        employeeCompetencies: this.employeeCompetencies,
        hierarchyAssignments: this.hierarchyAssignments,
        peerAssignments: this.peerAssignments, // Save peer assignments
      }
      localStorage.setItem("talent_db", JSON.stringify(data))
    } catch (error) {
      console.error("Error saving to localStorage:", error)
    }
  }

  private initializeDefaultUsers() {
    this.users = [
      { id: "1", username: "admin", password: "admin123", name: "Admin User", role: "admin" },
      {
        id: "2",
        username: "HRPengembangan",
        password: "HRPengembangan123",
        name: "HR Pengembangan",
        role: "hr-development",
      },
      { id: "3", username: "HRPenilaian", password: "HRPenilaian123", name: "HR Penilaian", role: "hr-assessment" },
    ]
    this.saveToStorage()
  }

  // User methods
  getUsers() {
    return this.users
  }
  getUserById(id: string) {
    return this.users.find((u) => u.id === id)
  }
  getUserByUsername(username: string) {
    return this.users.find((u) => u.username === username)
  }
  addUser(user: User) {
    this.users.push(user)
    this.saveToStorage()
  }
  updateUser(id: string, updates: Partial<User>) {
    const user = this.getUserById(id)
    if (user) {
      Object.assign(user, updates)
      this.saveToStorage()
    }
  }
  deleteUser(id: string) {
    this.users = this.users.filter((u) => u.id !== id)
    this.saveToStorage()
  }

  // Job methods
  getJobs() {
    return this.jobs
  }
  getJobById(id: string) {
    return this.jobs.find((j) => j.id === id)
  }
  addJob(job: Job) {
    this.jobs.push(job)
    this.saveToStorage()
  }
  updateJob(id: string, updates: Partial<Job>) {
    const job = this.getJobById(id)
    if (job) {
      Object.assign(job, updates)
      this.saveToStorage()
    }
  }

  // Competency methods
  getCompetencies() {
    return this.competencies
  }
  getCompetencyById(id: string) {
    return this.competencies.find((c) => c.id === id)
  }
  addCompetency(competency: Competency) {
    this.competencies.push(competency)
    this.saveToStorage()
  }

  // Assessment methods
  getAssessments() {
    return this.assessments
  }
  getAssessmentById(id: string) {
    return this.assessments.find((a) => a.id === id)
  }
  addAssessment(assessment: Assessment360) {
    this.assessments.push(assessment)
    this.saveToStorage()
  }
  updateAssessment(id: string, updates: Partial<Assessment360>) {
    const assessment = this.getAssessmentById(id)
    if (assessment) {
      Object.assign(assessment, updates)
      this.saveToStorage()
    }
  }

  getAssessmentResponsesByRatee(assessmentId: string, rateeId: string) {
    const assessment = this.getAssessmentById(assessmentId)
    return assessment?.responses.filter((r) => r.rateeId === rateeId) || []
  }

  // Person-Job Match methods
  getPersonJobMatches() {
    return this.personJobMatches
  }
  getPersonJobMatchesByEmployee(employeeId: string) {
    return this.personJobMatches.filter((m) => m.employeeId === employeeId)
  }
  addPersonJobMatch(match: PersonJobMatch) {
    this.personJobMatches.push(match)
    this.saveToStorage()
  }

  // Job-Person Match methods
  getJobPersonMatches() {
    return this.jobPersonMatches
  }
  getJobPersonMatchesByJob(jobId: string) {
    return this.jobPersonMatches.filter((m) => m.jobId === jobId)
  }
  addJobPersonMatch(match: JobPersonMatch) {
    this.jobPersonMatches.push(match)
    this.saveToStorage()
  }

  // Resignation Prediction methods
  getResignationPredictions() {
    return this.resignationPredictions
  }
  getResignationPredictionByEmployee(employeeId: string) {
    return this.resignationPredictions.find((p) => p.employeeId === employeeId)
  }
  addResignationPrediction(prediction: ResignationPrediction) {
    this.resignationPredictions.push(prediction)
    this.saveToStorage()
  }

  // Employee Competency methods
  getEmployeeCompetencies() {
    return this.employeeCompetencies
  }
  getEmployeeCompetenciesByEmployee(employeeId: string) {
    return this.employeeCompetencies.filter((ec) => ec.employeeId === employeeId)
  }
  addEmployeeCompetency(ec: EmployeeCompetency) {
    this.employeeCompetencies.push(ec)
    this.saveToStorage()
  }
  deleteEmployeeCompetency(employeeId: string, competencyId: string) {
    this.employeeCompetencies = this.employeeCompetencies.filter(
      (ec) => !(ec.employeeId === employeeId && ec.competencyId === competencyId),
    )
    this.saveToStorage()
  }

  // Hierarchy Assignment methods
  getHierarchyAssignments() {
    return this.hierarchyAssignments
  }
  getHierarchyByEmployee(employeeId: string) {
    return this.hierarchyAssignments.filter((h) => h.employeeId === employeeId)
  }
  addHierarchyAssignment(assignment: HierarchyAssignment) {
    this.hierarchyAssignments.push(assignment)
    this.saveToStorage()
  }
  updateHierarchyAssignment(employeeId: string, updates: Partial<HierarchyAssignment>) {
    const assignment = this.getHierarchyByEmployee(employeeId)[0]
    if (assignment) {
      Object.assign(assignment, updates)
      this.saveToStorage()
    }
  }

  // Jury-related methods
  getAssessmentJuries(assessmentId: string) {
    const assessment = this.getAssessmentById(assessmentId)
    return assessment?.juries || []
  }

  getJuriesByRatee(assessmentId: string, rateeId: string) {
    const assessment = this.getAssessmentById(assessmentId)
    return assessment?.juries.find((j) => j.rateeId === rateeId)
  }

  updateAssessmentJuries(assessmentId: string, juries: any[]) {
    const assessment = this.getAssessmentById(assessmentId)
    if (assessment) {
      assessment.juries = juries
      this.saveToStorage()
    }
  }

  getPeerAssignments() {
    return this.peerAssignments
  }

  getPeerAssignmentByEmployee(employeeId: string) {
    return this.peerAssignments.find((p) => p.employeeId === employeeId)
  }

  addPeerAssignment(assignment: PeerAssignment) {
    const existing = this.getPeerAssignmentByEmployee(assignment.employeeId)
    if (existing) {
      Object.assign(existing, assignment)
    } else {
      this.peerAssignments.push(assignment)
    }
    this.saveToStorage()
  }

  deletePeerAssignment(employeeId: string) {
    this.peerAssignments = this.peerAssignments.filter((p) => p.employeeId !== employeeId)
    this.saveToStorage()
  }
}

export const db = Database.getInstance()
