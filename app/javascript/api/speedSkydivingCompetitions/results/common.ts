import { parseISO } from 'date-fns'
import { Serialized } from 'api/helpers'

export type QueryKey = ['speedSkydivingCompetitions', number, 'results']

export interface Result {
  id: number
  eventId: number
  competitorId: number
  roundId: number
  trackId: number
  exitAltitude: number
  result: number
  finalResult: number
  penaltySize: number
  windowStartTime: Date
  windowEndTime: Date
  penalties: Penalty[]
  createdAt: Date
  updatedAt: Date
}

export type SerializedResult = Serialized<Result>

export interface Penalty {
  percent: number
  reason: string
}

export const queryKey = (eventId: number): QueryKey => [
  'speedSkydivingCompetitions',
  eventId,
  'results'
]

export const collectionEndpoint = (eventId: number) =>
  `/api/v1/speed_skydiving_competitions/${eventId}/results`
export const elementEndpoint = (eventId: number, id: number) =>
  `${collectionEndpoint(eventId)}/${id}`
export const penaltiesEndpoint = (eventId: number, id: number) =>
  `${elementEndpoint(eventId, id)}/penalties`

export const deserialize = (result: SerializedResult): Result => ({
  ...result,
  windowStartTime: parseISO(result.windowStartTime),
  windowEndTime: parseISO(result.windowEndTime),
  createdAt: parseISO(result.createdAt),
  updatedAt: parseISO(result.updatedAt)
})
