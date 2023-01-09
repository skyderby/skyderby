import { parseISO } from 'date-fns'
import { QueryClient } from 'react-query'
import { Serialized } from 'api/helpers'

type RecordQueryKey = ['onlineRankingGroups', number]

export interface OnlineRankingGroup {
  id: number
  name: string
  createdAt: Date
  updatedAt: Date
}

export type SerializedOnlineRankingGroup = Serialized<OnlineRankingGroup>

export const recordQueryKey = (id: number): RecordQueryKey => ['onlineRankingGroups', id]

export const deserialize = (
  record: SerializedOnlineRankingGroup
): OnlineRankingGroup => ({
  ...record,
  createdAt: parseISO(record.createdAt),
  updatedAt: parseISO(record.updatedAt)
})

export const cacheGroups = (
  groups: SerializedOnlineRankingGroup[],
  queryClient: QueryClient
): void =>
  groups
    .filter(group => !queryClient.getQueryData(recordQueryKey(group.id)))
    .forEach(group =>
      queryClient.setQueryData(recordQueryKey(group.id), deserialize(group))
    )
