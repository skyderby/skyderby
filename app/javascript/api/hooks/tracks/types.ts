import { CountryRecord } from 'api/hooks/countries'
import { PlaceRecord } from 'api/hooks/places'
import { SuitRecord } from 'api/hooks/suits'
import { ProfileRecord } from 'api/hooks/profiles'
import { ManufacturerRecord } from 'api/hooks/manufacturer'

export type TrackActivity = 'base' | 'skydive' | 'speed_skydiving'
export type TrackVisibility = 'public_track' | 'unlisted_track' | 'private_track'
export type TrackJumpRange = {
  from: number
  to: number
}

type BestResults = {
  distance: number | null
  speed: number | null
  time: number | null
}

export type BaseTrackRecord = {
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

export type TrackRecord = BaseTrackRecord & {
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

type SelectedSuit = {
  suitId: number
  missingSuitName: null
}

type MissingSuit = {
  suitId: null
  missingSuitName: string
}

type SelectedPlace = {
  placeId: number
  location: null
}

type MissingPlace = {
  placeId: null
  location: string
}

export type TrackFields = (SelectedSuit | MissingSuit) &
  (SelectedPlace | MissingPlace) & {
    jumpRange: TrackJumpRange
    kind: TrackActivity
    visibility: TrackVisibility
    comment: string
  }

export type TrackIndexRecord = BaseTrackRecord & BestResults

export type TrackRelations = {
  countries: CountryRecord[]
  places: PlaceRecord[]
  suits: SuitRecord[]
  manufacturers: ManufacturerRecord[]
  profiles: ProfileRecord[]
}

export type TracksIndex = {
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

export type IndexParams = {
  activity?: TrackActivity
  filters?: FilterTuple[] | { [key in FilterKey]: string | number }
  page?: number
  sortBy?: SortByValue
}

export type IndexQueryKey = ['tracks', IndexParams]
export type InfiniteIndexQueryKey = ['infiniteTracks', IndexParams]
