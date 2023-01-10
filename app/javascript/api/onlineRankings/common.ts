import { parseISO } from 'date-fns'
import { TrackActivity } from 'api/tracks'
import { SuitCategory } from 'api/suits'
import { Serialized } from 'api/helpers'
import { PlaceRecord } from 'api/places'
import { CountryRecord } from 'api/countries'
import { SerializedOnlineRankingGroup } from './groups'

type Discipline =
  | 'time'
  | 'distance'
  | 'speed'
  | 'distance_in_time'
  | 'distance_in_altitude'
  | 'flare'
  | 'base_race'

type DefaultView = 'default_overall' | 'default_last_year'

export interface OnlineRanking {
  id: number
  name: string
  featured: boolean
  groupId: number
  placeId: number
  finishLineId: number
  jumpsKind: TrackActivity
  suitsKind: SuitCategory
  discipline: Discipline
  disciplineParameter: number
  rangeFrom: number
  rangeTo: number
  displayHighestSpeed: boolean
  displayHighestGr: boolean
  defaultView: DefaultView
  periodFrom: Date
  periodTo: Date
  createdAt: Date
  updatedAt: Date
}

export type SerializedOnlineRanking = Serialized<OnlineRanking>

export interface IndexResponse {
  items: SerializedOnlineRanking[]
  relations: {
    places: PlaceRecord[]
    countries: CountryRecord[]
    groups: SerializedOnlineRankingGroup[]
  }
}

export const collectionEndpoint = '/api/v1/online_rankings'

export const deserialize = (record: SerializedOnlineRanking): OnlineRanking => ({
  ...record,
  periodFrom: parseISO(record.periodFrom),
  periodTo: parseISO(record.periodFrom),
  createdAt: parseISO(record.createdAt),
  updatedAt: parseISO(record.updatedAt)
})
