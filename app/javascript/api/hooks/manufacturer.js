import { useQuery } from 'react-query'
import axios from 'axios'
import { loadIds } from 'api/helpers'

const endpoint = '/api/v1/manufacturers'

const getManufacturer = id => axios.get(`${endpoint}/${id}`)

const getManufacturersById = ids => loadIds(endpoint, ids)

const getQueryKey = id => ['manufacturers', id]

const queryFn = async ctx => {
  const [_key, id] = ctx.queryKey
  const { data } = await getManufacturer(id)

  return data
}

export const preloadManufacturers = async (ids, queryClient) => {
  const missingIds = ids
    .filter(Boolean)
    .filter(id => !queryClient.getQueryData(getQueryKey(id)))

  if (missingIds.length === 0) return

  const { items: manufacturers } = await getManufacturersById(missingIds)
  manufacturers.forEach(manufacturer =>
    queryClient.setQueryData(getQueryKey(manufacturer.id), manufacturer)
  )

  return manufacturers
}

export const getQueryOptions = id => ({
  queryKey: getQueryKey(id),
  queryFn,
  enabled: !!id,
  cacheTime: 60 * 60 * 1000,
  staleTime: 30 * 60 * 1000
})

export const useManufacturerQuery = id => useQuery(getQueryOptions(id))
