import { Serialized } from 'api/helpers'
import { parseISO } from 'date-fns'

export type QueryKey = ['performanceCompetition', number, 'results']

export interface Result {
  id: number
  competitorId: number
  roundId: number
  trackId: number
  penalized: boolean
  penaltyReason: string
  penaltySize: number
  result: number
  resultNet: number
  points: number
  exitAltitude: number
  exitedAt: Date
  headingWithinWindow: number
  createdAt: Date
  updatedAt: Date
}

export type SerializedResult = Serialized<Result>

export const queryKey = (eventId: number): QueryKey => [
  'performanceCompetition',
  eventId,
  'results'
]

export const collectionEndpoint = (eventId: number) =>
  `/api/v1/performance_competitions/${eventId}/results`

export const elementEndpoint = (eventId: number, id: number) =>
  `${collectionEndpoint(eventId)}/${id}`

export const deserialize = (result: SerializedResult): Result => ({
  ...result,
  exitedAt: parseISO(result.exitedAt),
  createdAt: parseISO(result.createdAt),
  updatedAt: parseISO(result.updatedAt)
})
