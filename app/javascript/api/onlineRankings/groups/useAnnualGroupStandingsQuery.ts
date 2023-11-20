import client from 'api/client'
import { QueryFunction, useSuspenseQuery } from '@tanstack/react-query'
import { cacheProfiles } from 'api/profiles'
import { groupStandingsResponseSchema, GroupStandings } from './common'

type QueryKey = ['onlineRankingAnnualGroupStandings', number, number, Params]

type Params = {
  windCancellation?: boolean
  selectedTask?: string | null
}

const endpoint = (groupId: number) =>
  `/api/v1/online_rankings/groups/${groupId}/annual_standings`

const getStandings = (groupId: number, year: number, params: Params) => {
  const urlParams = new URLSearchParams()
  urlParams.set('windCancellation', String(params.windCancellation))
  if (params.selectedTask) urlParams.set('selectedTask', params.selectedTask)

  const url = `${endpoint(groupId)}/${year}?${urlParams.toString()}`

  return client
    .get(url)
    .then(response => groupStandingsResponseSchema.parse(response.data))
}

const queryFn: QueryFunction<GroupStandings[], QueryKey> = async ctx => {
  const [, groupId, year, params] = ctx.queryKey
  const { data, relations } = await getStandings(groupId, year, params)

  cacheProfiles(relations.profiles)

  return data
}

const useAnnualGroupStandingsQuery = (
  groupId: number,
  year: number,
  params: Params = {}
) =>
  useSuspenseQuery({
    queryKey: ['onlineRankingAnnualGroupStandings', groupId, year, params],
    queryFn
  })

export default useAnnualGroupStandingsQuery
