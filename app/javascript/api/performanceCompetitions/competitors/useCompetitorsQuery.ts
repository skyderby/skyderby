import {
  QueryFunction,
  useQuery,
  UseQueryOptions,
  UseQueryResult
} from '@tanstack/react-query'
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

const queryFn: QueryFunction<Competitor[], QueryKey> = async ctx => {
  const [_key, eventId] = ctx.queryKey
  const { items, relations } = await getCompetitors(eventId)

  cacheProfiles(relations.profiles)
  cacheCountries(relations.countries)
  cacheSuits(relations.suits)

  return items.map(deserialize)
}

export const competitorsQuery = (eventId: number) => ({
  queryKey: queryKey(eventId),
  queryFn
})

const useCompetitorsQuery = <T = Competitor[]>(
  eventId: number,
  options: Omit<
    UseQueryOptions<Competitor[], AxiosError, T, QueryKey>,
    'queryKey' | 'queryFn'
  > = {}
): UseQueryResult<T> => useQuery({ ...competitorsQuery(eventId), ...options })

export default useCompetitorsQuery
