import axios, { AxiosResponse } from 'axios'
import parseISO from 'date-fns/parseISO'
import {
  QueryClient,
  QueryFunction,
  useQuery,
  UseQueryOptions,
  UseQueryResult
} from 'react-query'

export type WindDataRecord = {
  actualOn: Date
  altitude: number
  windSpeed: number
  windDirection: number
}

type RawRecord = Omit<WindDataRecord, 'actualOn'> & { actualOn: string }
type QueryKey = ['trackWindData', number | undefined]

const normalize = (point: RawRecord): WindDataRecord => ({
  ...point,
  actualOn: parseISO(point.actualOn)
})

const getWindData = async (id: number | undefined) => {
  const dataUrl = `/api/v1/tracks/${id}/weather_data`

  if (typeof id !== 'number') {
    throw new Error(`Expected track id to be a number, received ${typeof id}`)
  }

  const records = await axios
    .get<never, AxiosResponse<RawRecord[]>>(dataUrl)
    .then(response => response.data)

  return records.map(normalize)
}

const queryFn: QueryFunction<WindDataRecord[], QueryKey> = ctx => {
  const [_key, id] = ctx.queryKey
  return getWindData(id)
}

const windDataQuery = (
  id: number | undefined
): UseQueryOptions<WindDataRecord[], Error, WindDataRecord[], QueryKey> => ({
  queryKey: ['trackWindData', id],
  queryFn,
  enabled: !!id
})

export const preloadWindData = (
  queryClient: QueryClient,
  id: number | undefined
): Promise<void> => queryClient.prefetchQuery(windDataQuery(id))

export const useTrackWindDataQuery = (
  id: number | undefined
): UseQueryResult<WindDataRecord[]> => useQuery(windDataQuery(id))
