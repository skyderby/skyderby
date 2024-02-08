import { z } from 'zod'

export type QueryKey = ['performanceCompetition', number, 'results']

export const resultSchema = z.object({
  id: z.number(),
  competitorId: z.number(),
  roundId: z.number(),
  trackId: z.number(),
  penalized: z.boolean(),
  penaltyReason: z.string().nullable(),
  penaltySize: z.number().nullable(),
  result: z.number(),
  resultNet: z.number().nullable(),
  exitAltitude: z.number().nullable(),
  exitedAt: z.coerce.date().nullable(),
  headingWithinWindow: z.number().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date()
})

export const resultsIndexSchema = z.array(resultSchema)

export type Result = z.infer<typeof resultSchema>

export const queryKey = (eventId: number): QueryKey => [
  'performanceCompetition',
  eventId,
  'results'
]

export const collectionEndpoint = (eventId: number) =>
  `/api/v1/performance_competitions/${eventId}/results`

export const elementEndpoint = (eventId: number, id: number) =>
  `${collectionEndpoint(eventId)}/${id}`
