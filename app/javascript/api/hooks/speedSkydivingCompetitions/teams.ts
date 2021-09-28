import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryFunction,
  UseQueryOptions,
  QueryClient,
  UseQueryResult,
  UseMutationResult
} from 'react-query'
import axios, { AxiosError, AxiosResponse } from 'axios'
import { parseISO } from 'date-fns'

import { competitorsQuery } from './competitors'
import { teamStandingsQuery } from './teamStandings'
import { TeamRecord } from './types'

type SerializedTeam = {
  [K in keyof TeamRecord]: TeamRecord[K] extends Date ? string : TeamRecord[K]
}

const collectionUrl = (eventId: number) =>
  `/api/v1/speed_skydiving_competitions/${eventId}/teams`
const elementUrl = (eventId: number, id: number) => `${collectionUrl(eventId)}/${id}`

const getTeams = (eventId: number): Promise<SerializedTeam[]> =>
  axios.get(collectionUrl(eventId)).then(response => response.data)

const createTeam = ({
  eventId,
  ...team
}: Omit<TeamRecord, 'id'> & { eventId: number }): Promise<
  AxiosResponse<SerializedTeam>
> => axios.post(collectionUrl(eventId), { team })

const updateTeam = ({
  eventId,
  id,
  ...team
}: TeamRecord & { eventId: number }): Promise<AxiosResponse<SerializedTeam>> =>
  axios.put(elementUrl(eventId, id), { team })

const deleteTeam = ({
  eventId,
  id
}: {
  eventId: number
  id: TeamRecord['id']
}): Promise<AxiosResponse<SerializedTeam>> => axios.delete(elementUrl(eventId, id))

type QueryKey = ['speedSkydivingCompetitions', number, 'teams']

const queryKey = (eventId: number): QueryKey => [
  'speedSkydivingCompetitions',
  eventId,
  'teams'
]

const deserialize = (team: SerializedTeam): TeamRecord => ({
  ...team,
  createdAt: parseISO(team.createdAt),
  updatedAt: parseISO(team.updatedAt)
})

const queryFn: QueryFunction<TeamRecord[], QueryKey> = ctx => {
  const [_key, eventId] = ctx.queryKey
  return getTeams(eventId).then(teams => teams.map(deserialize))
}

const teamsQuery = <Type = TeamRecord[]>(
  eventId: number,
  options: UseQueryOptions<TeamRecord[], Error, Type, QueryKey> = {}
): UseQueryOptions<TeamRecord[], Error, Type, QueryKey> => ({
  queryKey: queryKey(eventId),
  queryFn,
  ...options
})

export const preloadTeams = (eventId: number, queryClient: QueryClient): Promise<void> =>
  queryClient.prefetchQuery(teamsQuery(eventId))

export const useTeamsQuery = <Type = TeamRecord[]>(
  eventId: number,
  options: UseQueryOptions<TeamRecord[], Error, Type, QueryKey> = {}
): UseQueryResult<Type> =>
  useQuery({
    ...teamsQuery<Type>(eventId),
    ...options
  })

export const useTeamQuery = (
  eventId: number,
  id: number
): UseQueryResult<TeamRecord | undefined> =>
  useTeamsQuery<TeamRecord | undefined>(eventId, {
    select: (data: TeamRecord[]) => data.find(team => team.id === id)
  })

export const useNewTeamMutation = (): UseMutationResult<
  AxiosResponse<SerializedTeam>,
  AxiosError,
  Omit<TeamRecord, 'id'> & { eventId: number }
> => {
  const queryClient = useQueryClient()

  return useMutation(createTeam, {
    async onSuccess(response, { eventId }) {
      await Promise.all([
        queryClient.refetchQueries(teamStandingsQuery(eventId)),
        queryClient.refetchQueries(competitorsQuery(eventId, queryClient))
      ])

      const team = deserialize(response.data)
      const data: TeamRecord[] = queryClient.getQueryData(queryKey(eventId)) ?? []
      queryClient.setQueryData(queryKey(eventId), [...data, team])
    }
  })
}

export const useEditTeamMutation = (): UseMutationResult<
  AxiosResponse<SerializedTeam>,
  AxiosError,
  TeamRecord & { eventId: number }
> => {
  const queryClient = useQueryClient()

  return useMutation(updateTeam, {
    async onSuccess(response, { eventId, id }) {
      await Promise.all([
        queryClient.refetchQueries(teamStandingsQuery(eventId)),
        queryClient.refetchQueries(competitorsQuery(eventId, queryClient))
      ])

      const updatedTeam = deserialize(response.data)
      const data: TeamRecord[] = queryClient.getQueryData(queryKey(eventId)) ?? []
      queryClient.setQueryData(
        queryKey(eventId),
        data.map(team => (team.id === id ? updatedTeam : team))
      )
    }
  })
}

export const useDeleteTeamMutation = (): UseMutationResult<
  AxiosResponse<SerializedTeam>,
  AxiosError,
  { eventId: number; id: number }
> => {
  const queryClient = useQueryClient()

  return useMutation(deleteTeam, {
    async onSuccess(response, { eventId, id }) {
      await Promise.all([
        queryClient.refetchQueries(teamStandingsQuery(eventId)),
        queryClient.refetchQueries(competitorsQuery(eventId, queryClient))
      ])

      const data: TeamRecord[] = queryClient.getQueryData(queryKey(eventId)) ?? []
      queryClient.setQueryData(
        queryKey(eventId),
        data.filter(team => team.id !== id)
      )
    }
  })
}
