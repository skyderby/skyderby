import client, { AxiosResponse } from 'api/client'
import { QueryFunction, useQuery } from 'react-query'
import { OnlineRankingGroup } from './common'

type QueryKey = ['onlineRankingGroup', number]

const endpoint = (groupId: number) => `/api/v1/online_rankings/groups/${groupId}`

const getGroup = (groupId: number) =>
  client
    .get<never, AxiosResponse<OnlineRankingGroup>>(endpoint(groupId))
    .then(response => response.data)

const queryFn: QueryFunction<OnlineRankingGroup, QueryKey> = ctx => {
  const [_key, groupId] = ctx.queryKey
  return getGroup(groupId)
}

const useGroupStandingsQuery = (groupId: number) =>
  useQuery({
    queryKey: ['onlineRankingGroup', groupId],
    queryFn
  })

export default useGroupStandingsQuery
