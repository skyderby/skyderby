import { useQueries, useQuery, useQueryClient } from 'react-query'
import axios from 'axios'

import { preloadCountries } from 'api/hooks/countries'
import { loadIds } from 'api/helpers'

const endpoint = '/api/v1/profiles'

const getProfile = id => axios.get(`${endpoint}/${id}`)

const getProfilesById = ids => loadIds(endpoint, ids)

const buildQueryFn = queryClient => async ctx => {
  const [_key, id] = ctx.queryKey
  const { data } = await getProfile(id)

  if (data.countryId) {
    await preloadCountries([data.countryId], queryClient)
  }

  return data
}

const profileQuery = (id, queryClient) => ({
  queryKey: getQueryKey(id),
  queryFn: buildQueryFn(queryClient),
  enabled: !!id,
  staleTime: 5 * 60 * 1000
})

export const getQueryKey = id => ['profiles', id]

export const preloadProfiles = async (ids, queryClient) => {
  const missingIds = ids
    .filter(Boolean)
    .filter(id => !queryClient.getQueryData(getQueryKey(id)))

  if (missingIds.length === 0) return

  const { items: profiles } = await getProfilesById(missingIds)
  profiles.forEach(profile => queryClient.setQueryData(getQueryKey(profile.id), profile))

  await preloadCountries(
    profiles.map(profile => profile.countryId),
    queryClient
  )

  return profiles
}

export const useProfileQuery = id => {
  const queryClient = useQueryClient()
  return useQuery(profileQuery(id, queryClient))
}

export const useProfileQueries = ids => {
  const queryClient = useQueryClient()

  return useQueries(ids.map(id => profileQuery(id, queryClient)))
}
