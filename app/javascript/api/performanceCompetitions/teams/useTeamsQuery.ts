import { QueryFunction, useQuery, UseQueryOptions } from 'react-query'
import { AxiosError, AxiosResponse } from 'axios'
import client from 'api/client'
import { queryKey, collectionUrl, deserialize } from './common'
import type { Team, SerializedTeam, QueryKey } from './common'

type Options<T> = UseQueryOptions<
  Team[],
  AxiosError<Record<string, string[]>>,
  T,
  QueryKey
>

const getTeams = (eventId: number) =>
  client
    .get<never, AxiosResponse<SerializedTeam[]>>(collectionUrl(eventId))
    .then(response => response.data)

const queryFn: QueryFunction<Team[], QueryKey> = async ctx => {
  const [_key, eventId] = ctx.queryKey
  const data = await getTeams(eventId)

  return data.map(deserialize)
}

const teamsQuery = <T = Team[]>(eventId: number, options: Options<T>): Options<T> => ({
  queryKey: queryKey(eventId),
  queryFn,
  ...options
})

const useTeamsQuery = <Type = Team[]>(eventId: number, options: Options<Type> = {}) =>
  useQuery(teamsQuery(eventId, options))

export default useTeamsQuery
