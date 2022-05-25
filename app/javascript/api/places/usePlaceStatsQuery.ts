import { QueryFunction, useQuery } from 'react-query'
import client from 'api/client'
import { AxiosResponse } from 'axios'
import { Serialized } from 'api/helpers'
import { parseISO } from 'date-fns'

export type PlaceStats = {
  lastTrackRecordedAt: Date
  popularTimes: Record<string, { trackCount: number; peopleCount: number }>
}

type QueryKey = ['place', number, 'stats']

const endpoint = (placeId: number) => `/api/v1/places/${placeId}/stats`

const deserialize = (record: Serialized<PlaceStats>): PlaceStats => ({
  ...record,
  lastTrackRecordedAt: parseISO(record.lastTrackRecordedAt)
})

const getPlaceStats = (placeId: number) =>
  client
    .get<never, AxiosResponse<Serialized<PlaceStats>>>(endpoint(placeId))
    .then(response => response.data)

const queryFn: QueryFunction<PlaceStats, QueryKey> = async ctx => {
  const [_key, placeId] = ctx.queryKey
  const data = await getPlaceStats(placeId)

  return deserialize(data)
}

const usePlaceStatsQuery = (placeId: number) =>
  useQuery({ queryKey: ['place', placeId, 'stats'], queryFn })

export default usePlaceStatsQuery
