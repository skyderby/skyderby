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

import { Round } from './types'

type QueryKey = ['speedSkydivingCompetitions', number, 'rounds']

type SerializedData = {
  [K in keyof Round]: Round[K] extends Date ? string : Round[K]
}

const endpoint = (eventId: number) =>
  `/api/v1/speed_skydiving_competitions/${eventId}/rounds`

const getRounds = (eventId: number) =>
  axios
    .get<never, AxiosResponse<SerializedData[]>>(endpoint(eventId))
    .then(response => response.data)

const createRound = (eventId: number) =>
  axios.post<never, AxiosResponse<SerializedData>>(endpoint(eventId))

type DeleteVariables = {
  eventId: number
  roundId: number
}

const deleteRound = ({
  eventId,
  roundId
}: DeleteVariables): Promise<AxiosResponse<Round>> =>
  axios.delete(`${endpoint(eventId)}/${roundId}`)

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

export const useDeleteRoundMutation = (): UseMutationResult<
  AxiosResponse<Round>,
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
