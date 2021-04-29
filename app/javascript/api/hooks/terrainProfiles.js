import { useQuery, useQueryClient } from 'react-query'
import axios from 'axios'
import { preloadPlaces } from 'api/hooks/places'

const endpoint = '/api/v1/terrain_profiles'

const getTerrainProfiles = () => axios.get(endpoint)
const getTerrainProfile = id => axios.get(`${endpoint}/${id}`)

const getItemQueryKey = id => ['terrainProfiles', id]

const buildIndexQueryFn = queryClient => async () => {
  const { data } = await getTerrainProfiles()
  data.items.forEach(item => queryClient.setQueryData(getItemQueryKey(item.id), item))

  await preloadPlaces(data.items.map(el => el.placeId).filter(Boolean), queryClient)

  return data
}

const buildItemQueryFn = queryClient => async ctx => {
  const [_key, id] = ctx.queryKey
  const { data } = await getTerrainProfile(id)

  await preloadPlaces([data.placeId], queryClient)

  return data
}

const options = {
  staleTime: 15 * 60 * 1000
}

export const getIndexQueryOptions = queryClient => ({
  queryKey: ['terrainProfiles'],
  queryFn: buildIndexQueryFn(queryClient),
  ...options
})

export const useTerrainProfilesQuery = () => {
  const queryClient = useQueryClient()

  return useQuery(getIndexQueryOptions(queryClient))
}

export const useTerrainProfileQuery = id => {
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: getItemQueryKey(id),
    queryFn: buildItemQueryFn(queryClient)
  })
}
