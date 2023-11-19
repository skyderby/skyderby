import client from 'api/client'
import { QueryFunction, useSuspenseQuery } from '@tanstack/react-query'
import {
  elementEndpoint,
  standingsResponseSchema,
  StandingsResponse,
  cacheStandingRelations
} from './common'

type Params = { page?: number }
type QueryKey = ['onlineRankingIntervalStandings', number, string, Params?]

const getStandings = (id: number, slug: string, params: Params = {}) => {
  const urlParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) =>
    urlParams.append(key, value.toString())
  )
  const url = `${elementEndpoint(id)}/interval_standings/${slug}?${urlParams}`

  return client.get(url).then(response => standingsResponseSchema.parse(response.data))
}

const queryFn: QueryFunction<
  Omit<StandingsResponse, 'relations'>,
  QueryKey
> = async ctx => {
  const [, id, slug, params] = ctx.queryKey
  const { relations, ...data } = await getStandings(id, slug, params)

  cacheStandingRelations(relations)

  return data
}

const useAnnualStandingsQuery = (id: number, slug: string, params?: { page: number }) =>
  useSuspenseQuery({
    queryKey: ['onlineRankingIntervalStandings', id, slug, params],
    queryFn
  })

export default useAnnualStandingsQuery
