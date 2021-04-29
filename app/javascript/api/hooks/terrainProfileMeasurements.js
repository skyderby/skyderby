import { useQuery } from 'react-query'
import axios from 'axios'

const getMeasurement = id => axios.get(`/api/v1/terrain_profiles/${id}/measurements`)

const getQueryKey = id => ['terrainProfileMeasurements', id]

const queryFn = async ctx => {
  const [_key, id] = ctx.queryKey
  const { data } = await getMeasurement(id)

  return data
}

export const getQueryOptions = id => ({
  queryKey: getQueryKey(id),
  queryFn,
  enabled: !!id,
  cacheTime: 30 * 60 * 1000,
  staleTime: 10 * 60 * 1000
})

export const useTerrainProfileMeasurementQuery = id => useQuery(getQueryOptions(id))
