import client, { AxiosResponse } from 'api/client'
import { loadIds, depaginate } from 'api/helpers'

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
  client
    .get<never, AxiosResponse<SuitRecord>>(`${endpoint}/${id}`)
    .then(response => response.data)

export const getSuitsById = (ids: number[]) => loadIds<SuitRecord>(endpoint, ids)

export const getAllSuits = async (params: IndexParams): Promise<SuitsIndex[]> =>
  depaginate<SuitRecord, SuitsIndex['relations']>(pagination =>
    buildUrl({ ...params, ...pagination })
  )

export const getSuits = (params: IndexParams): Promise<SuitsIndex> =>
  client
    .get<never, AxiosResponse<SuitsIndex>>(buildUrl(params))
    .then(response => response.data)
