import axios, { AxiosResponse } from 'axios'
import { loadIds, urlWithParams } from 'api/helpers'

import { IndexParams, ProfilesIndex, ProfileRecord } from './types'

const endpoint = '/api/v1/profiles'

export const getProfile = (id: number): Promise<ProfileRecord> =>
  axios
    .get<never, AxiosResponse<ProfileRecord>>(`${endpoint}/${id}`)
    .then(response => response.data)

export const getProfilesById = (ids: number[]): Promise<ProfilesIndex> =>
  loadIds<ProfileRecord>(endpoint, ids)

export const getProfiles = (params: IndexParams): Promise<ProfilesIndex> =>
  axios
    .get<never, AxiosResponse<ProfilesIndex>>(urlWithParams(endpoint, params))
    .then(response => response.data)
