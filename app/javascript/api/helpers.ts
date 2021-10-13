import axios, { AxiosResponse } from 'axios'

export type IndexResponse<
  Type = never,
  Relations = undefined
> = (Relations extends undefined
  ? { relations?: Record<string, never[]> }
  : { relations: Relations }) & {
  items: Type[]
  currentPage: number
  totalPages: number
}

export type EmptyResponse = {
  items: never[]
  currentPage: number
  totalPages: number
}

interface DepaginateParams {
  page?: number
  perPage: number
}

export async function loadIds<Type, Relations = undefined>(
  indexEndpoint: string,
  ids: number[]
): Promise<IndexResponse<Type, Relations> | EmptyResponse> {
  const uniqueIds = Array.from(new Set(ids.filter(Boolean)))

  if (uniqueIds.length === 0) return { items: [], currentPage: 1, totalPages: 1 }

  const params = uniqueIds.reduce((acc, id) => {
    acc.append('ids[]', String(id))
    return acc
  }, new URLSearchParams())

  params.set('perPage', String(uniqueIds.length))

  const { data } = await axios.get<never, AxiosResponse<IndexResponse<Type, Relations>>>(
    `${indexEndpoint}?${params.toString()}`
  )

  return data
}

export async function depaginate<Type = never, Relations = undefined>(
  buildUrl: (params: DepaginateParams) => string,
  perPage = 100
): Promise<IndexResponse<Type, Relations>[]> {
  const { data: firstChunk } = await axios.get<
    never,
    AxiosResponse<IndexResponse<Type, Relations>>
  >(buildUrl({ perPage }))

  const restPages = new Array(firstChunk.totalPages - 1)
    .fill(undefined)
    .map((_el, idx) => idx + 2)

  const restChunks = await Promise.all(
    restPages.map(async page => {
      const { data } = await axios.get(buildUrl({ page, perPage }))
      return data
    })
  )

  return [firstChunk, ...restChunks]
}

export function urlWithParams(
  endpoint: string,
  params: Record<string, string | number | boolean> = {}
): string {
  const urlParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    urlParams.set(key, String(value))
  })

  return `${endpoint}?${urlParams.toString()}`
}
