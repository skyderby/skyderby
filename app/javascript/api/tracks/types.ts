import { CountryRecord } from 'api/countries'
import { PlaceRecord } from 'api/places'
import { SuitRecord } from 'api/suits'
import { ProfileRecord } from 'api/profiles'
import { ManufacturerRecord } from 'api/manufacturer'

const allowedActivities = ['base', 'skydive', 'speed_skydiving'] as const
const allowedVisibilities = ['public_track', 'unlisted_track', 'private_track'] as const
export type TrackActivity = typeof allowedActivities[number]
export type TrackVisibility = typeof allowedVisibilities[number]
export interface TrackJumpRange {
  from: number
  to: number
}

interface BestResults {
  distance: number | null
  speed: number | null
  time: number | null
}

export interface BaseTrackRecord {
  id: number
  kind: TrackActivity
  visibility: TrackVisibility
  comment: string
  profileId: number | null
  suitId: number | null
  placeId: number | null
  location: string | null
  pilotName: string | null
  missingSuitName: string | null
  recordedAt: string
  createdAt: string
}

export interface TrackRecord extends BaseTrackRecord {
  jumpRange: TrackJumpRange
  hasVideo: boolean
  trackFile?: {
    filename: string
    downloadUrl: string
  }
  permissions: {
    canEdit: boolean
    canEditOwnership: boolean
    canDownload: boolean
  }
}

export interface TrackFields {
  kind: TrackActivity
  visibility: TrackVisibility
  jumpRange: TrackJumpRange
  suitId: number | null
  placeId: number | null
  location: string | null
  missingSuitName: string | null
  comment: string
}

export type TrackIndexRecord = BaseTrackRecord & BestResults

export interface TrackRelations {
  countries: CountryRecord[]
  places: PlaceRecord[]
  suits: SuitRecord[]
  manufacturers: ManufacturerRecord[]
  profiles: ProfileRecord[]
}

export interface TracksIndex {
  items: TrackIndexRecord[]
  currentPage: number
  totalPages: number
  relations: TrackRelations
}

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
export type FilterTuple = [FilterKey, string | number]
export type SortByValue = typeof allowedSortByValues[number]
export type TrackFilters = FilterTuple[] | { [key in FilterKey]: string | number }

export const isAllowedActivity = (activity: string | null): activity is TrackActivity => {
  if (!activity) return false
  return allowedActivities.includes(activity as TrackActivity)
}

export const isAllowedSort = (sortBy: string | null): sortBy is SortByValue => {
  if (!sortBy) return false
  return allowedSortByValues.includes(sortBy as SortByValue)
}

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
