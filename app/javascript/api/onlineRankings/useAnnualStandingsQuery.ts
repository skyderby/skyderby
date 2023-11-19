import client from 'api/client'
import { QueryFunction, useSuspenseQuery } from '@tanstack/react-query'
import { cacheProfiles } from 'api/profiles'
import { cacheCountries } from 'api/countries'
import { cacheSuits } from 'api/suits'
import { cachePlaces } from 'api/places'
import { cacheManufacturers } from 'api/manufacturer'
import { elementEndpoint, standingsResponseSchema, StandingsResponse } from './common'

type Params = { page?: number }
type QueryKey = ['onlineRankingAnnualStandings', number, number, Params?]

const getStandings = (id: number, year: number, params: Params = {}) => {
  const urlParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) =>
    urlParams.append(key, value.toString())
  )
  const url = `${elementEndpoint(id)}/annual_standings/${year}?${urlParams}`

  return client.get(url).then(response => standingsResponseSchema.parse(response.data))
}

const queryFn: QueryFunction<
  Omit<StandingsResponse, 'relations'>,
  QueryKey
> = async ctx => {
  const [, id, year, params] = ctx.queryKey
  const { relations, ...data } = await getStandings(id, year, params)

  cacheProfiles(relations.profiles)
  cacheCountries(relations.countries)
  cacheSuits(relations.suits)
  cachePlaces(relations.places)
  cacheManufacturers(relations.manufacturers)

  return data
}

const useAnnualStandingsQuery = (id: number, year: number, params?: { page: number }) =>
  useSuspenseQuery({
    queryKey: ['onlineRankingAnnualStandings', id, year, params],
    queryFn
  })

export default useAnnualStandingsQuery
