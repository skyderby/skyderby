import {
  QueryClient,
  QueryFunction,
  useQueryClient,
  UseQueryOptions,
  useSuspenseQuery
} from '@tanstack/react-query'
import { AxiosError, AxiosResponse } from 'axios'
import client from 'api/client'
import { cachePlaces } from 'api/places'
import { cacheCountries } from 'api/countries'
import { IndexResponse, OnlineRanking, deserialize, collectionEndpoint } from './common'
import { cacheGroups } from './groups'

type QueryKey = ['onlineRankings']
const queryKey: QueryKey = ['onlineRankings']

type QueryResult<T = OnlineRanking> = Omit<IndexResponse, 'items' | 'relations'> & {
  items: T[]
}
const getRankings = () =>
  client
    .get<never, AxiosResponse<IndexResponse>>(collectionEndpoint)
    .then(response => response.data)

const buildQueryFn = (
  queryClient: QueryClient
): QueryFunction<QueryResult, QueryKey> => async () => {
  const { items, relations, ...rest } = await getRankings()

  cachePlaces(relations.places, queryClient)
  cacheCountries(relations.countries, queryClient)
  cacheGroups(relations.groups, queryClient)

  return { items: items.map(deserialize), ...rest }
}

const useOnlineRankingsQuery = <Type>(
  options: Omit<
    UseQueryOptions<QueryResult<OnlineRanking>, AxiosError, Type, QueryKey>,
    'queryKey' | 'queryFn'
  >
) => {
  const queryClient = useQueryClient()

  return useSuspenseQuery<QueryResult<OnlineRanking>, AxiosError, Type, QueryKey>({
    ...options,
    queryKey,
    queryFn: buildQueryFn(queryClient)
  })
}

export default useOnlineRankingsQuery
