import {
  useSuspenseQuery,
  QueryFunction,
  UseSuspenseQueryOptions,
  UseSuspenseQueryResult
} from '@tanstack/react-query'
import { AxiosError } from 'axios'

import client from 'api/client'
import { cacheProfiles } from 'api/profiles'
import { cacheCountries } from 'api/countries'
import { cacheSuits } from 'api/suits'
import {
  queryKey,
  collectionEndpoint,
  competitorsIndexSchema,
  Competitor,
  QueryKey
} from './common'

const getCompetitors = (eventId: number) =>
  client
    .get<never>(collectionEndpoint(eventId))
    .then(response => competitorsIndexSchema.parse(response.data))

const queryFn: QueryFunction<Competitor[], QueryKey> = async ctx => {
  const [_key, eventId] = ctx.queryKey
  const { items, relations } = await getCompetitors(eventId)

  cacheProfiles(relations.profiles)
  cacheCountries(relations.countries)
  cacheSuits(relations.suits)

  return items
}

export const competitorsQuery = (eventId: number) => ({
  queryKey: queryKey(eventId),
  queryFn
})

const useCompetitorsQuery = <T = Competitor[]>(
  eventId: number,
  options: Omit<
    UseSuspenseQueryOptions<Competitor[], AxiosError, T, QueryKey>,
    'queryKey' | 'queryFn'
  > = {}
): UseSuspenseQueryResult<T> =>
  useSuspenseQuery({ ...competitorsQuery(eventId), ...options })

export default useCompetitorsQuery
