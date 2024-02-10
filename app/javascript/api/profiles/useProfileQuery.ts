import client from 'api/client'
import {
  useQuery,
  QueryFunction,
  UseQueryOptions,
  UseQueryResult
} from '@tanstack/react-query'
import { Profile, profileSchema, elementEndpoint } from './common'
import { preloadCountries } from 'api/countries'
import queryClient from 'components/queryClient'

export type RecordQueryKey = ['profiles', number | null | undefined]

export const recordQueryKey = (id: number | null | undefined): RecordQueryKey => [
  'profiles',
  id
]

export const getProfile = (id: number): Promise<Profile> =>
  client
    .get<never>(elementEndpoint(id))
    .then(response => profileSchema.parse(response.data))

type QueryOptions = UseQueryOptions<Profile, Error, Profile, RecordQueryKey>

const queryFn: QueryFunction<Profile, RecordQueryKey> = async ctx => {
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
): UseQueryResult<Profile> => useQuery({ ...profileQuery(id), ...options })

export default useProfileQuery
