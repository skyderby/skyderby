import axios from 'axios'
import parseISO from 'date-fns/parseISO'
import { useQuery } from 'react-query'

const normalize = point => {
  point.actualOn = parseISO(point.actualOn)
}

const getWindData = async id => {
  const dataUrl = `/api/v1/tracks/${id}/weather_data`
  const { data } = await axios.get(dataUrl)

  data.forEach(normalize)

  return data
}

const queryFn = ctx => {
  const [_key, id] = ctx.queryKey
  return getWindData(id)
}

const getQueryOptions = id => ({
  queryKey: ['trackWindData', id],
  queryFn,
  enabled: !!id
})

export const preloadWindData = (queryClient, id) =>
  queryClient.prefetchQuery(getQueryOptions(id))

export const useTrackWindDataQuery = id => useQuery(getQueryOptions(id))
