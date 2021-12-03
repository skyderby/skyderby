import { IndexParams, PlaceRecord } from 'api/places/types'
import { QueryClient } from 'react-query'

export const endpoint = '/api/v1/places'

export type RecordQueryKey = ['places', number | null | undefined]
export type IndexQueryKey = ['places', IndexParams]
export type AllPlacesQueryKey = ['places', 'all']

export const allPlacesQueryKey: AllPlacesQueryKey = ['places', 'all']
export const indexQueryKey = (params: IndexParams): IndexQueryKey => ['places', params]
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

  return `${endpoint}?${urlParams.toString()}`
}

export const cachePlaces = (places: PlaceRecord[], queryClient: QueryClient): void =>
  places
    .filter(place => !queryClient.getQueryData(recordQueryKey(place.id)))
    .forEach(place => queryClient.setQueryData(recordQueryKey(place.id), place))
