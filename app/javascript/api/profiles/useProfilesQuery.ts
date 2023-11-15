import { QueryFunction, useQuery, UseQueryOptions } from '@tanstack/react-query'
import client, { AxiosResponse } from 'api/client'
import {
  collectionEndpoint,
  cacheProfiles,
  profilesIndexSchema,
  IndexParams,
  ProfilesIndex
} from './common'
import queryClient from 'components/queryClient'
import { cacheCountries } from 'api/countries'
import { urlWithParams } from 'api/helpers'

type IndexQueryKey = ['profiles', IndexParams]

export const getProfiles = (params: IndexParams): Promise<ProfilesIndex> =>
  client
    .get<never, AxiosResponse<ProfilesIndex>>(urlWithParams(collectionEndpoint, params))
    .then(response => profilesIndexSchema.parse(response.data))

const queryFn: QueryFunction<ProfilesIndex, IndexQueryKey> = async ctx => {
  const [_key, params] = ctx.queryKey
  const data = await getProfiles(params)

  const profiles = data.items

  cacheProfiles(profiles, queryClient)
  cacheCountries(data.relations.countries, queryClient)

  return data
}

export const profilesQuery = (
  params: IndexParams = {}
): UseQueryOptions<ProfilesIndex, Error, ProfilesIndex, IndexQueryKey> => ({
  queryKey: ['profiles', params],
  queryFn: queryFn,
  gcTime: 60 * 10 * 1000,
  staleTime: 60 * 10 * 1000
})

const useProfilesQuery = (params: IndexParams = {}) => useQuery(profilesQuery(params))

export default useProfilesQuery
