import { QueryFunction, useSuspenseQuery } from '@tanstack/react-query'
import { z } from 'zod'
import client from 'api/client'
import { elementEndpoint, OnlineRanking, onlineRankingSchema } from './common'
import { cachePlaces, placeSchema } from 'api/places'
import { cacheGroups, onlineRankingGroupSchema } from './groups'

type QueryKey = ['onlineRanking', number]

const showResponse = z.object({
  data: onlineRankingSchema,
  relations: z.object({
    places: z.array(placeSchema),
    groups: z.array(onlineRankingGroupSchema)
  })
})
const getRanking = (id: number) =>
  client.get(elementEndpoint(id)).then(response => showResponse.parse(response.data))

const queryFn: QueryFunction<OnlineRanking, QueryKey> = async ctx => {
  const [, id] = ctx.queryKey
  const { data, relations } = await getRanking(id)

  cacheGroups(relations.groups)
  cachePlaces(relations.places)

  return data
}

const useOnlineRankingQuery = (id: number) =>
  useSuspenseQuery({ queryKey: ['onlineRanking', id], queryFn })

export default useOnlineRankingQuery
