import axios from 'axios'

type EmptyResponse = {
  items: []
}

export async function loadIds<Type>(
  indexEndpoint: string,
  ids: number[]
): Promise<Type | EmptyResponse> {
  const uniqueIds = Array.from(new Set(ids.filter(Boolean)))

  if (uniqueIds.length === 0) return { items: [] }

  const params = uniqueIds.reduce((acc, id) => {
    acc.append('ids[]', String(id))
    return acc
  }, new URLSearchParams())

  params.set('perPage', String(uniqueIds.length))

  const { data } = await axios.get(`${indexEndpoint}?${params.toString()}`)

  return data
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
