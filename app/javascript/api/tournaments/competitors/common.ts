import { z } from 'zod'
import { profileSchema } from 'api/profiles'
import { countrySchema } from 'api/countries'
import { suitSchema } from 'api/suits'
import { manufacturerSchema } from 'api/manufacturer'

export type CompetitorVariables = {
  profileId: number | null
  profileAttributes: {
    name: string
    countryId: number | null
  } | null
  suitId: number | null
}

export const competitorSchema = z.object({
  id: z.number(),
  profileId: z.number(),
  profile: profileSchema.merge(z.object({ country: countrySchema.nullable() })),
  suitId: z.number(),
  suit: suitSchema.merge(z.object({ manufacturer: manufacturerSchema.nullable() }))
})

export type Competitor = z.infer<typeof competitorSchema>

export const collectionEndpoint = (tournamentId: number) =>
  `/api/web/tournaments/${tournamentId}/competitors`

export const elementEndpoint = (tournamentId: number, competitorId: number) =>
  `${collectionEndpoint(tournamentId)}/${competitorId}`
