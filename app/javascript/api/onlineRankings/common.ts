import { z } from 'zod'
import { trackActivitiesEnum } from 'api/tracks'
import { cacheSuits, suitCategoriesEnum, suitSchema } from 'api/suits'
import { cacheProfiles, profileSchema } from 'api/profiles'
import { cacheCountries, countrySchema } from 'api/countries'
import { cachePlaces, placeSchema } from 'api/places'
import { cacheManufacturers, manufacturerSchema } from 'api/manufacturer'

const tasks = [
  'time',
  'distance',
  'speed',
  'distance_in_time',
  'distance_in_altitude',
  'flare',
  'base_race'
] as const
const tasksEnum = z.enum(tasks)
const defaultView = z.enum(['default_overall', 'default_last_year'])

export const onlineRankingSchema = z.object({
  id: z.number(),
  name: z.string(),
  featured: z.boolean(),
  groupId: z.number(),
  placeId: z.number().nullable(),
  finishLineId: z.number().nullable(),
  jumpsKind: trackActivitiesEnum.nullable(),
  suitsKind: suitCategoriesEnum.nullable(),
  discipline: tasksEnum,
  disciplineParameter: z.number().nullable(),
  defaultView,
  displayHighestSpeed: z.boolean(),
  displayHighestGr: z.boolean(),
  periodFrom: z.coerce.date(),
  periodTo: z.coerce.date(),
  intervalType: z.enum(['annual', 'custom_intervals']),
  years: z.array(z.number()),
  intervals: z.array(
    z.object({
      name: z.string(),
      slug: z.string()
    })
  ),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  permissions: z.object({
    canEdit: z.boolean()
  })
})

const rowSchema = z.object({
  rank: z.number(),
  profileId: z.number(),
  suitId: z.number(),
  placeId: z.number().nullable(),
  userProvidedPlaceName: z.string().nullable(),
  trackId: z.number(),
  result: z.number(),
  highestGr: z.number(),
  highestSpeed: z.number(),
  recordedAt: z.coerce.date()
})

export const standingsResponseSchema = z.object({
  data: z.array(rowSchema),
  currentPage: z.number(),
  totalPages: z.number(),
  relations: z.object({
    profiles: z.array(profileSchema),
    countries: z.array(countrySchema),
    places: z.array(placeSchema),
    suits: z.array(suitSchema),
    manufacturers: z.array(manufacturerSchema)
  })
})

export type StandingsRow = z.infer<typeof rowSchema>
export type StandingsResponse = z.infer<typeof standingsResponseSchema>
export type OnlineRanking = z.infer<typeof onlineRankingSchema>

export const collectionEndpoint = '/api/v1/online_rankings'
export const elementEndpoint = (id: number) => `${collectionEndpoint}/${id}`

export const cacheStandingRelations = (relations: StandingsResponse['relations']) => {
  cacheProfiles(relations.profiles)
  cacheCountries(relations.countries)
  cacheSuits(relations.suits)
  cachePlaces(relations.places)
  cacheManufacturers(relations.manufacturers)
}
