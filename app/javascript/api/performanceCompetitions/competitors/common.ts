import { Nullable } from 'api/helpers'
import { z } from 'zod'
import { profileSchema } from 'api/profiles'
import { countrySchema } from 'api/countries'
import { suitSchema } from 'api/suits'

export type QueryKey = ['performanceCompetition', number, 'competitors']

export const competitorSchema = z.object({
  id: z.number(),
  profileId: z.number(),
  categoryId: z.number(),
  suitId: z.number(),
  teamId: z.number().nullable(),
  assignedNumber: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date()
})

export type Competitor = z.infer<typeof competitorSchema>

export const competitorsIndexSchema = z.object({
  items: z.array(competitorSchema),
  relations: z.object({
    profiles: z.array(profileSchema),
    suits: z.array(suitSchema),
    countries: z.array(countrySchema)
  })
})

export type CompetitorsIndex = z.infer<typeof competitorsIndexSchema>

export type CompetitorVariables = Partial<
  Nullable<Omit<Competitor, 'id' | 'createdAt' | 'updatedAt'>>
>

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
