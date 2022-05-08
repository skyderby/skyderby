import {
  QueryClient,
  QueryFunction,
  useQuery,
  useQueryClient,
  UseQueryOptions,
  UseQueryResult
} from 'react-query'
import { AxiosError } from 'axios'

import client, { AxiosResponse } from 'api/client'
import { cacheProfiles } from 'api/profiles'
import { cacheCountries } from 'api/countries'
import { cacheSuits } from 'api/suits'
import {
  queryKey,
  collectionEndpoint,
  IndexResponse,
  Competitor,
  QueryKey,
  deserialize
} from './common'

const getCompetitors = (eventId: number) =>
  client
    .get<never, AxiosResponse<IndexResponse>>(collectionEndpoint(eventId))
    .then(response => response.data)

const buildQueryFn = (
  queryClient: QueryClient
): QueryFunction<Competitor[], QueryKey> => async ctx => {
  const [_key, eventId] = ctx.queryKey
  const { items, relations } = await getCompetitors(eventId)

  cacheProfiles(relations.profiles, queryClient)
  cacheCountries(relations.countries, queryClient)
  cacheSuits(relations.suits, queryClient)

  return items.map(deserialize)
}

export const competitorsQuery = (eventId: number, queryClient: QueryClient) => ({
  queryKey: queryKey(eventId),
  queryFn: buildQueryFn(queryClient)
})

const useCompetitorsQuery = <T = Competitor[]>(
  eventId: number,
  options: UseQueryOptions<Competitor[], AxiosError, T, QueryKey> = {}
): UseQueryResult<T> => {
  const queryClient = useQueryClient()

  return useQuery({ ...competitorsQuery(eventId, queryClient), ...options })
}

export default useCompetitorsQuery
