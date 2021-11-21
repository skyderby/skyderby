import {
  QueryClient,
  QueryFunction,
  useMutation,
  UseMutationResult,
  useQuery,
  useQueryClient,
  UseQueryOptions,
  UseQueryResult
} from 'react-query'
import axios, { AxiosError, AxiosResponse } from 'axios'
import { parseISO } from 'date-fns'

import { getCSRFToken } from 'utils/csrfToken'
import { placeQuery } from 'api/places'
import { SpeedSkydivingCompetition } from 'api/speedSkydivingCompetitions/types'

type QueryKey = ['speedSkydivingCompetitions', number]

interface MutationOptions {
  onSuccess?: (data?: SpeedSkydivingCompetition) => unknown
}

type SerializedData = {
  [K in keyof SpeedSkydivingCompetition]: SpeedSkydivingCompetition[K] extends Date
    ? string
    : SpeedSkydivingCompetition[K]
}

type EventVariables = Partial<SpeedSkydivingCompetition>

const deserialize = (event: SerializedData): SpeedSkydivingCompetition => ({
  ...event,
  startsAt: parseISO(event.startsAt),
  createdAt: parseISO(event.createdAt),
  updatedAt: parseISO(event.updatedAt)
})

const endpoint = '/api/v1/speed_skydiving_competitions'

const queryKey = (id: number): QueryKey => ['speedSkydivingCompetitions', id]

const getEvent = (id: number) =>
  axios
    .get<never, AxiosResponse<SerializedData>>(`${endpoint}/${id}`)
    .then(response => response.data)

const createEvent = (speedSkydivingCompetition: EventVariables) =>
  axios.post<
    { speedSkydivingCompetition: EventVariables },
    AxiosResponse<SerializedData>
  >(
    endpoint,
    { speedSkydivingCompetition },
    { headers: { 'X-CSRF-Token': getCSRFToken() } }
  )

const updateEvent = (id: number, speedSkydivingCompetition: EventVariables) =>
  axios.put<{ speedSkydivingCompetition: EventVariables }, AxiosResponse<SerializedData>>(
    `${endpoint}/${id}`,
    { speedSkydivingCompetition },
    { headers: { 'X-CSRF-Token': getCSRFToken() } }
  )

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
  enabled: !!id
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
): UseMutationResult<AxiosResponse<SerializedData>, AxiosError, EventVariables> => {
  const queryClient = useQueryClient()

  return useMutation(createEvent, {
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
): UseMutationResult<AxiosResponse<SerializedData>, AxiosError, EventVariables> => {
  const queryClient = useQueryClient()

  const mutateFn = (data: EventVariables) => updateEvent(eventId, data)

  return useMutation(mutateFn, {
    onSuccess(response) {
      queryClient.setQueryData(queryKey(eventId), response.data)
      options.onSuccess?.()
    }
  })
}
