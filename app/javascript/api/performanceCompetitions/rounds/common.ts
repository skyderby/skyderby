import { z } from 'zod'

export const roundTask = ['distance', 'speed', 'time'] as const

export const roundSchema = z.object({
  id: z.number(),
  task: z.enum(roundTask),
  number: z.number(),
  slug: z.string(),
  completed: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date()
})

export const roundsIndexSchema = z.array(roundSchema)

export type Round = z.infer<typeof roundSchema>

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
