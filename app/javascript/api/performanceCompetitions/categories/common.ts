import { parseISO } from 'date-fns'
import { Serialized } from 'api/helpers'

export type QueryKey = ['performanceCompetition', number, 'categories']

export interface Category {
  id: number
  name: string
  position: number
  createdAt: Date
  updatedAt: Date
}

export type SerializedCategory = Serialized<Category>

export type CategoryVariables = {
  name: string
}

export const endpoint = (eventId: number) =>
  `/api/v1/performance_competitions/${eventId}/categories`
export const categoryUrl = (eventId: number, id: number) => `${endpoint(eventId)}/${id}`
export const queryKey = (eventId: number) => [
  'performanceCompetition',
  eventId,
  'categories'
]

export const deserialize = (category: SerializedCategory): Category => ({
  ...category,
  createdAt: parseISO(category.createdAt),
  updatedAt: parseISO(category.updatedAt)
})
