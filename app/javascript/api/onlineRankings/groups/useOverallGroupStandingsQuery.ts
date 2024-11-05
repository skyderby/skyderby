import client from 'api/client'
import { QueryFunction, useSuspenseQuery } from '@tanstack/react-query'
import { cacheProfiles } from 'api/profiles'
import { groupStandingsResponseSchema, GroupStandings } from './common'

type QueryKey = ['onlineRankingOverallGroupStandings', number, Params]

type Params = {
  windCancellation?: boolean
  selectedTask?: string | null
}

const endpoint = (groupId: number) =>
  `/api/web/online_rankings/groups/${groupId}/overall_standings`

const getStandings = (groupId: number, params: Params) => {
  const urlParams = new URLSearchParams()
  urlParams.set('windCancellation', String(params.windCancellation))
  if (params.selectedTask) urlParams.set('selectedTask', params.selectedTask)

  const url = `${endpoint(groupId)}?${urlParams.toString()}`

  return client
    .get(url)
    .then(response => groupStandingsResponseSchema.parse(response.data))
}

const queryFn: QueryFunction<GroupStandings[], QueryKey> = async ctx => {
  const [, groupId, params] = ctx.queryKey
  const { data, relations } = await getStandings(groupId, params)

  cacheProfiles(relations.profiles)

  return data
}

const useOverallGroupStandingsQuery = (groupId: number, params: Params = {}) =>
  useSuspenseQuery({
    queryKey: ['onlineRankingOverallGroupStandings', groupId, params],
    queryFn
  })

export default useOverallGroupStandingsQuery
