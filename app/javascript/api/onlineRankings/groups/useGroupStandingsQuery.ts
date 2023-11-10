import client, { AxiosResponse } from 'api/client'
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

const getStandings = (groupId: number) =>
  client
    .get<never, AxiosResponse<GroupStandings[]>>(endpoint(groupId))
    .then(response => response.data)

const queryFn: QueryFunction<GroupStandings[], QueryKey> = ctx => {
  const [_key, groupId] = ctx.queryKey
  return getStandings(groupId)
}

const useGroupStandingsQuery = (groupId: number) =>
  useQuery({
    queryKey: ['onlineRankingGroupStandings', groupId],
    queryFn
  })

export default useGroupStandingsQuery
