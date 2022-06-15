import { QueryClient } from 'react-query'
import { CountryRecord } from 'api/countries'

export const placeTypes = ['base', 'skydive'] as const
export type PlaceKind = typeof placeTypes[number]

type PlacePhoto = {
  id: number
  large: string
  thumb: string
}

export type PlaceRecord = {
  id: number
  name: string
  countryId: number
  msl: number | null
  kind: PlaceKind
  latitude: number
  longitude: number
  permissions: {
    canEdit: boolean
  }
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

export type PlaceVariables = {
  name?: string
  countryId?: number | null
  msl?: number | null
  kind?: PlaceKind
  latitude?: number | null
  longitude?: number | null
}

export const collectionEndpoint = '/api/v1/places'
export const elementEndpoint = (id: number) => `${collectionEndpoint}/${id}`

export type RecordQueryKey = ['places', number | null | undefined]
export type IndexQueryKey = ['places', IndexParams]
export type AllPlacesQueryKey = ['places', 'all']

export const allPlacesQueryKey: AllPlacesQueryKey = ['places', 'all']
export const indexQueryKey = (params: IndexParams = {}): IndexQueryKey => [
  'places',
  params
]
export const recordQueryKey = (id: number | null | undefined): RecordQueryKey => [
  'places',
  id
]

export const cacheOptions = {
  cacheTime: 60 * 30 * 1000,
  staleTime: 60 * 10 * 1000
}

export const buildUrl = (params: IndexParams = {}): string => {
  const urlParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    urlParams.set(key, String(value))
  })

  return `${collectionEndpoint}?${urlParams.toString()}`
}

export const cachePlaces = (places: PlaceRecord[], queryClient: QueryClient): void =>
  places
    .filter(place => !queryClient.getQueryData(recordQueryKey(place.id)))
    .forEach(place => queryClient.setQueryData(recordQueryKey(place.id), place))
