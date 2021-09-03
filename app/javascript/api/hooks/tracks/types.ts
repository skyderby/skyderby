import { CountryRecord } from 'api/hooks/countries'
import { PlaceRecord } from 'api/hooks/places'
import { SuitRecord } from 'api/hooks/suits'
import { ProfileRecord } from 'api/hooks/profiles'
import { ManufacturerRecord } from 'api/hooks/manufacturer'

type TrackActivity = 'base' | 'skydive' | 'speed_skydiving'

export type TrackRecord = {
  id: number
  kind: TrackActivity
  placeId: number | null
  profileId: number | null
  suitId: number | null
  location: string | null
  name: string | null
  suitName: string | null
  distance: number | null
  speed: number | null
  time: number | null
  recordedAt: string
  comment: string
}

export type TrackRelations = {
  countries: CountryRecord[]
  places: PlaceRecord[]
  suits: SuitRecord[]
  manufacturers: ManufacturerRecord[]
  profiles: ProfileRecord[]
}

export type TracksIndex = {
  items: TrackRecord[]
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

export type IndexParams = {
  activity?: TrackActivity
  filters?: FilterTuple[] | { [key in FilterKey]: string | number }
  page?: number
  sortBy?: SortByValue
}

export type IndexQueryKey = ['tracks', IndexParams]
export type InfiniteIndexQueryKey = ['infiniteTracks', IndexParams]
