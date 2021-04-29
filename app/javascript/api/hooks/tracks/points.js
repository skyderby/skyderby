import { useQuery } from 'react-query'
import axios from 'axios'
import parseISO from 'date-fns/parseISO'

const normalize = point => {
  point.gpsTime = parseISO(point.gpsTime)
}

const getPoints = async (id, opts = {}) => {
  const queryString = Object.entries(opts).reduce((acc, [key, value]) => {
    acc.set(key, value)
    return acc
  }, new URLSearchParams())

  const url = `/api/v1/tracks/${id}/points?${queryString.toString()}`

  const { data } = await axios.get(url)

  data.forEach(normalize)

  return data
}

const queryFn = ctx => {
  const [_key, id, opts] = ctx.queryKey
  return getPoints(id, opts)
}

const getQueryOptions = (id, opts) => ({
  queryKey: queryKey(id, opts),
  queryFn,
  enabled: !!id
})

export const queryKey = (id, opts) => ['trackPoints', id, opts]

export const preloadPoints = (queryClient, id, opts) =>
  queryClient.prefetchQuery(getQueryOptions(id, opts))

export const useTrackPointsQuery = (id, opts) => useQuery(getQueryOptions(id, opts))
