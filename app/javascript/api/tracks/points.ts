import {
  QueryClient,
  QueryFunction,
  useQuery,
  UseQueryOptions,
  UseQueryResult
} from 'react-query'
import client, { AxiosResponse } from 'api/client'
import parseISO from 'date-fns/parseISO'
import { AxiosError } from 'axios'

type RequestOptions = {
  trimmed?: boolean | { secondsBeforeStart: number }
  originalFrequency?: boolean
}

export type PointRecord = {
  gpsTime: Date
  flTime: number
  absAltitude: number
  altitude: number
  latitude: number
  longitude: number
  hSpeed: number
  vSpeed: number
  glideRatio: number
  verticalAccuracy: number
  speedAccuracy: number
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
    if (typeof value === 'object') {
      Object.entries(value).forEach(([nestedKey, nestedValue]) => {
        acc.set(`${key}[${nestedKey}]`, String(nestedValue))
      })
    } else {
      acc.set(key, String(value))
    }
    return acc
  }, new URLSearchParams())

  const url = `/api/v1/tracks/${id}/points?${queryString.toString()}`

  const points = await client
    .get<never, AxiosResponse<RawPoint[]>>(url)
    .then(response => response.data)

  return points.map(normalize)
}

const queryFn: QueryFunction<PointRecord[], PointsQueryKey> = ctx => {
  const [_key, id, opts] = ctx.queryKey

  if (typeof id !== 'number') {
    throw new Error(`Expected track id to be a number, received ${typeof id}`)
  }

  return getPoints(id, opts)
}

type QueryOptions = UseQueryOptions<
  PointRecord[],
  AxiosError,
  PointRecord[],
  PointsQueryKey
>

export const pointsQuery = (
  id: number | undefined,
  opts: RequestOptions = {}
): QueryOptions => ({
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
  requestOptions: RequestOptions = {},
  queryOptions: QueryOptions = {}
): UseQueryResult<PointRecord[]> =>
  useQuery({ ...pointsQuery(id, requestOptions), ...queryOptions })
