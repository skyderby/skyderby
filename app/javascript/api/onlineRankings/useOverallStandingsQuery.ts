import client from 'api/client'
import { QueryFunction, useSuspenseQuery } from '@tanstack/react-query'
import { cacheProfiles } from 'api/profiles'
import { cacheCountries } from 'api/countries'
import { cacheSuits } from 'api/suits'
import { cachePlaces } from 'api/places'
import { cacheManufacturers } from 'api/manufacturer'
import { elementEndpoint, standingsResponseSchema, StandingsResponse } from './common'

type Params = { page?: number }
type QueryKey = ['onlineRankingStandings', number, Params?]

const getStandings = (id: number, params: Params = {}) => {
  const urlParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) =>
    urlParams.append(key, value.toString())
  )
  const url = `${elementEndpoint(id)}/overall_standings?${urlParams}`

  return client.get(url).then(response => standingsResponseSchema.parse(response.data))
}

const queryFn: QueryFunction<
  Omit<StandingsResponse, 'relations'>,
  QueryKey
> = async ctx => {
  const [, id, params] = ctx.queryKey
  const { relations, ...data } = await getStandings(id, params)

  cacheProfiles(relations.profiles)
  cacheCountries(relations.countries)
  cacheSuits(relations.suits)
  cachePlaces(relations.places)
  cacheManufacturers(relations.manufacturers)

  return data
}

const useOverallStandingsQuery = (id: number, params?: { page: number }) =>
  useSuspenseQuery({
    queryKey: ['onlineRankingStandings', id, params],
    queryFn
  })

export default useOverallStandingsQuery
