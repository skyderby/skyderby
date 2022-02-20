import { QueryFunction, useQuery, UseQueryOptions } from 'react-query'
import client, { AxiosError, AxiosResponse } from 'api/client'
import { EventStatus, EventVisibility } from 'api/events'
import { parseISO } from 'date-fns'

type QueryKey = ['speedSkydivingCompetitionSeries', number]

export interface SpeedSkydivingCompetitionSeries {
  id: number
  name: string
  startsAt: Date
  visibility: EventVisibility
  status: EventStatus
  createdAt: Date
  updatedAt: Date

  permissions: {
    canEdit: boolean
  }
}

type SerializedData = {
  [K in keyof SpeedSkydivingCompetitionSeries]: SpeedSkydivingCompetitionSeries[K] extends Date
    ? string
    : SpeedSkydivingCompetitionSeries[K]
}

const deserialize = (event: SerializedData): SpeedSkydivingCompetitionSeries => ({
  ...event,
  startsAt: parseISO(event.startsAt),
  createdAt: parseISO(event.createdAt),
  updatedAt: parseISO(event.updatedAt)
})

const endpoint = '/api/v1/speed_skydiving_competition_series'

const getEvent = (id: number) =>
  client
    .get<never, AxiosResponse<SerializedData>>(`${endpoint}/${id}`)
    .then(response => response.data)

const queryKey = (id: number): QueryKey => ['speedSkydivingCompetitionSeries', id]

const queryFn: QueryFunction<SpeedSkydivingCompetitionSeries, QueryKey> = async ctx => {
  const [_key, id] = ctx.queryKey
  const data = await getEvent(id)

  return deserialize(data)
}

const speedSkydivingCompetitionSeriesQuery = (
  id: number
): UseQueryOptions<
  SpeedSkydivingCompetitionSeries,
  AxiosError,
  SpeedSkydivingCompetitionSeries,
  QueryKey
> => ({
  queryKey: queryKey(id),
  queryFn
})

export const useSpeedSkydivingCompetitionSeriesQuery = (id: number) => {
  return useQuery(speedSkydivingCompetitionSeriesQuery(id))
}
