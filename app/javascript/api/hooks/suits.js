import axios from 'axios'
import { useQuery, useQueryClient } from 'react-query'

import {
  getQueryOptions as getManufacturerQueryOptions,
  preloadManufacturers
} from 'api/hooks/manufacturer'
import { loadIds } from 'api/helpers'

const endpoint = '/api/v1/suits'

const getSuit = id => axios.get(`${endpoint}/${id}`)

const getSuitsById = ids => loadIds(endpoint, ids)

const getQueryKey = id => ['suits', id]

const buildQueryFn = queryClient => async ctx => {
  const [_key, id] = ctx.queryKey
  const { data } = await getSuit(id)

  await queryClient.prefetchQuery(getManufacturerQueryOptions(data.makeId))

  return data
}

export const preloadSuits = async (ids, queryClient) => {
  const missingIds = ids
    .filter(Boolean)
    .filter(id => !queryClient.getQueryData(getQueryKey(id)))

  if (missingIds.length === 0) return

  const { items: suits } = await getSuitsById(missingIds)

  suits.forEach(suit => queryClient.setQueryData(getQueryKey(suit.id), suit))

  await preloadManufacturers(
    suits.map(place => place.makeId),
    queryClient
  )

  return suits
}

export const getQueryOptions = (id, queryClient) => ({
  queryKey: getQueryKey(id),
  queryFn: buildQueryFn(queryClient),
  enabled: !!id,
  cacheTime: 60 * 30 * 1000,
  staleTime: 60 * 10 * 1000
})

export const useSuitQuery = id => {
  const queryClient = useQueryClient()
  return useQuery(getQueryOptions(id, queryClient))
}
