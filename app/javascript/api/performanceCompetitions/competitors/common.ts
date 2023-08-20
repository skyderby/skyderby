import { parseISO } from 'date-fns'
import { Serialized, Nullable } from 'api/helpers'
import { ProfileRecord } from 'api/profiles'
import { CountryRecord } from 'api/countries'
import { SuitRecord } from 'api/suits'

export type QueryKey = ['performanceCompetition', number, 'competitors']

export interface Competitor {
  id: number
  profileId: number
  categoryId: number
  suitId: number
  teamId: number
  assignedNumber: number
  createdAt: Date
  updatedAt: Date
}

export type SerializedCompetitor = Serialized<Competitor>

export type CompetitorVariables = Partial<
  Nullable<Omit<Competitor, 'id' | 'createdAt' | 'updatedAt'>>
>

export interface IndexResponse {
  items: SerializedCompetitor[]
  relations: {
    profiles: ProfileRecord[]
    suits: SuitRecord[]
    countries: CountryRecord[]
  }
}

export const queryKey = (eventId: number): QueryKey => [
  'performanceCompetition',
  eventId,
  'competitors'
]

export const collectionEndpoint = (eventId: number) =>
  `/api/v1/performance_competitions/${eventId}/competitors`
export const elementEndpoint = (eventId: number, id: number) =>
  `${collectionEndpoint(eventId)}/${id}`
export const copyEndpoint = (eventId: number) => `${collectionEndpoint(eventId)}/copy`

export const deserialize = (competitor: SerializedCompetitor): Competitor => ({
  ...competitor,
  createdAt: parseISO(competitor.createdAt),
  updatedAt: parseISO(competitor.updatedAt)
})
