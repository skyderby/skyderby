import { parseISO } from 'date-fns'
import { EventStatus, EventVisibility } from 'api/events'
import { Serialized } from 'api/helpers'

export type QueryKey = ['performance_competitions', number]

export interface PerformanceCompetition {
  id: number
  name: string
  startsAt: Date
  placeId: number
  visibility: EventVisibility
  status: EventStatus
  useTeams: boolean
  useOpenScoreboard: boolean
  rangeFrom: number
  rangeTo: number
  createdAt: Date
  updatedAt: Date

  permissions: {
    canEdit: boolean
    canDownload: boolean
  }
}

export interface PerformanceCompetitionVariables {
  name?: string
  startsAt?: string
  placeId?: number | null
  visibility?: EventVisibility
  status?: EventStatus
  useTeams?: 'true' | 'false'
  useOpenScoreboard?: 'true' | 'false'
  rangeFrom?: number
  rangeTo?: number
}

export type SerializedPerformanceCompetition = Serialized<PerformanceCompetition>

export const queryKey = (id: number): QueryKey => ['performance_competitions', id]

export const collectionEndpoint = '/api/v1/performance_competitions'
export const elementEndpoint = (id: number) => `${collectionEndpoint}/${id}`

export const deserialize = (
  event: SerializedPerformanceCompetition
): PerformanceCompetition => ({
  ...event,
  startsAt: parseISO(event.startsAt),
  createdAt: parseISO(event.createdAt),
  updatedAt: parseISO(event.updatedAt)
})
