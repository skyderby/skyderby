import axios from 'axios'

export const loadIds = async (indexEndpoint, ids) => {
  const uniqueIds = Array.from(new Set(ids.filter(Boolean)))

  if (uniqueIds.length === 0) return {}

  const params = uniqueIds.reduce((acc, id) => {
    acc.append('ids[]', id)
    return acc
  }, new URLSearchParams())

  params.set('perPage', uniqueIds.length)

  const { data } = await axios.get(`${indexEndpoint}?${params.toString()}`)

  return data
}

export const urlWithParams = (endpoint, params = {}) => {
  const urlParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    urlParams.set(key, value)
  })

  return `${endpoint}?${urlParams.toString()}`
}
