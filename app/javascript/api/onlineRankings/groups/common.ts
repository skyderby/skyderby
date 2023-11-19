import { z } from 'zod'
import queryClient from 'components/queryClient'

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

export type OnlineRankingGroup = z.infer<typeof onlineRankingGroupSchema>

export const recordQueryKey = (id: number): RecordQueryKey => ['onlineRankingGroups', id]

export const cacheGroups = (groups: OnlineRankingGroup[]): void =>
  groups
    .filter(group => !queryClient.getQueryData(recordQueryKey(group.id)))
    .forEach(group =>
      queryClient.setQueryData<OnlineRankingGroup>(recordQueryKey(group.id), group)
    )
