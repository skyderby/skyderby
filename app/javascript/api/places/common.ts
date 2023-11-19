import { z } from 'zod'
import queryClient from 'components/queryClient'
import { countrySchema } from 'api/countries'

export const placeTypes = ['base', 'skydive'] as const
const placeTypesEnum = z.enum(placeTypes)
export type PlaceKind = z.infer<typeof placeTypesEnum>

const placePhotoSchema = z.object({
  id: z.number(),
  large: z.string(),
  thumb: z.string()
})

export const placeSchema = z.object({
  id: z.number(),
  name: z.string(),
  countryId: z.number(),
  msl: z.number().nullable(),
  kind: placeTypesEnum,
  latitude: z.number(),
  longitude: z.number(),
  permissions: z.object({
    canEdit: z.boolean()
  }),
  cover: z.string().optional(),
  photos: z.array(placePhotoSchema).optional()
})

export const placesIndexSchema = z.object({
  items: z.array(placeSchema),
  currentPage: z.number(),
  totalPages: z.number(),
  relations: z.object({
    countries: z.array(countrySchema)
  })
})

export type Place = z.infer<typeof placeSchema>
export type PlacesIndex = z.infer<typeof placesIndexSchema>

export type IndexParams = {
  search?: string
  page?: number
  perPage?: number
}

export type PlaceVariables = {
  name?: string
  countryId?: number | null
  msl?: number | null
  kind?: PlaceKind
  latitude?: number | null
  longitude?: number | null
}

export const collectionEndpoint = '/api/v1/places'
export const elementEndpoint = (id: number) => `${collectionEndpoint}/${id}`

export type RecordQueryKey = ['places', number | null | undefined]
export type IndexQueryKey = ['places', IndexParams]
export type AllPlacesQueryKey = ['places', 'all']

export const allPlacesQueryKey: AllPlacesQueryKey = ['places', 'all']
export const indexQueryKey = (params: IndexParams = {}): IndexQueryKey => [
  'places',
  params
]
export const recordQueryKey = (id: number | null | undefined): RecordQueryKey => [
  'places',
  id
]

export const cacheOptions = {
  gcTime: 60 * 30 * 1000,
  staleTime: 60 * 10 * 1000
}

export const buildUrl = (params: IndexParams = {}): string => {
  const urlParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    urlParams.set(key, String(value))
  })

  return `${collectionEndpoint}?${urlParams.toString()}`
}

export const cachePlaces = (places: Place[]): void =>
  places
    .filter(place => !queryClient.getQueryData(recordQueryKey(place.id)))
    .forEach(place => queryClient.setQueryData<Place>(recordQueryKey(place.id), place))
