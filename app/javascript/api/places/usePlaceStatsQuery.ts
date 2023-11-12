import { QueryFunction, useQuery } from '@tanstack/react-query'
import client from 'api/client'
import { AxiosResponse } from 'axios'
import { parseISO } from 'date-fns'

export type PlaceStats = {
  lastTrackRecordedAt: Date | null
  popularTimes: Record<string, { trackCount: number; peopleCount: number }>
}

type SerializedStats = Omit<PlaceStats, 'lastTrackRecordedAt'> & {
  lastTrackRecordedAt: string | null
}

type QueryKey = ['place', number, 'stats']

const endpoint = (placeId: number) => `/api/v1/places/${placeId}/stats`

const deserialize = (record: SerializedStats): PlaceStats => ({
  ...record,
  lastTrackRecordedAt: record.lastTrackRecordedAt
    ? parseISO(record.lastTrackRecordedAt)
    : null
})

const getPlaceStats = (placeId: number) =>
  client
    .get<never, AxiosResponse<SerializedStats>>(endpoint(placeId))
    .then(response => response.data)

const queryFn: QueryFunction<PlaceStats, QueryKey> = async ctx => {
  const [_key, placeId] = ctx.queryKey
  const data = await getPlaceStats(placeId)

  return deserialize(data)
}

const usePlaceStatsQuery = (placeId: number) =>
  useQuery({ queryKey: ['place', placeId, 'stats'], queryFn })

export default usePlaceStatsQuery
