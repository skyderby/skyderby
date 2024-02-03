import { z } from 'zod'

export type QueryKey = ['speedSkydivingCompetitions', number, 'categories']

export const queryKey = (eventId: number): QueryKey => [
  'speedSkydivingCompetitions',
  eventId,
  'categories'
]

export const collectionEndpoint = (eventId: number) =>
  `/api/v1/speed_skydiving_competitions/${eventId}/categories`
export const elementEndpoint = (eventId: number, id: number) =>
  `${collectionEndpoint(eventId)}/${id}`

export const categorySchema = z.object({
  id: z.number(),
  name: z.string(),
  position: z.number(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date()
})

export const categoriesIndexSchema = z.array(categorySchema)

export type Category = z.infer<typeof categorySchema>
