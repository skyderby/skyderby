import { useQuery, useQueryClient } from 'react-query'
import axios from 'axios'

import { preloadManufacturers } from 'api/hooks/manufacturer'
import { getQueryKey as getSuitQueryKey } from './suit'

const endpoint = '/api/v1/suits'

const buildUrl = (params = {}) => {
  const urlParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    urlParams.set(key, value)
  })

  return `${endpoint}?${urlParams.toString()}`
}

const getAllSuits = async () => {
  const perPage = 100
  const { data: firstChunk } = await axios.get(buildUrl({ perPage }))

  const restPages = new Array(firstChunk.totalPages - 1).fill().map((_el, idx) => idx + 2)

  const restChunks = await Promise.all(
    restPages.map(async page => {
      const { data } = await axios.get(buildUrl({ page, perPage }))
      return data
    })
  )

  const allChunks = [firstChunk, ...restChunks]

  return allChunks.map(chunk => chunk.items).flat()
}

const getSuits = params => axios.get(buildUrl(params))

const getQueryKey = params => ['suits', params].filter(Boolean)

const cacheSuits = (suits, queryClient) =>
  suits
    .filter(suit => !queryClient.getQueryData(getSuitQueryKey(suit.id)))
    .forEach(suit => queryClient.setQueryData(getSuitQueryKey(suit.id), suit))

const buildAllSuitsQueryFn = queryClient => async () => {
  const suits = await getAllSuits()

  const makeIds = suits.map(suit => suit.makeId)
  await preloadManufacturers(countryIds, queryClient)

  cacheSuits(suits, queryClient)

  return suits
}

const buildSuitsQueryFn = queryClient => async ctx => {
  const [_key, params] = ctx.queryKey
  const { data } = await getSuits(params)

  const suits = data?.items ?? []

  const makeIds = suits.map(suit => suit.makeId)
  await preloadManufacturers(makeIds, queryClient)

  cacheSuits(suits, queryClient)

  return data
}

const cacheOptions = {
  cacheTime: 60 * 30 * 1000,
  staleTime: 60 * 10 * 1000
}

export const suitsQuery = (params, queryClient) => ({
  queryKey: getQueryKey(params),
  queryFn: buildSuitsQueryFn(queryClient),
  ...cacheOptions
})

export const useAllSuitsQuery = () => {
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: getQueryKey(),
    queryFn: buildAllSuitsQueryFn(queryClient),
    ...cacheOptions
  })
}
