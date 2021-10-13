import axios, { AxiosResponse } from 'axios'
import { loadIds, depaginate } from 'api/helpers'
import { getCSRFToken } from 'utils/csrfToken'

import { IndexParams, PlacesIndex, PlaceRecord } from './types'

const endpoint = '/api/v1/places'

const buildUrl = (params: IndexParams = {}): string => {
  const urlParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    urlParams.set(key, String(value))
  })

  return `${endpoint}?${urlParams.toString()}`
}

export const getAllPlaces = async (): Promise<PlacesIndex[]> =>
  depaginate<PlaceRecord, PlacesIndex['relations']>(buildUrl)

export const getPlaces = (params: IndexParams): Promise<PlacesIndex> =>
  axios
    .get<never, AxiosResponse<PlacesIndex>>(buildUrl(params))
    .then(response => response.data)

export const getPlace = (id: number): Promise<PlaceRecord> =>
  axios
    .get<never, AxiosResponse<PlaceRecord>>(`${endpoint}/${id}`)
    .then(response => response.data)

export const getPlacesById = (ids: number[]): Promise<Omit<PlacesIndex, 'relations'>> =>
  loadIds<PlaceRecord>(endpoint, ids)

export const createPlace = (place: PlaceRecord): Promise<AxiosResponse<PlaceRecord>> =>
  axios.post<{ place: PlaceRecord }, AxiosResponse<PlaceRecord>>(
    endpoint,
    { place },
    { headers: { 'X-CSRF-Token': String(getCSRFToken()) } }
  )
