import { db } from "@/lib/db"
import type { AssessmentJury } from "@/lib/types"

export function getAssessableTargets(employeeId: string, assessmentId: string) {
  const hierarchy = db.getHierarchyByEmployee(employeeId)[0]
  const assessment = db.getAssessmentById(assessmentId)

  if (!assessment) return {}

  return {
    self: { id: employeeId, name: db.getUserById(employeeId)?.name || "Self" },
    supervisors: hierarchy?.supervisorId
      ? [
          {
            id: hierarchy.supervisorId,
            name: db.getUserById(hierarchy.supervisorId)?.name || "Supervisor",
          },
        ]
      : [],
    subordinates: hierarchy?.subordinateIds
      ? hierarchy.subordinateIds.map((id) => ({
          id,
          name: db.getUserById(id)?.name || "Unknown",
        }))
      : [],
    peers: [],
  }
}

export function getReceivedAssessments(employeeId: string) {
  const assessments = db.getAssessments()
  const responses = assessments.flatMap((a) =>
    a.responses
      .filter((r) => r.rateeId === employeeId)
      .map((r) => ({
        ...r,
        assessmentName: a.name,
        assessmentStatus: a.status,
      })),
  )

  return {
    self: responses.filter((r) => r.raterType === "self"),
    upward: responses.filter((r) => r.raterType === "upward"),
    downward: responses.filter((r) => r.raterType === "downward"),
    peer: responses.filter((r) => r.raterType === "peer"),
  }
}

export function calculateAverageScore(responses: any[]) {
  if (responses.length === 0) return 0
  const totalScore = responses.reduce((sum, r) => {
    const avgAnswer = r.answers.reduce((s: number, a: any) => s + a.score, 0) / r.answers.length
    return sum + avgAnswer
  }, 0)
  return Math.round((totalScore / responses.length) * 10) / 10
}

export function generateAssessmentJuries(employeeIds: string[]): AssessmentJury[] {
  const juries: AssessmentJury[] = []

  employeeIds.forEach((rateeId) => {
    const hierarchy = db.getHierarchyByEmployee(rateeId)[0]

    const jury: AssessmentJury = {
      assessmentId: "", // Will be set later
      rateeId,
      raterIds: {
        self: rateeId, // Self-assessment
        upward: hierarchy?.supervisorId ? [hierarchy.supervisorId] : [], // Supervisor(s)
        downward: hierarchy?.subordinateIds || [], // All subordinates
        peer: getPeersForEmployee(rateeId, employeeIds), // Peers from same hierarchy level
      },
    }

    juries.push(jury)
  })

  return juries
}

function getPeersForEmployee(employeeId: string, allEmployeeIds: string[]): string[] {
  const hierarchy = db.getHierarchyByEmployee(employeeId)[0]

  if (!hierarchy?.supervisorId) return []

  // Peers are employees with the same supervisor
  return allEmployeeIds.filter((id) => {
    if (id === employeeId) return false
    const otherHierarchy = db.getHierarchyByEmployee(id)[0]
    return otherHierarchy?.supervisorId === hierarchy.supervisorId
  })
}

export function getJuryForEmployee(assessmentId: string, employeeId: string) {
  const assessment = db.getAssessmentById(assessmentId)
  if (!assessment) return null

  const jury = assessment.juries.find((j) => j.rateeId === employeeId)
  if (!jury) return null

  return {
    self: jury.raterIds.self ? [db.getUserById(jury.raterIds.self)] : [],
    upward: jury.raterIds.upward.map((id) => db.getUserById(id)).filter(Boolean),
    downward: jury.raterIds.downward.map((id) => db.getUserById(id)).filter(Boolean),
    peer: jury.raterIds.peer.map((id) => db.getUserById(id)).filter(Boolean),
  }
}

export function getAssignedRatees(assessmentId: string, raterId: string) {
  const assessment = db.getAssessmentById(assessmentId)
  if (!assessment) return []

  const ratees: any[] = []

  assessment.juries.forEach((jury) => {
    if (jury.raterIds.self === raterId) {
      ratees.push({ id: jury.rateeId, type: "self" })
    }
    if (jury.raterIds.upward.includes(raterId)) {
      ratees.push({ id: jury.rateeId, type: "upward" })
    }
    if (jury.raterIds.downward.includes(raterId)) {
      ratees.push({ id: jury.rateeId, type: "downward" })
    }
    if (jury.raterIds.peer.includes(raterId)) {
      ratees.push({ id: jury.rateeId, type: "peer" })
    }
  })

  return ratees
}
