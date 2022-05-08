import { parseISO } from 'date-fns'
import { Serialized } from 'api/helpers'

export const roundTask = ['distance', 'speed', 'time'] as const
type RoundTask = typeof roundTask[number]

export interface Round {
  id: number
  task: RoundTask
  number: number
  slug: string
  completed: boolean
  createdAt: Date
  updatedAt: Date
}

export type SerializedRound = Serialized<Round>

export type QueryKey = ['performanceCompetition', number, 'rounds']

export const queryKey = (eventId: number): QueryKey => [
  'performanceCompetition',
  eventId,
  'rounds'
]
export const collectionEndpoint = (eventId: number) =>
  `/api/v1/performance_competitions/${eventId}/rounds`
export const elementEndpoint = (eventId: number, id: number) =>
  `${collectionEndpoint(eventId)}/${id}`

export const deserialize = (round: SerializedRound): Round => ({
  ...round,
  createdAt: parseISO(round.createdAt),
  updatedAt: parseISO(round.updatedAt)
})
