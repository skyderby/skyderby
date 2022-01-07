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
import client, { AxiosError, AxiosResponse } from 'api/client'
import { parseISO } from 'date-fns'

import { Round } from './types'
import { standingsQuery } from 'api/speedSkydivingCompetitions/standings'
import { openStandingsQuery } from 'api/speedSkydivingCompetitions/openStandings'
import { teamStandingsQuery } from 'api/speedSkydivingCompetitions/teamStandings'

type QueryKey = ['speedSkydivingCompetitions', number, 'rounds']

type SerializedData = {
  [K in keyof Round]: Round[K] extends Date ? string : Round[K]
}

const collectionEndpoint = (eventId: number) =>
  `/api/v1/speed_skydiving_competitions/${eventId}/rounds`

const recordEndpoint = (eventId: number, roundId: number) =>
  `${collectionEndpoint(eventId)}/${roundId}`

const getRounds = (eventId: number) =>
  client
    .get<never, AxiosResponse<SerializedData[]>>(collectionEndpoint(eventId))
    .then(response => response.data)

const createRound = (eventId: number) =>
  client.post<never, AxiosResponse<SerializedData>>(collectionEndpoint(eventId))

type UpdateVariables = {
  eventId: number
  roundId: number
  completed: boolean
}

const updateRound = ({ eventId, roundId, ...round }: UpdateVariables) =>
  client.put<
    { round: Omit<UpdateVariables, 'eventId' | 'roundId'> },
    AxiosResponse<SerializedData>
  >(recordEndpoint(eventId, roundId), { round })

type DeleteVariables = {
  eventId: number
  roundId: number
}

const deleteRound = ({
  eventId,
  roundId
}: DeleteVariables): Promise<AxiosResponse<SerializedData>> =>
  client.delete(recordEndpoint(eventId, roundId))

const deserialize = (round: SerializedData): Round => ({
  ...round,
  createdAt: parseISO(round.createdAt),
  updatedAt: parseISO(round.updatedAt)
})

const queryKey = (eventId: number): QueryKey => [
  'speedSkydivingCompetitions',
  eventId,
  'rounds'
]

const queryFn: QueryFunction<Round[], QueryKey> = async ctx => {
  const [_key, eventId] = ctx.queryKey
  const rounds = await getRounds(eventId)

  return rounds.map(deserialize)
}

const roundsQuery = <Type = Round[]>(
  eventId: number
): UseQueryOptions<Round[], Error, Type, QueryKey> => ({
  queryKey: queryKey(eventId),
  queryFn
})

export const preloadRounds = (eventId: number, queryClient: QueryClient): Promise<void> =>
  queryClient.prefetchQuery(roundsQuery(eventId))

export const useRoundsQuery = <Type = Round[]>(
  eventId: number,
  options: UseQueryOptions<Round[], Error, Type, QueryKey> = {}
): UseQueryResult<Type> => useQuery({ ...roundsQuery<Type>(eventId), ...options })

export const useRoundQuery = (
  eventId: number,
  id: number
): UseQueryResult<Round | undefined> =>
  useRoundsQuery<Round | undefined>(eventId, {
    select: data => data.find(round => round.id === id)
  })

export const useNewRoundMutation = (): UseMutationResult<
  AxiosResponse<SerializedData>,
  AxiosError,
  number
> => {
  const queryClient = useQueryClient()

  return useMutation(createRound, {
    onSuccess(response, eventId) {
      const data: Round[] = queryClient.getQueryData(queryKey(eventId)) ?? []
      const round = deserialize(response.data)
      queryClient.setQueryData(queryKey(eventId), [...data, round])
    }
  })
}

export const useEditRoundMutation = (): UseMutationResult<
  AxiosResponse<SerializedData>,
  AxiosError,
  UpdateVariables
> => {
  const queryClient = useQueryClient()

  return useMutation(updateRound, {
    onSuccess(response, { eventId }) {
      const data: Round[] = queryClient.getQueryData(queryKey(eventId)) ?? []
      const updatedRound = deserialize(response.data)
      queryClient.setQueryData(
        queryKey(eventId),
        data.map(round => (round.id === updatedRound.id ? updatedRound : round))
      )

      return Promise.all([
        queryClient.invalidateQueries(standingsQuery(eventId).queryKey, {
          refetchInactive: true
        }),
        queryClient.invalidateQueries(openStandingsQuery(eventId).queryKey, {
          refetchInactive: true
        }),
        queryClient.invalidateQueries(teamStandingsQuery(eventId).queryKey, {
          refetchInactive: true
        })
      ])
    }
  })
}

export const useDeleteRoundMutation = (): UseMutationResult<
  AxiosResponse<SerializedData>,
  AxiosError,
  DeleteVariables
> => {
  const queryClient = useQueryClient()

  return useMutation(deleteRound, {
    onSuccess(response, { eventId }) {
      return queryClient.invalidateQueries(queryKey(eventId), { exact: true })
    }
  })
}
