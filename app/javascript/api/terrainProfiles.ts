import {
  QueryClient,
  QueryFunction,
  useQuery,
  useQueryClient,
  UseQueryOptions,
  UseQueryResult
} from '@tanstack/react-query'
import client from 'api/client'
import { cachePlaces, Place } from 'api/places'

type TerrainProfileRecord = {
  id: number
  placeId: number
  name: string
}

type TerrainProfilesIndex = {
  items: TerrainProfileRecord[]
  relations: {
    places: Place[]
  }
}

const endpoint = '/api/v1/terrain_profiles'

const getTerrainProfiles = (): Promise<TerrainProfilesIndex> =>
  client.get(endpoint).then(response => response.data)

const recordQueryKey = (id: number) => ['terrainProfiles', id]
const indexQueryKey = ['terrainProfiles']

const cacheTerrainProfiles = (
  terrainProfiles: TerrainProfileRecord[],
  queryClient: QueryClient
) =>
  terrainProfiles.forEach(record =>
    queryClient.setQueryData<TerrainProfileRecord>(recordQueryKey(record.id), record)
  )

const buildIndexQueryFn = (
  queryClient: QueryClient
): QueryFunction<TerrainProfileRecord[]> => async () => {
  const data = await getTerrainProfiles()

  cacheTerrainProfiles(data.items, queryClient)
  cachePlaces(data.relations.places)

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
  options: Omit<
    UseQueryOptions<TerrainProfileRecord[], Error, Type>,
    'queryKey' | 'queryFn'
  > = {}
): UseQueryResult<Type> => {
  const queryClient = useQueryClient()

  return useQuery({
    ...terrainProfilesQuery<Type>(queryClient),
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
