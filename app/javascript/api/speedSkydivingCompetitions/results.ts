import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryFunction,
  UseQueryOptions,
  UseQueryResult,
  UseMutationResult
} from 'react-query'
import client, { AxiosError, AxiosResponse } from 'api/client'
import { parseISO } from 'date-fns'

import { standingsQuery } from './standings'
import { trackQuery } from 'api/tracks/track'
import { pointsQuery } from 'api/tracks/points'
import { Result } from './types'
import { openStandingsQuery } from 'api/speedSkydivingCompetitions/openStandings'
import { teamStandingsQuery } from 'api/speedSkydivingCompetitions/teamStandings'

type QueryKey = ['speedSkydivingCompetitions', number, 'results']

export type CreateVariables = {
  eventId: number
  competitorId: number
  roundId: number
  trackFrom: 'from_file' | 'existent'
  trackFile: File | null
  trackId: number | null
}

type UpdateVariables = {
  eventId: number
  id: number
  trackAttributes?: {
    ffStart: number
    ffEnd: number
  }
}

type DeleteVariables = {
  eventId: number
  id: number
}

type PenaltiesVariables = {
  penaltiesAttributes: Result['penalties']
}

type MutationOptions = {
  onSuccess?: (param: Result) => unknown
}

type SerializedResult = {
  [K in keyof Result]: Result[K] extends Date ? string : Result[K]
}

export type NewResultMutation = UseMutationResult<
  AxiosResponse<SerializedResult>,
  AxiosError<{ error: string }>,
  CreateVariables
>

const collectionEndpoint = (eventId: number) =>
  `/api/v1/speed_skydiving_competitions/${eventId}/results`
const elementEndpoint = (eventId: number, id: number) =>
  `${collectionEndpoint(eventId)}/${id}`
const penaltiesEndpoint = (eventId: number, id: number) =>
  `${elementEndpoint(eventId, id)}/penalties`

const deserialize = (result: SerializedResult): Result => ({
  ...result,
  windowStartTime: parseISO(result.windowStartTime),
  windowEndTime: parseISO(result.windowEndTime),
  createdAt: parseISO(result.createdAt),
  updatedAt: parseISO(result.updatedAt)
})

const getResults = (eventId: number) =>
  client
    .get<never, AxiosResponse<SerializedResult[]>>(collectionEndpoint(eventId))
    .then(response => response.data)

const createResult = ({ eventId, ...values }: CreateVariables) => {
  const formData = new FormData()
  Object.entries(values).forEach(([key, value]) => formData.set(`result[${key}]`, value))

  return client.post<FormData, AxiosResponse<SerializedResult>>(
    collectionEndpoint(eventId),
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  )
}

const updateResult = ({ eventId, id, ...result }: UpdateVariables) =>
  client.put<
    { result: Omit<UpdateVariables, 'id' | 'eventId'> },
    AxiosResponse<SerializedResult>
  >(elementEndpoint(eventId, id), { result })

const deleteResult = ({ eventId, id }: DeleteVariables) =>
  client.delete<never, AxiosResponse<SerializedResult>>(elementEndpoint(eventId, id))

const updateResultPenalties = (
  eventId: number,
  id: number,
  penalties: PenaltiesVariables
) =>
  client.put<PenaltiesVariables, AxiosResponse<SerializedResult>>(
    penaltiesEndpoint(eventId, id),
    penalties
  )

const queryKey = (eventId: number): QueryKey => [
  'speedSkydivingCompetitions',
  eventId,
  'results'
]

const queryFn: QueryFunction<Result[], QueryKey> = async ctx => {
  const [_key, eventId] = ctx.queryKey
  const results = await getResults(eventId)
  return results.map(deserialize)
}

const resultsQuery = <Type = Result[]>(
  eventId: number
): UseQueryOptions<Result[], Error, Type, QueryKey> => ({
  queryKey: queryKey(eventId),
  queryFn
})

export const preloadResults = (
  eventId: number,
  queryClient: QueryClient
): Promise<void> => queryClient.prefetchQuery(resultsQuery(eventId))

export const useResultsQuery = <Type = Result[]>(
  eventId: number,
  options: UseQueryOptions<Result[], Error, Type, QueryKey>
): UseQueryResult<Type> => useQuery({ ...resultsQuery<Type>(eventId), ...options })

export const useResultQuery = (
  eventId: number,
  id: number
): UseQueryResult<Result | undefined> =>
  useResultsQuery<Result | undefined>(eventId, {
    select: (data: Result[]) => data.find(result => result.id === id)
  })

export const useNewResultMutation = (
  options: MutationOptions = {}
): NewResultMutation => {
  const queryClient = useQueryClient()

  return useMutation(createResult, {
    async onSuccess(response, { eventId }) {
      const data: Result[] = queryClient.getQueryData(queryKey(eventId)) ?? []
      const result = deserialize(response.data)

      queryClient.setQueryData(queryKey(eventId), [...data, result])
      await queryClient.refetchQueries(standingsQuery(eventId))
      options.onSuccess?.(result)
    }
  })
}

export const useEditResultMutation = (
  options: MutationOptions = {}
): UseMutationResult<AxiosResponse<SerializedResult>, AxiosError, UpdateVariables> => {
  const queryClient = useQueryClient()

  return useMutation(updateResult, {
    async onSuccess(response, { eventId, id }) {
      const data: Result[] = queryClient.getQueryData(queryKey(eventId)) ?? []
      const updatedResult = deserialize(response.data)
      queryClient.setQueryData(
        queryKey(eventId),
        data.map(result => (result.id === id ? updatedResult : result))
      )
      await Promise.all([
        queryClient.invalidateQueries(
          trackQuery(response.data.trackId, queryClient).queryKey
        ),
        queryClient.invalidateQueries(
          pointsQuery(response.data.trackId, { originalFrequency: true }).queryKey,
          { refetchInactive: true }
        )
      ])

      options.onSuccess?.(updatedResult)
    }
  })
}

export const useDeleteResultMutation = (
  options: MutationOptions = {}
): UseMutationResult<
  AxiosResponse<SerializedResult>,
  AxiosError<Record<string, string[]>>,
  DeleteVariables
> => {
  const queryClient = useQueryClient()

  return useMutation(deleteResult, {
    async onSuccess(response, { eventId, id }) {
      const data: Result[] = queryClient.getQueryData(queryKey(eventId)) ?? []
      const result = deserialize(response.data)
      queryClient.setQueryData(
        queryKey(eventId),
        data.filter(result => result.id !== id)
      )
      await queryClient.refetchQueries(standingsQuery(eventId))
      options.onSuccess?.(result)
    }
  })
}

export const useSetResultPenaltiesMutation = (
  eventId: number,
  id: number
): UseMutationResult<
  AxiosResponse<SerializedResult>,
  AxiosError<Record<string, string[]>>,
  PenaltiesVariables
> => {
  const queryClient = useQueryClient()

  const mutationFn = (variables: PenaltiesVariables) =>
    updateResultPenalties(eventId, id, variables)

  return useMutation(mutationFn, {
    async onSuccess(response) {
      const data: Result[] = queryClient.getQueryData(queryKey(eventId)) ?? []
      const updatedResult = deserialize(response.data)
      queryClient.setQueryData(
        queryKey(eventId),
        data.map(result => (result.id === id ? updatedResult : result))
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
