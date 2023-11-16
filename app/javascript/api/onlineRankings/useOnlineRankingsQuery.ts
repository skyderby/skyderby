import { QueryFunction, UseQueryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import client from 'api/client'
import queryClient from 'components/queryClient'
import { cachePlaces, placeSchema } from 'api/places'
import { cacheCountries, countrySchema } from 'api/countries'
import { cacheGroups, onlineRankingGroupSchema } from './groups'
import { OnlineRanking, collectionEndpoint, onlineRankingSchema } from './common'
import { z } from 'zod'

type QueryKey = ['onlineRankings']
const queryKey: QueryKey = ['onlineRankings']

const indexResponseSchema = z.object({
  data: z.array(onlineRankingSchema),
  relations: z.object({
    places: z.array(placeSchema),
    countries: z.array(countrySchema),
    groups: z.array(onlineRankingGroupSchema)
  })
})

const getRankings = () =>
  client
    .get(collectionEndpoint)
    .then(response => indexResponseSchema.parse(response.data))

const queryFn: QueryFunction<OnlineRanking[], QueryKey> = async () => {
  const { data, relations } = await getRankings()

  cachePlaces(relations.places, queryClient)
  cacheCountries(relations.countries, queryClient)
  cacheGroups(relations.groups, queryClient)

  return data
}

const useOnlineRankingsQuery = <Type = OnlineRanking[]>(
  options: Omit<
    UseQueryOptions<OnlineRanking[], AxiosError, Type, QueryKey>,
    'queryKey' | 'queryFn'
  >
) =>
  useSuspenseQuery<OnlineRanking[], AxiosError, Type, QueryKey>({
    ...options,
    queryKey,
    queryFn
  })

export default useOnlineRankingsQuery
