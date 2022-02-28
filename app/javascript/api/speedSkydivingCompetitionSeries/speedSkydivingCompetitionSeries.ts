import {
  QueryClient,
  QueryFunction,
  useQuery,
  useQueryClient,
  UseQueryOptions
} from 'react-query'
import client, { AxiosError, AxiosResponse } from 'api/client'
import { EventStatus, EventVisibility } from 'api/events'
import { parseISO } from 'date-fns'
import { cachePlaces, PlaceRecord } from 'api/places'
import { CountryRecord } from 'api/countries'
import { SpeedSkydivingCompetition } from 'api/speedSkydivingCompetitions'

type QueryKey = ['speedSkydivingCompetitionSeries', number]

type EventRelations = {
  competitions: SpeedSkydivingCompetition[]
  places: PlaceRecord[]
  countries: CountryRecord[]
}

export interface SpeedSkydivingCompetitionSeries {
  id: number
  name: string
  competitionIds: number[]
  placeIds: number[]
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
    .get<never, AxiosResponse<SerializedData & { relations: EventRelations }>>(
      `${endpoint}/${id}`
    )
    .then(response => response.data)

const queryKey = (id: number): QueryKey => ['speedSkydivingCompetitionSeries', id]

const queryFn = (
  queryClient: QueryClient
): QueryFunction<SpeedSkydivingCompetitionSeries, QueryKey> => async ctx => {
  const [_key, id] = ctx.queryKey
  const { relations, ...data } = await getEvent(id)

  if (relations) {
    cachePlaces(relations.places, queryClient)
  }

  return deserialize(data)
}

const speedSkydivingCompetitionSeriesQuery = (
  id: number,
  queryClient: QueryClient
): UseQueryOptions<
  SpeedSkydivingCompetitionSeries,
  AxiosError,
  SpeedSkydivingCompetitionSeries,
  QueryKey
> => ({
  queryKey: queryKey(id),
  queryFn: queryFn(queryClient)
})

export const useSpeedSkydivingCompetitionSeriesQuery = (id: number) => {
  const queryClient = useQueryClient()

  return useQuery(speedSkydivingCompetitionSeriesQuery(id, queryClient))
}
