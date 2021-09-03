import axios, { AxiosResponse } from 'axios'
import { loadIds, EmptyResponse, depaginate } from 'api/helpers'
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
  depaginate<PlacesIndex>(buildUrl)

export const getPlaces = (params: IndexParams): Promise<PlacesIndex> =>
  axios.get(buildUrl(params)).then(response => response.data)

export const getPlace = (id: number): Promise<PlaceRecord> =>
  axios.get(`${endpoint}/${id}`).then(response => response.data)

export const getPlacesById = (ids: number[]): Promise<PlacesIndex | EmptyResponse> =>
  loadIds<PlacesIndex>(endpoint, ids)

export const createPlace = (place: PlaceRecord): Promise<AxiosResponse<PlaceRecord>> =>
  axios.post(endpoint, { place }, { headers: { 'X-CSRF-Token': getCSRFToken() } })
