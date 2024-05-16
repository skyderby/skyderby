import { z } from 'zod'
import { cachePlaces, placeSchema } from 'api/places'
import { cacheSuits, suitSchema } from 'api/suits'
import { cacheProfiles, profileSchema } from 'api/profiles'
import { cacheCountries, countrySchema } from 'api/countries'
import { cacheManufacturers, manufacturerSchema } from 'api/manufacturer'

const allowedActivities = ['base', 'skydive', 'speed_skydiving', 'swoop'] as const
const allowedVisibilities = ['public_track', 'unlisted_track', 'private_track'] as const
export const trackActivitiesEnum = z.enum(allowedActivities)
export const trackVisibilityEnum = z.enum(allowedVisibilities)
export type TrackActivity = z.infer<typeof trackActivitiesEnum>
export type TrackVisibility = z.infer<typeof trackVisibilityEnum>

export const trackJumpRangeSchema = z.object({
  from: z.number(),
  to: z.number()
})

export type TrackJumpRange = z.infer<typeof trackJumpRangeSchema>

const trackRelationsSchema = z.object({
  countries: z.array(countrySchema),
  places: z.array(placeSchema),
  suits: z.array(suitSchema),
  manufacturers: z.array(manufacturerSchema),
  profiles: z.array(profileSchema)
})

type TrackRelations = z.infer<typeof trackRelationsSchema>

const baseTrackRecordSchema = z.object({
  id: z.number(),
  kind: trackActivitiesEnum,
  visibility: trackVisibilityEnum,
  comment: z.string(),
  profileId: z.number().nullable(),
  suitId: z.number().nullable(),
  placeId: z.number().nullable(),
  location: z.string().nullable(),
  pilotName: z.string().nullable(),
  missingSuitName: z.string().nullable(),
  recordedAt: z.coerce.date(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date()
})

export type BaseTrackRecord = z.infer<typeof baseTrackRecordSchema>

export const trackSchema = baseTrackRecordSchema.merge(
  z.object({
    jumpRange: trackJumpRangeSchema,
    hasVideo: z.boolean(),
    trackFile: z
      .object({
        filename: z.string(),
        downloadUrl: z.string()
      })
      .nullable(),
    permissions: z.object({
      canEdit: z.boolean(),
      canEditOwnership: z.boolean(),
      canDownload: z.boolean()
    })
  })
)

export const trackResponseSchema = trackSchema.merge(
  z.object({
    relations: trackRelationsSchema
  })
)

export type TrackResponseSchema = z.infer<typeof trackSchema>

export type Track = z.infer<typeof trackSchema>

const bestResultsSchema = z.object({
  distance: z.number().nullable(),
  speed: z.number().nullable(),
  time: z.number().nullable()
})

const trackIndexRecordSchema = baseTrackRecordSchema.merge(bestResultsSchema)
export type TrackIndexRecord = z.infer<typeof trackIndexRecordSchema>

export type TrackVariables = Partial<{
  kind: TrackActivity
  visibility: TrackVisibility
  jumpRange: TrackJumpRange
  suitId: number | null
  placeId: number | null
  location: string | null
  missingSuitName: string | null
  comment: string
}>

export const trackIndexSchema = z.object({
  items: z.array(trackIndexRecordSchema),
  currentPage: z.number(),
  totalPages: z.number()
})

export const trackIndexResponseSchema = trackIndexSchema.merge(
  z.object({
    relations: trackRelationsSchema
  })
)

export type TrackIndex = z.infer<typeof trackIndexSchema>

export interface IndexParams {
  activity?: TrackActivity
  filters?: TrackFilters
  search?: string
  page?: number
  perPage?: number
  sortBy?: SortByValue
}

export type IndexQueryKey = ['tracks', IndexParams]
export type InfiniteIndexQueryKey = ['infiniteTracks', IndexParams]
export type RecordQueryKey = ['tracks', number]

export const allowedFilters = ['profileId', 'suitId', 'placeId', 'year'] as const
export const allowedSortByValues = [
  'id asc',
  'id desc',
  'recorded_at asc',
  'recorded_at desc',
  'speed asc',
  'speed desc',
  'distance asc',
  'distance desc',
  'time asc',
  'time desc'
] as const

export type FilterKey = typeof allowedFilters[number]
export type FilterTuple = readonly [FilterKey, string | number]
export type SortByValue = typeof allowedSortByValues[number]
export type TrackFilters = FilterTuple[] | { [key in FilterKey]?: string | number }

export const isAllowedActivity = (activity: string | null): activity is TrackActivity => {
  if (!activity) return false
  return allowedActivities.includes(activity as TrackActivity)
}

export const isAllowedSort = (sortBy: string | null): sortBy is SortByValue => {
  if (!sortBy) return false
  return allowedSortByValues.includes(sortBy as SortByValue)
}

export const collectionEndpoint = '/api/v1/tracks'
export const elementEndpoint = (id: number) => `${collectionEndpoint}/${id}`
export const recordQueryKey = (id: number): RecordQueryKey => ['tracks', id]

export const cacheRelations = (relations: TrackRelations): void => {
  cachePlaces(relations.places)
  cacheSuits(relations.suits)
  cacheProfiles(relations.profiles)
  cacheCountries(relations.countries)
  cacheManufacturers(relations.manufacturers)
}
