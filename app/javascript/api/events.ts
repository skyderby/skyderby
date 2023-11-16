import {
  QueryClient,
  QueryFunction,
  useQuery,
  useQueryClient,
  UseQueryResult,
  keepPreviousData
} from '@tanstack/react-query'
import client from 'api/client'

import { cachePlaces, Place } from 'api/places'
import { cacheCountries, CountryRecord } from 'api/countries'
import parseISO from 'date-fns/parseISO'

const endpoint = '/api/v1/events'

type IndexParams = {
  page?: number
  perPage?: number
}

export type EventType =
  | 'speedSkydivingCompetition'
  | 'performanceCompetition'
  | 'hungaryBoogie'
  | 'tournament'
  | 'competitionSeries'

export const eventStatuses = ['draft', 'published', 'finished', 'surprise'] as const
export type EventStatus = typeof eventStatuses[number]

export const eventVisibilities = [
  'public_event',
  'unlisted_event',
  'private_event'
] as const
export type EventVisibility = typeof eventVisibilities[number]

export type EventIndexRecord = {
  id: number
  type: EventType
  name: string
  active: boolean
  startsAt: Date
  status: EventStatus
  visibility: EventVisibility
  responsibleId: number
  placeId: number
  competitorsCount: Record<string, number>[]
  countryIds: number[]
  rangeFrom?: number
  rangeTo?: number
  isOfficial: boolean
  updatedAt: Date
  createdAt: Date
}

type RawEventIndexRecord = Omit<
  EventIndexRecord,
  'starts_at' | 'created_at' | 'updated_at'
> & {
  startsAt: string
  updatedAt: string
  createdAt: string
}

type EventRelations = {
  places: Place[]
  countries: CountryRecord[]
}

type EventsIndex<T = EventIndexRecord> = {
  items: T[]
  currentPage: number
  totalPages: number
  permissions: {
    canCreate: boolean
  }
}

type EventsQueryKey = ['events', IndexParams]

export const mapParamsToUrl = ({ page }: IndexParams): string => {
  const params = new URLSearchParams()
  params.set('page', String(page))

  return params.toString() === '' ? '' : '?' + params.toString()
}

export const extractParamsFromUrl = (urlSearch: string): IndexParams => {
  const params = new URLSearchParams(urlSearch)
  const page = Number(params.get('page')) || 1

  return { page }
}

const getEvents = ({
  page = 1,
  perPage = 7
}: IndexParams): Promise<
  EventsIndex<RawEventIndexRecord> & { relations: EventRelations }
> => {
  const urlParams = new URLSearchParams()
  urlParams.set('page', String(page))
  urlParams.set('perPage', String(perPage))

  const url = [endpoint, urlParams.toString()].join('?')

  return client.get(url).then(response => response.data)
}

const buildQueryFn = (
  queryClient: QueryClient
): QueryFunction<EventsIndex, EventsQueryKey> => async ctx => {
  const [_key, params] = ctx.queryKey
  const { items: rawItems, relations, ...rest } = await getEvents(params)

  cachePlaces(relations.places, queryClient)
  cacheCountries(relations.countries, queryClient)

  const items = rawItems.map(record =>
    Object.assign(record, {
      startsAt: parseISO(record.startsAt),
      createdAt: parseISO(record.createdAt),
      updatedAt: parseISO(record.updatedAt)
    })
  )

  return { items, ...rest }
}

export const useEventsQuery = (params: IndexParams = {}): UseQueryResult<EventsIndex> => {
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: ['events', params],
    queryFn: buildQueryFn(queryClient),
    placeholderData: keepPreviousData
  })
}
