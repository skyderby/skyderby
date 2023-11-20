import { z } from 'zod'
import queryClient from 'components/queryClient'
import { tasksEnum } from 'api/onlineRankings/common'
import { suitCategoriesEnum } from 'api/suits'
import { profileSchema } from 'api/profiles'

type RecordQueryKey = ['onlineRankingGroups', number]

export const onlineRankingGroupSchema = z.object({
  id: z.number(),
  name: z.string(),
  cumulative: z.boolean(),
  featured: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  permissions: z.object({
    canEdit: z.boolean()
  })
})

const groupStandingsRowSchema = z.object({
  rank: z.number(),
  profileId: z.number(),
  results: z.record(
    tasksEnum,
    z.object({
      rank: z.number(),
      result: z.number(),
      points: z.number(),
      suitId: z.number(),
      trackId: z.number()
    })
  ),
  totalPoints: z.number()
})

const groupStandingsSchema = z.object({
  category: suitCategoriesEnum,
  rows: z.array(groupStandingsRowSchema)
})

export const groupStandingsResponseSchema = z.object({
  data: z.array(groupStandingsSchema),
  relations: z.object({
    profiles: z.array(profileSchema)
  })
})

export type OnlineRankingGroup = z.infer<typeof onlineRankingGroupSchema>
export type GroupStandingsRow = z.infer<typeof groupStandingsRowSchema>
export type GroupStandings = z.infer<typeof groupStandingsSchema>

export const recordQueryKey = (id: number): RecordQueryKey => ['onlineRankingGroups', id]

export const cacheGroups = (groups: OnlineRankingGroup[]): void =>
  groups
    .filter(group => !queryClient.getQueryData(recordQueryKey(group.id)))
    .forEach(group =>
      queryClient.setQueryData<OnlineRankingGroup>(recordQueryKey(group.id), group)
    )
