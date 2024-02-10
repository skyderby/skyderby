import { z } from 'zod'

export type QueryKey = ['performanceCompetition', number, 'categories']

export const categorySchema = z.object({
  id: z.number(),
  name: z.string(),
  position: z.number()
})

export type Category = z.infer<typeof categorySchema>

export const categoriesIndexSchema = z.array(categorySchema)

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
