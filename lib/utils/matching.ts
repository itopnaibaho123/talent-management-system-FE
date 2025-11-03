/* Deterministic matching algorithms for job-person and person-job matching */

export function generateDeterministicScore(seed: string, employeeId: string, jobId: string): number {
  // Create a consistent hash from seed and IDs
  const combined = seed + employeeId + jobId
  let hash = 0
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }

  // Convert hash to score between 60-95
  const normalized = (Math.abs(hash) % 36) + 60
  return Math.min(95, Math.max(60, normalized))
}

export function sortByScore(items: Array<{ score: number }>) {
  return [...items].sort((a, b) => b.score - a.score)
}
