export interface ReferencePointAssignment {
  id: number
  competitorId: number
  roundId: number
  referencePointId: number
}

export const assignmentsEndpoint = (eventId: number) =>
  `/api/v1/performance_competitions/${eventId}/reference_point_assignments`

export type AssignmentsQueryKey = [
  'performanceCompetition',
  number,
  'referencePointAssignments'
]

export const assignmentsQueryKey = (eventId: number): AssignmentsQueryKey => [
  'performanceCompetition',
  eventId,
  'referencePointAssignments'
]
