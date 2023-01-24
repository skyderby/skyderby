import client from 'api/client'
import { QueryFunction, useQuery } from 'react-query'
import { SuitCategory } from 'api/suits'

type QueryKey = ['onlineRankingGroupStandings', number]

type GroupStandings = {
  category: SuitCategory
  rows: {
    rank: number
    profileId: number
  }[]
}

const endpoint = (groupId: number) =>
  `/api/v1/online_rankings/groups/${groupId}/overall_standings`

const getStandings = (groupId: number) => client.get(endpoint(groupId))

const queryFn: QueryFunction<, QueryKey> = ctx => {
  const [_key, groupId] = ctx.queryKey
  return getStandings(groupId).then(response => response.data)
}

const useGroupStandingsQuery = (groupId: number) =>
  useQuery({
    queryKey: ['onlineRankingGroupStandings', groupId] as const,
    queryFn
  })

export default useGroupStandingsQuery
