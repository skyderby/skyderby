import axios from 'axios'
import { loadIds, EmptyResponse, depaginate } from 'api/helpers'

import { SuitRecord, SuitsIndex, IndexParams } from './types'

const endpoint = '/api/v1/suits'

const buildUrl = (params: IndexParams = {}): string => {
  const urlParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    urlParams.set(key, String(value))
  })

  return `${endpoint}?${urlParams.toString()}`
}

export const getSuit = (id: number): Promise<SuitRecord> =>
  axios.get(`${endpoint}/${id}`).then(response => response.data)

export const getSuitsById = (ids: number[]): Promise<SuitsIndex | EmptyResponse> =>
  loadIds<SuitsIndex>(endpoint, ids)

export const getAllSuits = async (params: IndexParams): Promise<SuitsIndex[]> =>
  depaginate<SuitsIndex>(pagination => buildUrl({ ...params, ...pagination }))

export const getSuits = (params: IndexParams): Promise<SuitsIndex> =>
  axios.get(buildUrl(params)).then(response => response.data)
