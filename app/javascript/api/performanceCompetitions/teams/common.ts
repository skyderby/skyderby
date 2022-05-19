import { Serialized } from 'api/helpers'
import { parseISO } from 'date-fns'

export interface Team {
  id: number
  name: string
  competitorIds: number[]
  createdAt: Date
  updatedAt: Date
}

export type SerializedTeam = Serialized<Team>

export type TeamVariables = {
  name: string
  competitorIds: number[]
}

export type QueryKey = ['performanceCompetition', number, 'teams']

export const queryKey = (eventId: number): QueryKey => [
  'performanceCompetition',
  eventId,
  'teams'
]

export const collectionUrl = (eventId: number) =>
  `/api/v1/performance_competitions/${eventId}/teams`
export const elementUrl = (eventId: number, id: number) =>
  `${collectionUrl(eventId)}/${id}`

export const deserialize = (team: SerializedTeam): Team => ({
  ...team,
  createdAt: parseISO(team.createdAt),
  updatedAt: parseISO(team.updatedAt)
})
