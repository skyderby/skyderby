import { QueryFunction, useSuspenseQuery } from '@tanstack/react-query'
import { z } from 'zod'
import client from 'api/client'

import { cachePlaces, placeSchema } from 'api/places'
import { cacheCountries, countrySchema } from 'api/countries'

const endpoint = '/api/v1/events'

type IndexParams = {
  page?: number
  perPage?: number
}

const eventTypes = [
  'speedSkydivingCompetition',
  'performanceCompetition',
  'hungaryBoogie',
  'tournament',
  'competitionSeries'
] as const

export const eventStatuses = ['draft', 'published', 'finished', 'surprise'] as const

export const eventVisibilities = [
  'public_event',
  'unlisted_event',
  'private_event'
] as const

const eventTypesEnum = z.enum(eventTypes)
export type EventType = z.infer<typeof eventTypesEnum>

const eventStatusesEnum = z.enum(eventStatuses)
export type EventStatus = z.infer<typeof eventStatusesEnum>

const eventVisibilitiesEnum = z.enum(eventVisibilities)
export type EventVisibility = z.infer<typeof eventVisibilitiesEnum>

export const eventIndexRecordSchema = z.object({
  id: z.number(),
  type: eventTypesEnum,
  name: z.string(),
  active: z.boolean(),
  startsAt: z.string(),
  status: eventStatusesEnum,
  visibility: eventVisibilitiesEnum,
  responsibleId: z.number(),
  placeId: z.number(),
  competitorsCount: z.record(z.number()),
  countryIds: z.array(z.number()),
  rangeFrom: z.number().nullable(),
  rangeTo: z.number().nullable(),
  isOfficial: z.boolean(),
  updatedAt: z.coerce.date(),
  createdAt: z.coerce.date()
})

export type EventIndexRecord = z.infer<typeof eventIndexRecordSchema>

const indexResponseSchema = z.object({
  items: z.array(eventIndexRecordSchema),
  relations: z.object({
    places: z.array(placeSchema),
    countries: z.array(countrySchema)
  }),
  currentPage: z.number(),
  totalPages: z.number(),
  permissions: z.object({
    canCreate: z.boolean()
  })
})

type IndexResponse = z.infer<typeof indexResponseSchema>

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

const getEvents = ({ page = 1, perPage = 7 }: IndexParams) => {
  const urlParams = new URLSearchParams()
  urlParams.set('page', String(page))
  urlParams.set('perPage', String(perPage))

  const url = [endpoint, urlParams.toString()].join('?')

  return client.get(url).then(response => indexResponseSchema.parse(response.data))
}

const queryFn: QueryFunction<
  Omit<IndexResponse, 'relations'>,
  EventsQueryKey
> = async ctx => {
  const [_key, params] = ctx.queryKey
  const { relations, ...data } = await getEvents(params)

  cachePlaces(relations.places)
  cacheCountries(relations.countries)

  return data
}

const useEventsQuery = (params: IndexParams = {}) =>
  useSuspenseQuery({
    queryKey: ['events', params],
    queryFn
  })

export default useEventsQuery
