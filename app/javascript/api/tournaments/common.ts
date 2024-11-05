import { z } from 'zod'
import { competitorSchema } from './competitors'

export const elementEndpoint = (id: number) => `/api/web/tournaments/${id}`

const slotSchema = z.object({
  id: z.number(),
  competitorId: z.number(),
  trackId: z.number().nullable(),
  result: z.number().nullable(),
  isDisqualified: z.boolean(),
  notes: z.string().nullable()
})

const bracketSchema = z.object({
  id: z.number(),
  slots: z.array(slotSchema)
})

const roundSchema = z.object({
  id: z.number(),
  order: z.number(),
  brackets: z.array(bracketSchema)
})

export const tournamentSchema = z.object({
  id: z.number(),
  name: z.string(),
  competitors: z.array(competitorSchema),
  rounds: z.array(roundSchema),
  permissions: z.object({
    canEdit: z.boolean()
  })
})

export type QueryKey = ['tournaments', number]
export type Tournament = z.infer<typeof tournamentSchema>
export type Round = z.infer<typeof roundSchema>
export type Bracket = z.infer<typeof bracketSchema>
export type Slot = z.infer<typeof slotSchema>

export const queryKey = (id: number): QueryKey => ['tournaments', id]
