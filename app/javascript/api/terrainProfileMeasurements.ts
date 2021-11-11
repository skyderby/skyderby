import { QueryFunction, useQuery, UseQueryOptions, UseQueryResult } from 'react-query'
import axios from 'axios'

export type MeasurementRecord = {
  altitude: number
  distance: number
}

type RecordQueryKey = ['terrainProfileMeasurements', number | undefined]

const getMeasurement = (id: number): Promise<MeasurementRecord[]> =>
  axios.get(`/api/v1/terrain_profiles/${id}/measurements`).then(response => response.data)

const recordQueryKey = (id: number | undefined): RecordQueryKey => [
  'terrainProfileMeasurements',
  id
]

const queryFn: QueryFunction<MeasurementRecord[]> = async ctx => {
  const [_key, id] = ctx.queryKey

  if (typeof id !== 'number') {
    throw new Error(`Expected terrain profile id to be a number, received ${typeof id}`)
  }

  return getMeasurement(id)
}

const measurementsQuery = (
  id: number | undefined
): UseQueryOptions<MeasurementRecord[], Error, MeasurementRecord[], RecordQueryKey> => ({
  queryKey: recordQueryKey(id),
  queryFn,
  enabled: Boolean(id),
  cacheTime: 30 * 60 * 1000,
  staleTime: 10 * 60 * 1000
})

export const useTerrainProfileMeasurementQuery = (
  id: number
): UseQueryResult<MeasurementRecord[]> => useQuery(measurementsQuery(id))
