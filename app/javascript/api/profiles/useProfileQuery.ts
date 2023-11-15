import client, { AxiosResponse } from 'api/client'
import {
  useQuery,
  QueryFunction,
  UseQueryOptions,
  UseQueryResult
} from '@tanstack/react-query'
import { ProfileRecord, profileSchema, elementEndpoint } from './common'
import { preloadCountries } from 'api/countries'
import queryClient from 'components/queryClient'

export type RecordQueryKey = ['profiles', number | null | undefined]

export const recordQueryKey = (id: number | null | undefined): RecordQueryKey => [
  'profiles',
  id
]

export const getProfile = (id: number): Promise<ProfileRecord> =>
  client
    .get<never, AxiosResponse<ProfileRecord>>(elementEndpoint(id))
    .then(response => profileSchema.parse(response.data))

type QueryOptions = UseQueryOptions<ProfileRecord, Error, ProfileRecord, RecordQueryKey>

const queryFn: QueryFunction<ProfileRecord, RecordQueryKey> = async ctx => {
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

export const profileQuery = (id: number | null | undefined): QueryOptions => ({
  queryKey: recordQueryKey(id),
  queryFn,
  enabled: Boolean(id),
  gcTime: 60 * 10 * 1000,
  staleTime: 60 * 10 * 1000
})

const useProfileQuery = (
  id: number | null | undefined,
  options: Omit<QueryOptions, 'queryKey' | 'queryFn'> = {}
): UseQueryResult<ProfileRecord> => useQuery({ ...profileQuery(id), ...options })

export default useProfileQuery
