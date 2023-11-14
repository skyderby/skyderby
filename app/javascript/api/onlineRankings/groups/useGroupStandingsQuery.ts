import client, { AxiosResponse } from 'api/client'
import { QueryFunction, useSuspenseQuery } from '@tanstack/react-query'
import { cacheProfiles, ProfileRecord } from 'api/profiles'
import { SuitCategory } from 'api/suits'
import queryClient from 'components/queryClient'
import { OnlineRanking } from 'api/onlineRankings'

type QueryKey = ['onlineRankingGroupStandings', number]

export type GroupStandingsRow = {
  rank: number
  profileId: number
  results: Record<
    OnlineRanking['discipline'],
    {
      result: number
      points: number
      suitId: number
    }
  >
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

const endpoint = (groupId: number) =>
  `/api/v1/online_rankings/groups/${groupId}/overall_standings`

const getStandings = (groupId: number) =>
  client
    .get<never, GroupStandingsResponse>(endpoint(groupId))
    .then(response => response.data)

const queryFn: QueryFunction<GroupStandings[], QueryKey> = async ctx => {
  const [_key, groupId] = ctx.queryKey
  const { standings, relations } = await getStandings(groupId)

  cacheProfiles(relations.profiles, queryClient)

  return standings
}

const useGroupStandingsQuery = (groupId: number) =>
  useSuspenseQuery({
    queryKey: ['onlineRankingGroupStandings', groupId],
    queryFn
  })

export default useGroupStandingsQuery
