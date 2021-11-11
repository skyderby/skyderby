import {
  QueryClient,
  QueryFunction,
  useQueries,
  useQuery,
  useQueryClient,
  UseQueryOptions,
  UseQueryResult
} from 'react-query'
import { preloadCountries } from 'api/countries'

import { getProfiles, getProfilesById, getProfile } from './requests'
import {
  IndexParams,
  IndexQueryKey,
  ProfilesIndex,
  ProfileRecord,
  RecordQueryKey
} from './types'

const recordQueryKey = (id: number | null | undefined): RecordQueryKey => ['profiles', id]

export const cacheProfiles = (
  profiles: ProfileRecord[],
  queryClient: QueryClient
): void =>
  profiles
    .filter(profile => !queryClient.getQueryData(recordQueryKey(profile.id)))
    .forEach(profile => queryClient.setQueryData(recordQueryKey(profile.id), profile))

const buildProfilesQueryFn = (
  queryClient: QueryClient
): QueryFunction<ProfilesIndex, IndexQueryKey> => async ctx => {
  const [_key, params] = ctx.queryKey
  const data = await getProfiles(params)

  const profiles = data.items

  const countryIds = profiles.map(profile => profile.countryId)
  await preloadCountries(countryIds, queryClient)

  cacheProfiles(profiles, queryClient)

  return data
}

const buildQueryFn = (
  queryClient: QueryClient
): QueryFunction<ProfileRecord, RecordQueryKey> => async ctx => {
  const [_key, id] = ctx.queryKey

  if (typeof id !== 'number') {
    throw new Error(`Expected profile id to be a number, received ${typeof id}`)
  }

  const profile = await getProfile(id)

  if (profile.countryId) {
    await preloadCountries([profile.countryId], queryClient)
  }

  return profile
}

export const preloadProfiles = async (
  ids: number[],
  queryClient: QueryClient
): Promise<ProfileRecord[]> => {
  const missingIds = ids
    .filter(Boolean)
    .filter(id => !queryClient.getQueryData(recordQueryKey(id)))

  if (missingIds.length === 0) return []

  const { items: profiles } = await getProfilesById(missingIds)
  cacheProfiles(profiles, queryClient)

  await preloadCountries(
    profiles.map(profile => profile.countryId),
    queryClient
  )

  return profiles
}

const cacheOptions = {
  cacheTime: 60 * 10 * 1000,
  staleTime: 60 * 10 * 1000
}

export const profilesQuery = (
  params: IndexParams = {},
  queryClient: QueryClient
): UseQueryOptions<ProfilesIndex, Error, ProfilesIndex, IndexQueryKey> => ({
  queryKey: ['profiles', params],
  queryFn: buildProfilesQueryFn(queryClient),
  ...cacheOptions
})

export const useProfilesQuery = (
  params: IndexParams = {}
): UseQueryResult<ProfilesIndex> => {
  const queryClient = useQueryClient()

  return useQuery(profilesQuery(params, queryClient))
}

type QueryOptions = UseQueryOptions<ProfileRecord, Error, ProfileRecord, RecordQueryKey>

const profileQuery = (
  id: number | null | undefined,
  queryClient: QueryClient
): QueryOptions => ({
  queryKey: recordQueryKey(id),
  queryFn: buildQueryFn(queryClient),
  enabled: Boolean(id),
  ...cacheOptions
})

export const useProfileQuery = (
  id: number | null | undefined,
  options: QueryOptions = {}
): UseQueryResult<ProfileRecord> => {
  const queryClient = useQueryClient()
  return useQuery({ ...profileQuery(id, queryClient), ...options })
}

// See: https://github.com/tannerlinsley/react-query/issues/1675
// Unable to type useQueries options or results without casting
export const useProfileQueries = (ids: number[]): UseQueryResult<ProfileRecord>[] => {
  const queryClient = useQueryClient()

  const queries = ids.map(
    id => profileQuery(id, queryClient) as unknown
  ) as UseQueryOptions<unknown, unknown, unknown>[]

  return useQueries(queries) as UseQueryResult<ProfileRecord>[]
}
