import { z } from 'zod'

export type QueryKey = ['speedSkydivingCompetitions', number, 'rounds']

export const queryKey = (eventId: number): QueryKey => [
  'speedSkydivingCompetitions',
  eventId,
  'rounds'
]

export const collectionEndpoint = (eventId: number) =>
  `/api/v1/speed_skydiving_competitions/${eventId}/rounds`

export const recordEndpoint = (eventId: number, roundId: number) =>
  `${collectionEndpoint(eventId)}/${roundId}`

export const roundSchema = z.object({
  id: z.number(),
  number: z.number(),
  completed: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date()
})

export const roundsIndexSchema = z.array(roundSchema)

export type Round = z.infer<typeof roundSchema>
