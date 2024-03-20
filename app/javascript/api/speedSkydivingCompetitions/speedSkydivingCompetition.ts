import {
  QueryClient,
  QueryFunction,
  useMutation,
  UseMutationResult,
  useQuery,
  useQueryClient,
  UseQueryOptions,
  UseQueryResult
} from '@tanstack/react-query'
import client, { AxiosError, AxiosResponse } from 'api/client'
import { parseISO } from 'date-fns'

import { placeQuery } from 'api/places'
import { SpeedSkydivingCompetition } from 'api/speedSkydivingCompetitions/types'
import { EventStatus, EventVisibility } from 'api/events'

type QueryKey = ['speedSkydivingCompetitions', number]

interface MutationOptions {
  onSuccess?: (data: SpeedSkydivingCompetition) => unknown
}

type SerializedData = {
  [K in keyof SpeedSkydivingCompetition]: SpeedSkydivingCompetition[K] extends Date
    ? string
    : SpeedSkydivingCompetition[K]
}

export type EventVariables = Partial<{
  name: string
  startsAt: string
  placeId: number | null
  visibility: EventVisibility
  status: EventStatus
  useTeams: 'true' | 'false'
}>

export type SpeedSkydivingCompetitionMutation = UseMutationResult<
  AxiosResponse<SerializedData>,
  AxiosError<Record<string, string[]>>,
  EventVariables
>

const deserialize = (event: SerializedData): SpeedSkydivingCompetition => ({
  ...event,
  startsAt: parseISO(event.startsAt),
  createdAt: parseISO(event.createdAt),
  updatedAt: parseISO(event.updatedAt)
})

const endpoint = '/api/v1/speed_skydiving_competitions'

const queryKey = (id: number): QueryKey => ['speedSkydivingCompetitions', id]

const getEvent = (id: number) =>
  client
    .get<never, AxiosResponse<SerializedData>>(`${endpoint}/${id}`)
    .then(response => response.data)

const createEvent = (speedSkydivingCompetition: EventVariables) =>
  client.post<
    { speedSkydivingCompetition: EventVariables },
    AxiosResponse<SerializedData>
  >(endpoint, { speedSkydivingCompetition })

const updateEvent = (id: number, speedSkydivingCompetition: EventVariables) =>
  client.put<
    { speedSkydivingCompetition: EventVariables },
    AxiosResponse<SerializedData>
  >(`${endpoint}/${id}`, { speedSkydivingCompetition })

const buildQueryFn = (
  queryClient: QueryClient
): QueryFunction<SpeedSkydivingCompetition, QueryKey> => async ctx => {
  const [_key, id] = ctx.queryKey
  const data = await getEvent(id)

  if (data.placeId) {
    await queryClient.prefetchQuery(placeQuery(data.placeId, queryClient))
  }

  return deserialize(data)
}

export const speedSkydivingCompetitionQuery = (
  id: number,
  queryClient: QueryClient
): UseQueryOptions<
  SpeedSkydivingCompetition,
  AxiosError,
  SpeedSkydivingCompetition,
  QueryKey
> => ({
  queryKey: queryKey(id),
  queryFn: buildQueryFn(queryClient),
  enabled: Boolean(id)
})

export const preloadSpeedSkydivingCompetition = (
  id: number,
  queryClient: QueryClient
): Promise<void> =>
  queryClient.prefetchQuery(speedSkydivingCompetitionQuery(id, queryClient))

export const useSpeedSkydivingCompetitionQuery = (
  id: number
): UseQueryResult<SpeedSkydivingCompetition, AxiosError> => {
  const queryClient = useQueryClient()
  return useQuery(speedSkydivingCompetitionQuery(id, queryClient))
}

export const useNewSpeedSkydivingCompetitionMutation = (
  options: MutationOptions = {}
): SpeedSkydivingCompetitionMutation => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createEvent,
    onSuccess(response) {
      const event = deserialize(response.data)
      queryClient.setQueryData(queryKey(event.id), event)
      options.onSuccess?.(event)
    }
  })
}

export const useEditSpeedSkydivingCompetitionMutation = (
  eventId: number,
  options: MutationOptions = {}
): SpeedSkydivingCompetitionMutation => {
  const queryClient = useQueryClient()

  const mutationFn = (data: EventVariables) => updateEvent(eventId, data)

  return useMutation({
    mutationFn,
    onSuccess(response) {
      const event = deserialize(response.data)
      queryClient.setQueryData(queryKey(eventId), event)
      options.onSuccess?.(event)
    }
  })
}
