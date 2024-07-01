import { z } from 'zod'

export const elementEndpoint = (id: number) => `/api/v1/tournaments/${id}`

export const tournamentSchema = z.object({
  id: z.number(),
  name: z.string(),
  permissions: z.object({
    canEdit: z.boolean()
  })
})

export type QueryKey = ['tournaments', number]
export type Tournament = z.infer<typeof tournamentSchema>

export const queryKey = (id: number): QueryKey => ['tournaments', id]
