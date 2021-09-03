import {
  QueryClient,
  QueryFunction,
  useQuery,
  useQueryClient,
  UseQueryOptions,
  UseQueryResult
} from 'react-query'
import axios from 'axios'
import { cachePlaces, PlaceRecord } from 'api/hooks/places'

type TerrainProfileRecord = {
  id: number
  placeId: number
  name: string
}

type TerrainProfilesIndex = {
  items: TerrainProfileRecord[]
  relations: {
    places: PlaceRecord[]
  }
}

const endpoint = '/api/v1/terrain_profiles'

const getTerrainProfiles = (): Promise<TerrainProfilesIndex> =>
  axios.get(endpoint).then(response => response.data)

const recordQueryKey = (id: number) => ['terrainProfiles', id]
const indexQueryKey = ['terrainProfiles']

const cacheTerrainProfiles = (
  terrainProfiles: TerrainProfileRecord[],
  queryClient: QueryClient
) =>
  terrainProfiles.forEach(record =>
    queryClient.setQueryData(recordQueryKey(record.id), record)
  )

const buildIndexQueryFn = (
  queryClient: QueryClient
): QueryFunction<TerrainProfileRecord[]> => async () => {
  const data = await getTerrainProfiles()

  cacheTerrainProfiles(data.items, queryClient)
  cachePlaces(data.relations.places, queryClient)

  return data.items
}

const options = {
  staleTime: 15 * 60 * 1000
}

export const terrainProfilesQuery = <Type = TerrainProfileRecord[]>(
  queryClient: QueryClient
): UseQueryOptions<TerrainProfileRecord[], Error, Type> => ({
  queryKey: indexQueryKey,
  queryFn: buildIndexQueryFn(queryClient),
  ...options
})

export const useTerrainProfilesQuery = <Type = TerrainProfileRecord[]>(
  options: UseQueryOptions<TerrainProfileRecord[], Error, Type> = {}
): UseQueryResult<Type> => {
  const queryClient = useQueryClient()

  return useQuery({
    ...terrainProfilesQuery(queryClient),
    ...options
  })
}

export const useTerrainProfileQuery = (
  id: number
): UseQueryResult<TerrainProfileRecord | undefined> => {
  return useTerrainProfilesQuery({
    select: data => data.find(record => record.id === id)
  })
}
