import { z } from 'zod'
import { trackActivitiesEnum } from 'api/tracks'
import { suitCategoriesEnum } from 'api/suits'

const tasks = [
  'time',
  'distance',
  'speed',
  'distance_in_time',
  'distance_in_altitude',
  'flare',
  'base_race'
] as const
const tasksEnum = z.enum(tasks)
const defaultView = z.enum(['default_overall', 'default_last_year'])

export const onlineRankingSchema = z.object({
  id: z.number(),
  name: z.string(),
  featured: z.boolean(),
  groupId: z.number(),
  placeId: z.number().nullable(),
  finishLineId: z.number().nullable(),
  jumpsKind: trackActivitiesEnum,
  suitsKind: suitCategoriesEnum.nullable(),
  discipline: tasksEnum,
  disciplineParameter: z.number().nullable(),
  defaultView,
  displayHighestSpeed: z.boolean(),
  displayHighestGr: z.boolean(),
  periodFrom: z.coerce.date(),
  periodTo: z.coerce.date(),
  intervalType: z.enum(['annual', 'custom_intervals']),
  years: z.array(z.number()),
  intervals: z.array(
    z.object({
      name: z.string(),
      slug: z.string()
    })
  ),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  permissions: z.object({
    canEdit: z.boolean()
  })
})

export type OnlineRanking = z.infer<typeof onlineRankingSchema>

export const collectionEndpoint = '/api/v1/online_rankings'
export const elementEndpoint = (id: number) => `${collectionEndpoint}/${id}`
