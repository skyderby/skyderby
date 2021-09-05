import {
  QueryClient,
  QueryFunction,
  useQuery,
  UseQueryOptions,
  UseQueryResult
} from 'react-query'
import axios from 'axios'
import parseISO from 'date-fns/parseISO'

type RequestOptions = {
  trimmed?: boolean
  originalFrequency?: boolean
}

export type PointRecord = {
  flTime: number
  absAltitude: number
  altitude: number
  hSpeed: number
  vSpeed: number
  glideRatio: number
  verticalAccuracy: number
  latitude: number
  longitude: number
  gpsTime: Date
}

type RawPoint = Omit<PointRecord, 'gpsTime'> & { gpsTime: string }

type PointsQueryKey = ['trackPoints', number | undefined, RequestOptions]

export const pointsQueryKey = (
  id: number | undefined,
  opts: RequestOptions
): PointsQueryKey => ['trackPoints', id, opts]

const normalize = (point: RawPoint): PointRecord =>
  Object.assign(point, {
    gpsTime: parseISO(point.gpsTime)
  })

const getPoints = async (id: number, opts: RequestOptions): Promise<PointRecord[]> => {
  const queryString = Object.entries(opts).reduce((acc, [key, value]) => {
    acc.set(key, String(value))
    return acc
  }, new URLSearchParams())

  const url = `/api/v1/tracks/${id}/points?${queryString.toString()}`

  const points = await axios.get(url).then(response => response.data)

  points.map(normalize)

  return points
}

const queryFn: QueryFunction<PointRecord[], PointsQueryKey> = ctx => {
  const [_key, id, opts] = ctx.queryKey

  if (typeof id !== 'number') {
    throw new Error(`Expected track id to be a number, received ${typeof id}`)
  }

  return getPoints(id, opts)
}

export const pointsQuery = (
  id: number | undefined,
  opts: RequestOptions = {}
): UseQueryOptions<PointRecord[], Error, PointRecord[], PointsQueryKey> => ({
  queryKey: pointsQueryKey(id, opts),
  queryFn,
  enabled: Boolean(id)
})

export const preloadPoints = (
  queryClient: QueryClient,
  id: number,
  opts: RequestOptions = {}
): Promise<void> => queryClient.prefetchQuery(pointsQuery(id, opts))

export const useTrackPointsQuery = (
  id: number | undefined,
  opts: RequestOptions = {}
): UseQueryResult<PointRecord[]> => useQuery(pointsQuery(id, opts))
