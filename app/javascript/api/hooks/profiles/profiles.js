import { useQuery, useQueryClient } from 'react-query'
import axios from 'axios'

import { preloadCountries } from 'api/hooks/countries'
import { getQueryKey as getProfileQueryKey } from './profile'
import { urlWithParams } from 'api/helpers'

const endpoint = '/api/v1/profiles'

const getProfiles = params => axios.get(urlWithParams(endpoint, params))

const cacheProfiles = (profiles, queryClient) =>
  profiles
    .filter(profile => !queryClient.getQueryData(getProfileQueryKey(profile.id)))
    .forEach(profile => queryClient.setQueryData(getProfileQueryKey(profile.id), profile))

const buildQueryFn = queryClient => async ctx => {
  const [_key, params] = ctx.queryKey
  const { data } = await getProfiles(params)

  const profiles = data?.items ?? []

  const countryIds = profiles.map(place => place.countryId)
  await preloadCountries(countryIds, queryClient)

  cacheProfiles(profiles, queryClient)

  return data
}

const cacheOptions = {
  cacheTime: 60 * 10 * 1000,
  staleTime: 60 * 10 * 1000
}

export const profilesQuery = (params, queryClient) => ({
  queryKey: ['profiles', params].filter(Boolean),
  queryFn: buildQueryFn(queryClient),
  ...cacheOptions
})

export const useProfilesQuery = params => {
  const queryClient = useQueryClient()

  return useQuery(profilesQuery(params, queryClient))
}
