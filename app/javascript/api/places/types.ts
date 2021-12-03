import { CountryRecord } from 'api/countries'

export const placeTypes = ['base', 'skydive'] as const
type PlaceKind = typeof placeTypes[number]

type PlacePhoto = {
  id: number
  large: string
  thumb: string
}

export type PlaceRecord = {
  id: number
  name: string
  countryId: number
  msl?: number
  kind: PlaceKind
  latitude: number
  longitude: number
  cover?: string
  photos?: PlacePhoto[]
}

export interface PlacesIndex {
  items: PlaceRecord[]
  currentPage: number
  totalPages: number
  relations: {
    countries: CountryRecord[]
  }
}

export type IndexParams = {
  search?: string
  page?: number
  perPage?: number
}
