import axios from 'axios'
import { EmptyResponse, loadIds, urlWithParams } from 'api/helpers'

import { IndexParams, ProfilesIndex, ProfileRecord } from './types'

const endpoint = '/api/v1/profiles'

export const getProfile = (id: number): Promise<ProfileRecord> =>
  axios.get(`${endpoint}/${id}`)

export const getProfilesById = (
  ids: number[]
): Promise<ProfilesIndex | EmptyResponse> =>
  loadIds<ProfilesIndex>(endpoint, ids)

export const getProfiles = (params: IndexParams): Promise<ProfilesIndex> =>
  axios.get(urlWithParams(endpoint, params)).then(response => response.data)
