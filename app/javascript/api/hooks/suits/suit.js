import axios from 'axios'
import { useQuery, useQueryClient } from 'react-query'

import { preloadManufacturers } from 'api/hooks/manufacturer'
import { loadIds } from 'api/helpers'

const endpoint = '/api/v1/suits'

const getSuit = id => axios.get(`${endpoint}/${id}`)

const getSuitsById = ids => loadIds(endpoint, ids)

const buildQueryFn = queryClient => async ctx => {
  const [_key, id] = ctx.queryKey
  const { data } = await getSuit(id)

  await preloadManufacturers([data.makeId], queryClient)

  return data
}

export const getQueryKey = id => ['suits', id]

export const cacheSuits = (suits, queryClient) =>
  suits.forEach(suit => queryClient.setQueryData(getQueryKey(suit.id), suit))

export const preloadSuits = async (ids, queryClient) => {
  const missingIds = ids
    .filter(Boolean)
    .filter(id => !queryClient.getQueryData(getQueryKey(id)))

  if (missingIds.length === 0) return

  const { items: suits } = await getSuitsById(missingIds)
  cacheSuits(suits, queryClient)

  await preloadManufacturers(
    suits.map(place => place.makeId),
    queryClient
  )

  return suits
}

const suitQuery = (id, queryClient) => ({
  queryKey: getQueryKey(id),
  queryFn: buildQueryFn(queryClient),
  enabled: !!id,
  cacheTime: 60 * 30 * 1000,
  staleTime: 60 * 10 * 1000
})

export const useSuitQuery = (id, options = {}) => {
  const queryClient = useQueryClient()
  return useQuery({ ...suitQuery(id, queryClient), ...options })
}
