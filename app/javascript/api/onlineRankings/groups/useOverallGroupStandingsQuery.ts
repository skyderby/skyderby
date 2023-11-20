import client, { AxiosResponse } from 'api/client'
import { QueryFunction, useSuspenseQuery } from '@tanstack/react-query'
import { cacheProfiles, ProfileRecord } from 'api/profiles'
import { SuitCategory } from 'api/suits'
import { OnlineRanking } from 'api/onlineRankings'

type QueryKey = ['onlineRankingOverallGroupStandings', number, Params]

export type GroupStandingsRow = {
  rank: number
  profileId: number
  results: Record<
    OnlineRanking['discipline'],
    {
      rank: number
      result: number
      points: number
      suitId: number
      trackId: number
    }
  >
  totalPoints: number
}

export type GroupStandings = {
  category: SuitCategory
  rows: GroupStandingsRow[]
}

type GroupStandingsResponse = AxiosResponse<{
  standings: GroupStandings[]
  relations: {
    profiles: ProfileRecord[]
  }
}>

type Params = {
  windCancellation?: boolean
  selectedTask?: string | null
}

const endpoint = (groupId: number) =>
  `/api/v1/online_rankings/groups/${groupId}/overall_standings`

const getStandings = (groupId: number, params: Params) => {
  const urlParams = new URLSearchParams()
  urlParams.set('windCancellation', String(params.windCancellation))
  if (params.selectedTask) urlParams.set('selectedTask', params.selectedTask)

  const url = `${endpoint(groupId)}?${urlParams.toString()}`

  return client.get<never, GroupStandingsResponse>(url).then(response => response.data)
}

const queryFn: QueryFunction<GroupStandings[], QueryKey> = async ctx => {
  const [, groupId, params] = ctx.queryKey
  const { standings, relations } = await getStandings(groupId, params)

  cacheProfiles(relations.profiles)

  return standings
}

const useOverallGroupStandingsQuery = (groupId: number, params: Params = {}) =>
  useSuspenseQuery({
    queryKey: ['onlineRankingOverallGroupStandings', groupId, params],
    queryFn
  })

export default useOverallGroupStandingsQuery
